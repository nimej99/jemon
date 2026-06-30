import type { JSX } from "react";

export type RackUnitStatus = "ok" | "warn" | "crit" | "empty";

export interface RackUnit {
  id: string;
  name: string;
  startU: number;
  sizeU: number;
  status?: RackUnitStatus;
}

export interface RackElevationProps {
  label: string;
  totalU?: number;
  units: RackUnit[];
  width?: number;
  height?: number;
}

const STATUS_FILL: Record<RackUnitStatus, string> = {
  ok: "#16a34a",
  warn: "#f59e0b",
  crit: "#ef4444",
  empty: "none",
};

const STATUS_BG: Record<RackUnitStatus, string> = {
  ok: "#16a34a1a",
  warn: "#f59e0b1a",
  crit: "#ef44441a",
  empty: "none",
};

const HEADER_H = 28;
const MARGIN_V = 4;
const LEFT_PAD = 28; // space for U-number labels
const RIGHT_PAD = 4;

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export function RackElevation({
  label,
  totalU = 42,
  units,
  width = 260,
  height,
}: RackElevationProps): JSX.Element {
  const svgH = height ?? totalU * 16 + HEADER_H + MARGIN_V * 2;
  const rowH = (svgH - HEADER_H - MARGIN_V * 2) / totalU;

  const bodyX = LEFT_PAD;
  const bodyW = width - LEFT_PAD - RIGHT_PAD;
  const bodyY = HEADER_H + MARGIN_V;
  const bodyH = rowH * totalU;

  // y coordinate of the top of a given U-number (U42 → top, U1 → bottom)
  const uToY = (u: number) => bodyY + (totalU - u) * rowH;

  // Build the set of U positions covered by defined units
  const occupied = new Set<number>();
  for (const unit of units) {
    for (let i = unit.startU; i < unit.startU + unit.sizeU; i++) {
      occupied.add(i);
    }
  }

  // Rows that should show as empty slots
  const emptyRows: number[] = [];
  for (let u = 1; u <= totalU; u++) {
    if (!occupied.has(u)) emptyRows.push(u);
  }

  return (
    <svg
      width={width}
      height={svgH}
      viewBox={`0 0 ${width} ${svgH}`}
      style={{ display: "block" }}
      aria-label={`Rack elevation: ${label}`}
    >
      {/* ── Outer background ── */}
      <rect width={width} height={svgH} rx={6} ry={6} fill="#0a0e1a" />

      {/* ── Header band ── */}
      <rect x={0} y={0} width={width} height={HEADER_H} rx={6} ry={6} fill="#1e293b" />
      {/* Cover the rounded bottom corners of the header */}
      <rect x={0} y={HEADER_H - 6} width={width} height={6} fill="#1e293b" />
      <text
        x={width / 2}
        y={HEADER_H / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#e2e8f0"
        fontSize={11}
        fontWeight={600}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {truncate(label, 28)}
      </text>

      {/* ── Rack body frame ── */}
      <rect
        x={bodyX}
        y={bodyY}
        width={bodyW}
        height={bodyH}
        rx={2}
        ry={2}
        fill="none"
        stroke="#334155"
        strokeWidth={1.5}
      />

      {/* ── Row grid lines + U-number labels ── */}
      {Array.from({ length: totalU }, (_, idx) => {
        const u = totalU - idx; // U-number (42 at top, 1 at bottom)
        const y = uToY(u);
        const showLabel = u === 1 || u === totalU || u % 5 === 0;
        return (
          <g key={`row-${u}`}>
            <line
              x1={bodyX}
              y1={y}
              x2={bodyX + bodyW}
              y2={y}
              stroke="#1e293b"
              strokeWidth={0.5}
            />
            {showLabel && (
              <text
                x={bodyX - 3}
                y={y + rowH / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#475569"
                fontSize={7}
                fontFamily="ui-monospace, monospace"
              >
                {u}
              </text>
            )}
          </g>
        );
      })}

      {/* ── Empty slot rows ── */}
      {emptyRows.map((u) => (
        <rect
          key={`empty-${u}`}
          x={bodyX + 1}
          y={uToY(u) + 0.5}
          width={bodyW - 2}
          height={rowH - 0.5}
          fill="#0f172a"
          stroke="#1e293b"
          strokeWidth={0.5}
          rx={1}
        />
      ))}

      {/* ── Device units ── */}
      {units.map((unit) => {
        const status = unit.status ?? "ok";
        const fill = STATUS_FILL[status];
        const bg = STATUS_BG[status];
        const topU = unit.startU + unit.sizeU - 1; // highest U in the span
        const y = uToY(topU);
        const h = unit.sizeU * rowH;
        const x = bodyX + 2;
        const w = bodyW - 4;
        const isEmpty = status === "empty";
        const endU = unit.startU + unit.sizeU - 1;
        const uRangeLabel =
          unit.sizeU > 1
            ? `U${endU}–U${unit.startU}`
            : `U${unit.startU}`;
        // Name truncation: available chars ≈ (w - 16) / 6.5 at fontSize 10
        const maxChars = Math.floor((w - 16) / 6);
        const nameLine = truncate(unit.name, maxChars);
        // Show U-range label only when tall enough
        const showULabel = h >= rowH * 1.8;
        const nameFontSize = Math.max(8, Math.min(10, h * 0.42));
        const nameCY = showULabel ? y + h / 2 - 5 : y + h / 2;

        return (
          <g key={unit.id}>
            {/* Device body */}
            <rect
              x={x}
              y={y + 1}
              width={w}
              height={h - 2}
              rx={3}
              ry={3}
              fill={bg}
              stroke={isEmpty ? "#1e293b" : fill}
              strokeWidth={isEmpty ? 1 : 1.5}
              strokeDasharray={isEmpty ? "4 2" : undefined}
            />
            {!isEmpty && (
              <>
                {/* Status indicator bar */}
                <rect
                  x={x + 3}
                  y={y + 3}
                  width={4}
                  height={h - 6}
                  rx={2}
                  ry={2}
                  fill={fill}
                />
                {/* Device name */}
                <text
                  x={x + 12}
                  y={nameCY}
                  dominantBaseline="middle"
                  fill="#e2e8f0"
                  fontSize={nameFontSize}
                  fontWeight={500}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {nameLine}
                </text>
                {/* U-range label */}
                {showULabel && (
                  <text
                    x={x + 12}
                    y={y + h / 2 + 7}
                    dominantBaseline="middle"
                    fill="#64748b"
                    fontSize={7}
                    fontFamily="ui-monospace, monospace"
                  >
                    {uRangeLabel}
                  </text>
                )}
              </>
            )}
          </g>
        );
      })}

      {/* ── Outer frame border (drawn last, on top) ── */}
      <rect
        width={width}
        height={svgH}
        rx={6}
        ry={6}
        fill="none"
        stroke="#334155"
        strokeWidth={1.5}
      />
    </svg>
  );
}
