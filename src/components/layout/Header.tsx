"use client";

import Link from "next/link";
import { useState } from "react";
import CommandPalette from "./CommandPalette";

export default function Header() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6">
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>⌕</span>
          <span>Search…</span>
          <kbd className="ml-2 text-xs bg-gray-700 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        <div className="flex items-center gap-3">
          <Link
            href="/work-items/new"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            + New Item
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
