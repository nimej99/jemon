import type { ReactNode } from "react";

export interface PanelProps {
  title?: string;
  /** Right-aligned action slot in the header row (e.g. "더보기 ›" link). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Adds backdrop blur — for panels floating over the hero scene. */
  blur?: boolean;
}

/**
 * Standard card surface: bg-card + subtle border + card radius/shadow, with
 * an optional title/action header row. Server-component safe.
 */
export function Panel({ title, action, children, className, blur }: PanelProps) {
  return (
    <section
      className={[
        "rounded-card border border-subtle bg-card p-5 shadow-card",
        blur ? "backdrop-blur-[6px]" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && (
            <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
          )}
          {action && <div className="flex items-center">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
