import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portfolio",
  description: "Personal portfolio of projects and work",
};

export default async function PortfolioPage() {
  const items = await prisma.workItem.findMany({
    where: { visibility: "PORTFOLIO" },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  const statusLabel: Record<string, string> = {
    IN_PROGRESS: "In Progress",
    COMPLETE: "Complete",
    IDEA: "Idea",
    ARCHIVED: "Archived",
  };

  const typeIcon: Record<string, string> = {
    CODE_PROJECT: "⌨",
    NOTE: "✎",
    TASK: "✓",
    DOCUMENT: "📄",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold">Portfolio</h1>
          <p className="text-gray-400 mt-2">Projects and work I've been building</p>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500">No portfolio items yet.</p>
        ) : (
          <div className="grid gap-6">
            {items.map((item) => {
              const meta = (item.metadata as Record<string, unknown>) || {};
              return (
                <div
                  key={item.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{typeIcon[item.type]}</span>
                        <h2 className="text-xl font-semibold">{item.title}</h2>
                      </div>

                      {item.description && (
                        <p className="text-gray-400 leading-relaxed">{item.description}</p>
                      )}

                      {typeof meta.techStack === "string" && meta.techStack && (
                        <p className="text-sm text-indigo-300">{meta.techStack}</p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap mt-3">
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                          {statusLabel[item.status]}
                        </span>
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {typeof meta.repoUrl === "string" && meta.repoUrl && (
                      <a
                        href={meta.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-400 hover:text-indigo-300 flex-shrink-0"
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
