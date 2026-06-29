import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Mesh, MeshStandardMaterial } from 'three';
import type { BuildingData } from './types.js';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Map a 0-100 utilisation to a traffic-light colour. */
function utilColor(v: number): string {
  if (v < 50) return '#22c55e';
  if (v < 80) return '#f59e0b';
  return '#ef4444';
}

/** Map a raw temperature (°C) to a traffic-light colour. */
function tempColor(v: number): string {
  if (v < 45) return '#22c55e';
  if (v < 70) return '#f59e0b';
  return '#ef4444';
}

/** Normalise temperature to a 0-100 fill-bar percentage. */
function tempPct(v: number): number {
  return Math.min(100, Math.max(0, ((v - 20) / 65) * 100));
}

// ── sub-component: metric row ─────────────────────────────────────────────────

interface MetricRowProps {
  label: string;
  value: number;
  unit: string;
  pct: number;
  color: string;
}

function MetricRow({ label, value, unit, pct, color }: MetricRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 3,
        gap: 4,
      }}
    >
      <span
        style={{
          width: 28,
          color: '#64748b',
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          background: '#1e293b',
          borderRadius: 2,
          height: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <span
        style={{
          color: '#94a3b8',
          width: 38,
          textAlign: 'right',
          fontSize: 9,
        }}
      >
        {value}
        {unit}
      </span>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface BuildingBlockProps {
  data: BuildingData;
}

export function BuildingBlock({ data }: BuildingBlockProps) {
  const { label, position, size, metrics } = data;
  const [w, h, d] = size;
  const [px, pz] = position;
  const { cpu, mem, traffic, temp } = metrics;

  const roofRef = useRef<Mesh>(null);

  // Pulse the roof emissive intensity when CPU is critical.
  useFrame(({ clock }) => {
    if (!roofRef.current) return;
    const mat = roofRef.current.material as MeshStandardMaterial;
    if (cpu > 80) {
      mat.emissiveIntensity = 0.3 + 0.25 * Math.sin(clock.elapsedTime * 4);
    } else {
      mat.emissiveIntensity = 0.25;
    }
  });

  const roofColor = utilColor(cpu);

  return (
    <group position={[px, 0, pz]}>
      {/* ── building body ── */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.35}
          roughness={0.65}
        />
      </mesh>

      {/* ── horizontal ledge strips on the front face ── */}
      {([0.25, 0.5, 0.75] as const).map((frac) => (
        <mesh key={frac} position={[0, h * frac, d / 2 + 0.01]}>
          <boxGeometry args={[w, 0.03, 0.02]} />
          <meshStandardMaterial
            color="#334155"
            emissive="#3b82f6"
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}

      {/* ── roof status accent ── */}
      <mesh ref={roofRef} position={[0, h + 0.02, 0]}>
        <boxGeometry args={[w, 0.05, d]} />
        <meshStandardMaterial
          color={roofColor}
          emissive={roofColor}
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* ── metric overlay card ── */}
      <Html
        position={[0, h + 0.45, 0]}
        center
        style={{ pointerEvents: 'none' }}
        zIndexRange={[1, 100]}
      >
        <div
          style={{
            background: 'rgba(10,14,26,0.93)',
            border: '1px solid #1e3a5f',
            borderRadius: 6,
            padding: '6px 8px',
            minWidth: 118,
            fontFamily: 'ui-monospace, "Cascadia Code", monospace',
            fontSize: 10,
            color: '#e2e8f0',
            backdropFilter: 'blur(6px)',
            boxShadow:
              '0 0 14px rgba(59,130,246,0.18), 0 2px 8px rgba(0,0,0,0.6)',
            userSelect: 'none',
          }}
        >
          {/* building label */}
          <div
            style={{
              fontWeight: 700,
              marginBottom: 5,
              color: '#93c5fd',
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: 9,
              borderBottom: '1px solid #1e3a5f',
              paddingBottom: 3,
            }}
          >
            {label}
          </div>

          <MetricRow
            label="CPU"
            value={cpu}
            unit="%"
            pct={cpu}
            color={utilColor(cpu)}
          />
          <MetricRow
            label="MEM"
            value={mem}
            unit="%"
            pct={mem}
            color={utilColor(mem)}
          />
          <MetricRow
            label="NET"
            value={traffic}
            unit="%"
            pct={traffic}
            color={utilColor(traffic)}
          />
          <MetricRow
            label="TEMP"
            value={temp}
            unit="°C"
            pct={tempPct(temp)}
            color={tempColor(temp)}
          />
        </div>
      </Html>
    </group>
  );
}
