import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateNoteSchema } from "@/lib/validators/note";


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  const note = await prisma.note.findUnique({
    where: { id },
    include: { workItem: { select: { id: true, title: true } } },
  });

  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(note);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  const body = await req.json();
  const parsed = updateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const note = await prisma.note.update({ where: { id }, data: parsed.data });
  return NextResponse.json(note);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  await prisma.note.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
