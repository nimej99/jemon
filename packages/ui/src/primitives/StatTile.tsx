"use client";

export interface StatTileProps {
  label: string;
  value: string | number | null;
  unit?: string;
  size?: "sm" | "md" | "lg";
  muted?: boolean;
}

const SIZE_CLASS: Record<string, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

export function StatTile({
  label,
  value,
  unit,
  size = "md",
  muted = false,
}: StatTileProps) {
  const textSize = SIZE_CLASS[size] ?? SIZE_CLASS["md"];
  const valueColor = muted ? "text-slate-400" : "text-slate-100";

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className={`font-semibold tabular-nums ${textSize} ${valueColor}`}>
          {value === null ? "—" : String(value)}
        </span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </div>
    </div>
  );
}
