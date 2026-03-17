import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";


export async function POST(req: NextRequest) {

  const { entityType, entityId } = await req.json();
  if (!entityType || !entityId) {
    return NextResponse.json({ error: "entityType and entityId required" }, { status: 400 });
  }

  let context = "";
  let entity: Record<string, unknown> | null = null;

  if (entityType === "work_item") {
    entity = await prisma.workItem.findUnique({
      where: { id: entityId },
      include: {
        tasks: { where: { completed: false }, take: 5 },
        notes: { take: 3, orderBy: { updatedAt: "desc" } },
      },
    }) as Record<string, unknown> | null;
    if (!entity) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const tasks = entity.tasks as Array<{ title: string }>;
    const notes = entity.notes as Array<{ title: string }>;
    context = `Work Item: "${entity.title}" (${entity.type}, ${entity.status})
Description: ${entity.description || "None"}
Tags: ${(entity.tags as string[]).join(", ") || "None"}
Open tasks: ${tasks.map((t) => t.title).join(", ") || "None"}
Recent notes: ${notes.map((n) => n.title).join(", ") || "None"}`;
  } else if (entityType === "task") {
    entity = await prisma.task.findUnique({
      where: { id: entityId },
      include: { workItem: { select: { title: true, description: true } } },
    }) as Record<string, unknown> | null;
    if (!entity) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const workItem = entity.workItem as { title: string; description?: string } | null;
    context = `Task: "${entity.title}" (${entity.priority} priority, ${entity.completed ? "completed" : "open"})
Description: ${entity.description || "None"}
Parent project: ${workItem?.title || "None"}`;
  }

  const prompt = `You are a personal productivity assistant helping organize a personal workspace.

Context:
${context}

Provide 3-5 specific, actionable next steps. Be concrete. Format as a numbered list. Keep each step under 25 words.`;

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let fullText = "";
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          fullText += event.delta.text;
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();

      // Cache result and log
      const usage = await stream.finalMessage();
      const tokensUsed = usage.usage.input_tokens + usage.usage.output_tokens;

      await Promise.all([
        entityType === "work_item"
          ? prisma.workItem.update({ where: { id: entityId }, data: { aiNextSteps: fullText } })
          : prisma.task.update({ where: { id: entityId }, data: { aiHint: fullText } }),
        prisma.aIInteraction.create({
          data: { featureType: "suggestion", entityType, entityId, prompt, response: fullText, tokensUsed },
        }),
      ]);
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
  });
}
