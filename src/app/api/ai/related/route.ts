import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entityId } = await req.json();
  if (!entityId) return NextResponse.json({ error: "entityId required" }, { status: 400 });

  const current = await prisma.workItem.findUnique({ where: { id: entityId } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check cache (24h)
  const meta = (current.metadata as Record<string, unknown>) || {};
  const cachedAt = meta.relatedCachedAt as string | undefined;
  if (cachedAt && Date.now() - new Date(cachedAt).getTime() < 24 * 60 * 60 * 1000) {
    return NextResponse.json({ relatedIds: meta.relatedIds || [] });
  }

  const allItems = await prisma.workItem.findMany({
    where: { id: { not: entityId } },
    select: { id: true, title: true, tags: true, type: true },
    take: 50,
  });

  if (allItems.length === 0) return NextResponse.json({ relatedIds: [] });

  const listText = allItems
    .map((i) => `${i.id}: ${i.title} [${i.type}] tags: ${i.tags.join(",")}`)
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Current item: "${current.title}" (${current.type}) tags: ${current.tags.join(",")}

Other items:
${listText}

Return the IDs of the 3 most related items as a JSON array of strings. Only return the JSON array, nothing else.`,
      },
    ],
  });

  let relatedIds: string[] = [];
  try {
    const text =
      message.content[0].type === "text" ? message.content[0].text.trim() : "[]";
    relatedIds = JSON.parse(text);
  } catch {
    relatedIds = [];
  }

  await prisma.workItem.update({
    where: { id: entityId },
    data: {
      metadata: { ...meta, relatedIds, relatedCachedAt: new Date().toISOString() },
    },
  });

  return NextResponse.json({ relatedIds });
}
