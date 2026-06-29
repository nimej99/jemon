"use client";

export type AlertLevel = "info" | "warn" | "crit";

export interface Alert {
  id: string;
  level: AlertLevel;
  message: string;
  timestamp?: string;
  source?: string;
}

export interface AlertListProps {
  alerts: Alert[];
  maxItems?: number;
  emptyMessage?: string;
}

const LEVEL_CLASSES: Record<AlertLevel, string> = {
  info: "border-blue-500 bg-blue-500/10 text-blue-300",
  warn: "border-amber-500 bg-amber-500/10 text-amber-300",
  crit: "border-red-500 bg-red-500/10 text-red-300",
};

const LEVEL_ICON: Record<AlertLevel, string> = {
  info: "ℹ",
  warn: "⚠",
  crit: "✕",
};

export function AlertList({
  alerts,
  maxItems = 10,
  emptyMessage = "No active alerts",
}: AlertListProps) {
  const visible = alerts.slice(0, maxItems);

  if (visible.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {visible.map((alert) => (
        <li
          key={alert.id}
          className={`flex items-start gap-3 rounded border-l-2 px-3 py-2 text-sm ${LEVEL_CLASSES[alert.level]}`}
        >
          <span className="mt-0.5 shrink-0 font-bold" aria-hidden>
            {LEVEL_ICON[alert.level]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="break-words">{alert.message}</p>
            <div className="mt-0.5 flex gap-2 text-xs opacity-70">
              {alert.source && <span>{alert.source}</span>}
              {alert.timestamp && <span>{alert.timestamp}</span>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
