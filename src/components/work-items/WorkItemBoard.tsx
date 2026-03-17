"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type WorkItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  tags: string[];
  visibility: string;
  updatedAt: Date;
  _count: { tasks: number; notes: number; documents: number };
};

const COLUMNS = [
  { key: "IN_PROGRESS", label: "In Progress", color: "border-blue-500" },
  { key: "IDEA", label: "Idea", color: "border-yellow-500" },
  { key: "COMPLETE", label: "Complete", color: "border-green-500" },
  { key: "ARCHIVED", label: "Archived", color: "border-gray-500" },
];

const typeIcon: Record<string, string> = {
  CODE_PROJECT: "⌨",
  NOTE: "✎",
  TASK: "✓",
  DOCUMENT: "📄",
};

export default function WorkItemBoard({ initialItems }: { initialItems: WorkItem[] }) {
  const [items, setItems] = useState(initialItems);
  const router = useRouter();

  async function moveItem(id: string, newStatus: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    await fetch(`/api/work-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colItems = items.filter((i) => i.status === col.key);
        return (
          <div key={col.key} className="flex-shrink-0 w-72">
            <div className={`border-t-2 ${col.color} bg-gray-900 rounded-xl p-3`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-300">{col.label}</span>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                  {colItems.length}
                </span>
              </div>

              <div className="space-y-2">
                {colItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/work-items/${item.id}`}
                        className="text-sm text-white group-hover:text-indigo-300 font-medium leading-snug"
                      >
                        {typeIcon[item.type]} {item.title}
                      </Link>
                      {item.visibility === "PORTFOLIO" && (
                        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded flex-shrink-0">
                          Portfolio
                        </span>
                      )}
                    </div>

                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      {item._count.tasks > 0 && <span>✓ {item._count.tasks}</span>}
                      {item._count.notes > 0 && <span>✎ {item._count.notes}</span>}
                      {item._count.documents > 0 && <span>📄 {item._count.documents}</span>}
                    </div>

                    {/* Move buttons */}
                    <div className="flex gap-1 mt-2">
                      {COLUMNS.filter((c) => c.key !== col.key).map((c) => (
                        <button
                          key={c.key}
                          onClick={() => moveItem(item.id, c.key)}
                          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                          title={`Move to ${c.label}`}
                        >
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {colItems.length === 0 && (
                  <p className="text-xs text-gray-600 text-center py-4">Empty</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
