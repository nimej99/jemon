"use client";

import { useAuth } from "../_lib/auth";

export function UserNav() {
  const { user, logout } = useAuth();

  return (
    <div className="mb-4 flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-4 py-2">
      {/* Nav links */}
      <nav className="flex items-center gap-3 text-xs">
        <a
          href="/dashboard"
          className="text-slate-400 hover:text-slate-100 transition-colors"
        >
          Dashboard
        </a>
        <span className="text-slate-700">·</span>
        <a
          href="/campus"
          className="text-slate-400 hover:text-slate-100 transition-colors"
        >
          3-D Campus
        </a>
        <span className="text-slate-700">·</span>
        <a
          href="/racks"
          className="text-slate-400 hover:text-slate-100 transition-colors"
        >
          Racks
        </a>
      </nav>

      {/* User info + logout */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-300">
          {user?.username}
          <span className="ml-1 text-xs text-slate-500">({user?.role})</span>
        </span>
        <button
          onClick={() => {
            void logout();
          }}
          className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
