"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewNoteButton({ workItemId }: { workItemId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Untitled Note",
        content: "",
        workItemId: workItemId ?? null,
      }),
    });
    const note = await res.json();
    router.push(`/notes/${note.id}`);
  }

  return (
    <button
      onClick={create}
      disabled={loading}
      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
    >
      {loading ? "Creating…" : "+ New Note"}
    </button>
  );
}
