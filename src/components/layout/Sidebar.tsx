"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: "⊞" },
  { href: "/work-items", label: "Work Items", icon: "◈" },
  { href: "/tasks", label: "Tasks", icon: "✓" },
  { href: "/notes", label: "Notes", icon: "✎" },
  { href: "/documents", label: "Documents", icon: "📄" },
  { href: "/search", label: "Search", icon: "⌕" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="px-4 py-5 border-b border-gray-800">
        <span className="font-bold text-white text-lg">Work Organizer</span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {nav.map(({ href, label, icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-800">
        <Link
          href="/portfolio"
          target="_blank"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          View Portfolio ↗
        </Link>
      </div>
    </aside>
  );
}
