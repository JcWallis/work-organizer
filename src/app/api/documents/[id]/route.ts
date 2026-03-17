import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateDocumentSchema } from "@/lib/validators/document";


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { workItem: { select: { id: true, title: true } } },
  });

  if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(document);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  const body = await req.json();
  const parsed = updateDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const document = await prisma.document.update({ where: { id }, data: parsed.data });
  return NextResponse.json(document);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  await prisma.document.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
