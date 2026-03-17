import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createWorkItemSchema } from "@/lib/validators/work-item";


export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  const workItems = await prisma.workItem.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(type ? { type: type as never } : {}),
    },
    include: {
      _count: { select: { tasks: true, notes: true, documents: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(workItems);
}

export async function POST(req: NextRequest) {

  const body = await req.json();
  const parsed = createWorkItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { metadata, ...rest } = parsed.data;
  const workItem = await prisma.workItem.create({
    data: { ...rest, ...(metadata ? { metadata: metadata as never } : {}) },
  });
  return NextResponse.json(workItem, { status: 201 });
}
