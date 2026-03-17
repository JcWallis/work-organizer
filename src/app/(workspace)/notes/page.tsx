import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import Link from "next/link";
import NewNoteButton from "@/components/notes/NewNoteButton";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ workItemId?: string }>;
}) {
  const { workItemId } = await searchParams;

  const notes = await prisma.note.findMany({
    where: workItemId ? { workItemId } : {},
    include: { workItem: { select: { id: true, title: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notes</h1>
        <NewNoteButton workItemId={workItemId} />
      </div>

      {notes.length === 0 ? (
        <p className="text-gray-500">No notes yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-colors group"
            >
              <h3 className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                {note.title}
              </h3>
              {note.workItem && (
                <p className="text-xs text-gray-500 mt-1">↪ {note.workItem.title}</p>
              )}
              {note.tags.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {note.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
