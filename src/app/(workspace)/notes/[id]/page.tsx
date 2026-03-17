import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import NoteEditor from "@/components/notes/NoteEditor";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await prisma.note.findUnique({
    where: { id },
    include: { workItem: { select: { id: true, title: true } } },
  });

  if (!note) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <NoteEditor note={note} />
    </div>
  );
}
