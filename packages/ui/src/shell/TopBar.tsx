"use client";

import type { ReactNode } from "react";

export interface TopBarProps {
  /** App title — rendered uppercase per the reference (§3.2). */
  title: string;
  onMenuClick?: () => void;
  /** Menu (hamburger) icon node; the button renders only when provided. */
  menuIcon?: ReactNode;
  /** Right-aligned action area (theme toggle, alerts, scope selector…). */
  children?: ReactNode;
}

/**
 * 64px application bar: menu button + uppercase title on the left, action
 * slot on the right, separated from content by a subtle bottom border.
 */
export function TopBar({ title, onMenuClick, menuIcon, children }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-subtle px-6">
      <div className="flex items-center gap-4">
        {menuIcon && (
          <button
            type="button"
            aria-label="메뉴"
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-muted transition-colors hover:bg-[var(--bg-hover)]"
          >
            {menuIcon}
          </button>
        )}
        <h2 className="text-[15px] font-semibold uppercase tracking-wide text-on-surface">
          {title}
        </h2>
      </div>

      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
