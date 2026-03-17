import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) return NextResponse.json([]);

  const lower = `%${q.toLowerCase()}%`;

  const [workItems, tasks, notes, documents] = await Promise.all([
    prisma.workItem.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      },
      select: { id: true, title: true, type: true, status: true, updatedAt: true },
      take: 10,
    }),
    prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, completed: true, priority: true, updatedAt: true },
      take: 10,
    }),
    prisma.note.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, updatedAt: true },
      take: 10,
    }),
    prisma.document.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, fileType: true, updatedAt: true },
      take: 10,
    }),
  ]);

  const results = [
    ...workItems.map((i) => ({ ...i, entityType: "work_item" as const })),
    ...tasks.map((i) => ({ ...i, entityType: "task" as const })),
    ...notes.map((i) => ({ ...i, entityType: "note" as const })),
    ...documents.map((i) => ({ ...i, entityType: "document" as const })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  void lower; // suppress unused warning
  return NextResponse.json(results);
}
