"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";

type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  workItem?: { id: string; title: string } | null;
};

export default function NoteEditor({ note }: { note: Note }) {
  const [title, setTitle] = useState(note.title);
  const [tags, setTags] = useState(note.tags.join(", "));
  const [saved, setSaved] = useState(true);

  const editor = useEditor({
    extensions: [StarterKit],
    content: (() => {
      try {
        return note.content ? JSON.parse(note.content) : "";
      } catch {
        return note.content || "";
      }
    })(),
    onUpdate: () => setSaved(false),
  });

  const save = useCallback(async () => {
    if (!editor) return;
    const content = JSON.stringify(editor.getJSON());
    await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    setSaved(true);
  }, [editor, note.id, title, tags]);

  // Auto-save on title/tags blur
  useEffect(() => {
    setSaved(false);
  }, [title, tags]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [save]);

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/notes" className="hover:text-gray-300">Notes</Link>
        {note.workItem && (
          <>
            <span>·</span>
            <Link href={`/work-items/${note.workItem.id}`} className="hover:text-gray-300">
              {note.workItem.title}
            </Link>
          </>
        )}
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-600 outline-none"
        placeholder="Note title"
      />

      {/* Tags */}
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        onBlur={save}
        className="w-full bg-transparent text-sm text-gray-400 placeholder-gray-600 outline-none"
        placeholder="Tags (comma-separated)"
      />

      {/* Toolbar */}
      {editor && (
        <div className="flex gap-1 p-1 bg-gray-800 rounded-lg border border-gray-700">
          {[
            { label: "B", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
            { label: "I", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
            { label: "H1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
            { label: "H2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
            { label: "• List", action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
            { label: "1. List", action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
            { label: "Code", action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive("code") },
          ].map(({ label, action, active }) => (
            <button
              key={label}
              onMouseDown={(e) => { e.preventDefault(); action(); }}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                active ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Editor */}
      <div className="min-h-64 prose prose-invert prose-sm max-w-none">
        <EditorContent
          editor={editor}
          className="outline-none text-gray-200 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-48"
        />
      </div>

      {/* Save status */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{saved ? "✓ Saved" : "Unsaved changes"}</span>
        <button
          onClick={save}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded transition-colors"
        >
          Save (⌘S)
        </button>
      </div>
    </div>
  );
}
