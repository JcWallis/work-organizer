import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import TaskList from "@/components/tasks/TaskList";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ completed: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    include: { workItem: { select: { id: true, title: true } } },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tasks</h1>
        <p className="text-gray-400 text-sm mt-1">
          {tasks.filter((t) => !t.completed).length} open ·{" "}
          {tasks.filter((t) => t.completed).length} completed
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <TaskList initialTasks={tasks} />
      </div>
    </div>
  );
}
