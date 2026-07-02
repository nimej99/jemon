import type { ReactNode } from "react";

export interface AppShellProps {
  /** Left navigation rail (fixed 72px column) — typically <NavRail/>. */
  nav: ReactNode;
  /** Top application bar — typically <TopBar/>. */
  topBar: ReactNode;
  /** Page content, rendered inside the scrollable main region. */
  children: ReactNode;
}

/**
 * Full-viewport dashboard shell: fixed nav rail on the left, top bar and
 * scrollable main column on the right. Server-component safe.
 */
export function AppShell({ nav, topBar, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-row bg-page text-on-surface">
      <div className="w-[72px] shrink-0">{nav}</div>
      <div className="flex min-w-0 flex-1 flex-col">
        {topBar}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
