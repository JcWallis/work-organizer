import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validators/task";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workItemId = searchParams.get("workItemId");
  const completed = searchParams.get("completed");

  const tasks = await prisma.task.findMany({
    where: {
      ...(workItemId ? { workItemId } : {}),
      ...(completed !== null ? { completed: completed === "true" } : {}),
    },
    include: { workItem: { select: { id: true, title: true } } },
    orderBy: [{ completed: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const task = await prisma.task.create({ data: parsed.data });
  return NextResponse.json(task, { status: 201 });
}
