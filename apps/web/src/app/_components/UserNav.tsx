"use client";

import { useAuth } from "../_lib/auth";

type Page = "dashboard" | "campus" | "racks";

interface UserNavProps {
  activePage?: Page;
}

const NAV_LINKS: { page: Page; label: string; href: string }[] = [
  { page: "dashboard", label: "Dashboard", href: "/dashboard" },
  { page: "campus", label: "3-D Campus", href: "/campus" },
  { page: "racks", label: "Racks", href: "/racks" },
];

export function UserNav({ activePage }: UserNavProps) {
  const { user, logout } = useAuth();

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-800/80 px-4 py-2 shadow-sm">
      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {NAV_LINKS.map((link, i) => {
          const isActive = link.page === activePage;
          return (
            <span key={link.page} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-700">·</span>}
              <a
                href={link.href}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-sky-900/50 text-sky-300"
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-100"
                }`}
              >
                {link.label}
              </a>
            </span>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-xs text-slate-400">
            <span className="text-slate-300">{user.username}</span>
            <span className="ml-1 text-slate-600">({user.role})</span>
          </span>
        )}
        <button
          onClick={() => {
            void logout();
          }}
          className="rounded px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
