"use client";

import type { ReactNode } from "react";

export interface NavRailItem {
  id: string;
  icon: ReactNode;
  label: string;
  href?: string;
}

export interface NavRailProps {
  items: NavRailItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  /** Logo slot pinned at the top of the rail. */
  logo?: ReactNode;
  /** Footer slot pinned at the bottom of the rail. */
  footer?: ReactNode;
}

const ITEM_BASE =
  "flex h-11 w-11 items-center justify-center rounded-xl transition-colors";
const ITEM_ACTIVE = "bg-accent-blue text-white";
const ITEM_IDLE = "text-muted hover:bg-[var(--bg-hover)] hover:text-on-muted";

/**
 * Vertical 72px icon rail. Active item is a filled 44×44 accent block with a
 * white icon (reference §3.1); idle items are muted with a hover overlay.
 */
export function NavRail({ items, activeId, onSelect, logo, footer }: NavRailProps) {
  return (
    <nav
      aria-label="주 메뉴"
      className="flex h-full min-h-screen w-[72px] flex-col items-center bg-navrail py-4"
    >
      {logo && <div className="mb-4 flex items-center justify-center">{logo}</div>}

      <div className="flex flex-col items-center gap-2">
        {items.map((item) => {
          const active = item.id === activeId;
          const className = `${ITEM_BASE} ${active ? ITEM_ACTIVE : ITEM_IDLE}`;

          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={className}
                onClick={onSelect ? () => onSelect(item.id) : undefined}
              >
                {item.icon}
              </a>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={className}
              onClick={onSelect ? () => onSelect(item.id) : undefined}
            >
              {item.icon}
            </button>
          );
        })}
      </div>

      {footer && (
        <div className="mt-auto flex flex-col items-center pt-4">{footer}</div>
      )}
    </nav>
  );
}
