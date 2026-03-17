"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Result {
  id: string;
  title: string;
  entityType: "work_item" | "task" | "note" | "document";
}

const entityHref = (r: Result) => {
  const map = {
    work_item: `/work-items/${r.id}`,
    task: `/tasks`,
    note: `/notes/${r.id}`,
    document: `/documents/${r.id}`,
  };
  return map[r.entityType];
};

const entityIcon = (type: Result["entityType"]) => {
  const map = { work_item: "◈", task: "✓", note: "✎", document: "📄" };
  return map[type];
};

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open ? onClose() : undefined;
        if (!open) {
          // parent toggles open
        }
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data.slice(0, 5));
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!open) { setQuery(""); setResults([]); }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <span className="text-gray-400">⌕</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search everything…"
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
          />
          {loading && <span className="text-xs text-gray-500">…</span>}
        </div>

        {results.length > 0 && (
          <ul className="py-2 max-h-64 overflow-y-auto">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-800 text-left"
                  onClick={() => { router.push(entityHref(r)); onClose(); }}
                >
                  <span className="text-gray-400">{entityIcon(r.entityType)}</span>
                  <span className="text-sm text-white">{r.title}</span>
                  <span className="ml-auto text-xs text-gray-500 capitalize">
                    {r.entityType.replace("_", " ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.length >= 2 && results.length === 0 && !loading && (
          <p className="px-4 py-3 text-sm text-gray-500">No results for "{query}"</p>
        )}
      </div>
    </div>
  );
}
