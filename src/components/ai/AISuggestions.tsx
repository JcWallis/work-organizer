"use client";

import { useState } from "react";

export default function AISuggestions({
  entityType,
  entityId,
  cachedSuggestions,
}: {
  entityType: "work_item" | "task";
  entityId: string;
  cachedSuggestions?: string | null;
}) {
  const [text, setText] = useState(cachedSuggestions ?? "");
  const [loading, setLoading] = useState(false);

  async function getSuggestions() {
    setLoading(true);
    setText("");

    const res = await fetch("/api/ai/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType, entityId }),
    });

    if (!res.body) { setLoading(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value, { stream: true });
      setText(full);
    }

    setLoading(false);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-sm">AI Suggestions</h3>
        <button
          onClick={getSuggestions}
          disabled={loading}
          className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-2 py-1 rounded transition-colors"
        >
          {loading ? "Thinking…" : text ? "Refresh" : "Get Suggestions"}
        </button>
      </div>

      {text ? (
        <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
          {text}
          {loading && <span className="animate-pulse">▌</span>}
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          Click to get AI-powered next steps for this item.
        </p>
      )}
    </div>
  );
}
