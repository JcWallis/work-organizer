import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import Link from "next/link";

export default async function DashboardPage() {
  const [totalWorkItems, openTasks, recentItems] = await Promise.all([
    prisma.workItem.count(),
    prisma.task.count({ where: { completed: false } }),
    prisma.workItem.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { _count: { select: { tasks: true } } },
    }),
  ]);

  const statusColors: Record<string, string> = {
    IN_PROGRESS: "bg-blue-500/20 text-blue-300",
    COMPLETE: "bg-green-500/20 text-green-300",
    IDEA: "bg-yellow-500/20 text-yellow-300",
    ARCHIVED: "bg-gray-500/20 text-gray-300",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Your personal workspace</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Work Items</p>
          <p className="text-3xl font-bold text-white mt-1">{totalWorkItems}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Open Tasks</p>
          <p className="text-3xl font-bold text-white mt-1">{openTasks}</p>
        </div>
        <Link
          href="/work-items/new"
          className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-xl p-4 flex items-center justify-center transition-colors"
        >
          <span className="text-white font-medium">+ New Item</span>
        </Link>
      </div>

      {/* Recent work items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Recent Work</h2>
          <Link href="/work-items" className="text-sm text-indigo-400 hover:text-indigo-300">
            View all →
          </Link>
        </div>
        <div className="space-y-2">
          {recentItems.length === 0 ? (
            <p className="text-gray-500 text-sm">No work items yet. <Link href="/work-items/new" className="text-indigo-400 hover:underline">Create one</Link></p>
          ) : (
            recentItems.map((item) => (
              <Link
                key={item.id}
                href={`/work-items/${item.id}`}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl px-4 py-3 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[item.status]}`}>
                    {item.status.replace("_", " ")}
                  </span>
                  <span className="text-white text-sm group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {item._count.tasks} task{item._count.tasks !== 1 ? "s" : ""}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/tasks" className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-colors">
          <p className="font-medium text-white">✓ Tasks</p>
          <p className="text-xs text-gray-400 mt-1">View your to-do list</p>
        </Link>
        <Link href="/notes" className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-colors">
          <p className="font-medium text-white">✎ Notes</p>
          <p className="text-xs text-gray-400 mt-1">Browse your notes</p>
        </Link>
      </div>
    </div>
  );
}
