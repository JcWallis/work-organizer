"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type WorkItemType = "CODE_PROJECT" | "NOTE" | "TASK" | "DOCUMENT";
type WorkItemStatus = "IN_PROGRESS" | "COMPLETE" | "ARCHIVED" | "IDEA";
type Visibility = "PRIVATE" | "PORTFOLIO";

interface Props {
  initial?: {
    id: string;
    title: string;
    description?: string | null;
    type: WorkItemType;
    status: WorkItemStatus;
    visibility: Visibility;
    tags: string[];
    metadata?: Record<string, unknown> | null;
  };
}

export default function WorkItemForm({ initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState<WorkItemType>(initial?.type ?? "CODE_PROJECT");
  const [status, setStatus] = useState<WorkItemStatus>(initial?.status ?? "IN_PROGRESS");
  const [visibility, setVisibility] = useState<Visibility>(initial?.visibility ?? "PRIVATE");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [repoUrl, setRepoUrl] = useState((initial?.metadata?.repoUrl as string) ?? "");
  const [techStack, setTechStack] = useState((initial?.metadata?.techStack as string) ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title,
      description: description || undefined,
      type,
      status,
      visibility,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      metadata: type === "CODE_PROJECT" ? { repoUrl, techStack } : undefined,
    };

    const url = initial ? `/api/work-items/${initial.id}` : "/api/work-items";
    const method = initial ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message || "Something went wrong");
      setLoading(false);
      return;
    }

    const item = await res.json();
    router.push(`/work-items/${item.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Project name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as WorkItemType)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="CODE_PROJECT">Code Project</option>
            <option value="NOTE">Note</option>
            <option value="TASK">Task</option>
            <option value="DOCUMENT">Document</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as WorkItemStatus)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IDEA">Idea</option>
            <option value="COMPLETE">Complete</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="What is this about?"
        />
      </div>

      {type === "CODE_PROJECT" && (
        <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Code Project Details</p>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Repository URL</label>
            <input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tech Stack</label>
            <input
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="React, Next.js, TypeScript…"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="react, typescript, ai (comma-separated)"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <div>
          <p className="text-sm font-medium text-gray-300">Show on Portfolio</p>
          <p className="text-xs text-gray-500">Visible at /portfolio (public)</p>
        </div>
        <button
          type="button"
          onClick={() => setVisibility(visibility === "PORTFOLIO" ? "PRIVATE" : "PORTFOLIO")}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            visibility === "PORTFOLIO" ? "bg-indigo-600" : "bg-gray-700"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              visibility === "PORTFOLIO" ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {loading ? "Saving…" : initial ? "Save Changes" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white px-5 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
