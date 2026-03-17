"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: string;
  dueDate?: Date | null;
};

const priorityColor: Record<string, string> = {
  URGENT: "text-red-400",
  HIGH: "text-orange-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-gray-400",
};

export default function TaskList({
  workItemId,
  initialTasks,
}: {
  workItemId?: string;
  initialTasks: Task[];
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), workItemId }),
    });
    const task = await res.json();
    setTasks((prev) => [task, ...prev]);
    setNewTitle("");
    setAdding(false);
  }

  async function toggleTask(id: string, completed: boolean) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
    );
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    router.refresh();
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={addTask} className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={adding}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
        >
          Add
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500">No tasks yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 group"
            >
              <button
                onClick={() => toggleTask(task.id, task.completed)}
                className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                  task.completed
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-gray-600 hover:border-gray-400"
                }`}
              >
                {task.completed && <span className="text-xs">✓</span>}
              </button>
              <span
                className={`flex-1 text-sm ${
                  task.completed ? "line-through text-gray-500" : "text-white"
                }`}
              >
                {task.title}
              </span>
              <span className={`text-xs ${priorityColor[task.priority]}`}>
                {task.priority}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
