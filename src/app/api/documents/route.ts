import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDocumentSchema } from "@/lib/validators/document";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workItemId = searchParams.get("workItemId");

  const documents = await prisma.document.findMany({
    where: workItemId ? { workItemId } : {},
    include: { workItem: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const document = await prisma.document.create({ data: parsed.data });
  return NextResponse.json(document, { status: 201 });
}
