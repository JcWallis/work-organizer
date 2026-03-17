import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateWorkItemSchema } from "@/lib/validators/work-item";


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  const workItem = await prisma.workItem.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { updatedAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!workItem) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(workItem);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  const body = await req.json();
  const parsed = updateWorkItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { metadata, ...rest } = parsed.data;
  const workItem = await prisma.workItem.update({
    where: { id },
    data: { ...rest, ...(metadata ? { metadata: metadata as never } : {}) },
  });
  return NextResponse.json(workItem);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  await prisma.workItem.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
