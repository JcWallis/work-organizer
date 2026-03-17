"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

type Result = {
  id: string;
  title: string;
  entityType: "work_item" | "task" | "note" | "document";
  updatedAt: string;
};

const entityHref = (r: Result) => ({
  work_item: `/work-items/${r.id}`,
  task: `/tasks`,
  note: `/notes/${r.id}`,
  document: `/documents/${r.id}`,
}[r.entityType]);

const entityIcon = (type: Result["entityType"]) =>
  ({ work_item: "◈", task: "✓", note: "✎", document: "📄" }[type]);

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setQuery(q);
    if (q.length >= 2) doSearch(q);
  }, [searchParams]);

  async function doSearch(q: string) {
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    setResults(await res.json());
    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const filtered = filter === "all" ? results : results.filter((r) => r.entityType === filter);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Search</h1>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search work items, tasks, notes, documents…"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Search
        </button>
      </form>

      {results.length > 0 && (
        <div className="flex gap-2">
          {["all", "work_item", "task", "note", "document"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {f === "all" ? "All" : f.replace("_", " ")}
            </button>
          ))}
        </div>
      )}

      {loading && <p className="text-gray-500 text-sm">Searching…</p>}

      {!loading && filtered.length === 0 && query.length >= 2 && (
        <p className="text-gray-500 text-sm">No results for "{query}"</p>
      )}

      <div className="space-y-2">
        {filtered.map((r) => (
          <Link
            key={`${r.entityType}-${r.id}`}
            href={entityHref(r)}
            className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl px-4 py-3 transition-colors group"
          >
            <span className="text-gray-400">{entityIcon(r.entityType)}</span>
            <span className="text-white text-sm group-hover:text-indigo-300">{r.title}</span>
            <span className="ml-auto text-xs text-gray-500 capitalize">
              {r.entityType.replace("_", " ")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
