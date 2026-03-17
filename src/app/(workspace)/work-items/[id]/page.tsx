import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import TaskList from "@/components/tasks/TaskList";
import AISuggestions from "@/components/ai/AISuggestions";

export default async function WorkItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.workItem.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { updatedAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!item) notFound();

  const statusColors: Record<string, string> = {
    IN_PROGRESS: "bg-blue-500/20 text-blue-300",
    COMPLETE: "bg-green-500/20 text-green-300",
    IDEA: "bg-yellow-500/20 text-yellow-300",
    ARCHIVED: "bg-gray-500/20 text-gray-300",
  };

  const meta = (item.metadata as Record<string, unknown>) || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/work-items" className="text-gray-500 hover:text-gray-300 text-sm">
              ← Work Items
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white">{item.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[item.status]}`}>
              {item.status.replace("_", " ")}
            </span>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
              {item.type.replace("_", " ")}
            </span>
            {item.visibility === "PORTFOLIO" && (
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                Portfolio
              </span>
            )}
            {item.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          {item.description && (
            <p className="text-gray-400 text-sm max-w-2xl">{item.description}</p>
          )}
          {typeof meta.repoUrl === "string" && meta.repoUrl && (
            <a
              href={meta.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              GitHub ↗
            </a>
          )}
          {typeof meta.techStack === "string" && meta.techStack && (
            <p className="text-sm text-gray-400">Stack: {meta.techStack}</p>
          )}
        </div>
        <Link
          href={`/work-items/${id}/edit`}
          className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Tasks</h2>
            </div>
            <TaskList workItemId={item.id} initialTasks={item.tasks} />
          </div>

          {/* Notes */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Notes</h2>
              <Link
                href={`/notes?workItemId=${item.id}&new=1`}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                + Add Note
              </Link>
            </div>
            {item.notes.length === 0 ? (
              <p className="text-sm text-gray-500">No notes yet.</p>
            ) : (
              <div className="space-y-2">
                {item.notes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.id}`}
                    className="block bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 text-sm text-white transition-colors"
                  >
                    ✎ {note.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          {item.documents.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h2 className="font-semibold text-white mb-4">Documents</h2>
              <div className="space-y-2">
                {item.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 text-sm text-white transition-colors"
                  >
                    📄 {doc.title}
                    <span className="ml-auto text-xs text-gray-500">
                      {(doc.fileSize / 1024).toFixed(0)} KB
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Panel */}
        <div className="space-y-4">
          <AISuggestions
            entityType="work_item"
            entityId={item.id}
            cachedSuggestions={item.aiNextSteps}
          />
        </div>
      </div>
    </div>
  );
}
