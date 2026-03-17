import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { context } = await req.json();
  if (!context) return NextResponse.json({ error: "context required" }, { status: 400 });

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [
      {
        role: "user",
        content: `You are a concise helper for a personal workspace app. Explain this in 1-2 sentences max:\n\n"${context}"`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return NextResponse.json({ text });
}
