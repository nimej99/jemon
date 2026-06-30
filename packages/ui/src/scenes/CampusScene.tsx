import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Grid, Stars, OrbitControls } from '@react-three/drei';
import { BuildingBlock } from './BuildingBlock.js';
import type { CampusSceneProps } from './types.js';

// ── inner scene graph (must be inside <Canvas>) ───────────────────────────────

interface SceneGraphProps {
  buildings: CampusSceneProps['buildings'];
}

function SceneGraph({ buildings }: SceneGraphProps) {
  return (
    <>
      {/*
       * Isometric orthographic camera.
       * Position [10, 10, 10] gives equal distances on all three axes,
       * producing a true isometric projection at 45° azimuth / 35.26° elevation.
       */}
      <OrthographicCamera
        makeDefault
        position={[12, 12, 12]}
        zoom={34}
        near={0.1}
        far={400}
        onUpdate={(self) => self.lookAt(0, 0, 0)}
      />
      <OrbitControls makeDefault target={[0, 0, 0]} />

      {/* ── lighting ── */}
      <ambientLight intensity={0.35} color="#1e3a8a" />
      <directionalLight
        position={[8, 18, 8]}
        intensity={1.6}
        color="#dbeafe"
        castShadow
      />
      <hemisphereLight args={['#1e3a8a', '#0a0e1a', 0.4]} />

      {/* ── atmosphere ── */}
      <Stars
        radius={80}
        depth={30}
        count={800}
        factor={3}
        saturation={0.6}
        fade
      />

      {/* ── ground plane ── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#060a12" />
      </mesh>

      {/* ── grid overlay ── */}
      <Grid
        position={[0, 0, 0]}
        args={[60, 60]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#1e3a5f"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#1d4ed8"
        fadeDistance={35}
        fadeStrength={1.2}
        infiniteGrid={false}
      />

      {/* ── buildings ── */}
      {buildings.map((b) => (
        <BuildingBlock key={b.id} data={b} />
      ))}
    </>
  );
}

// ── public component ──────────────────────────────────────────────────────────

/**
 * CampusScene — 3-D isometric campus visualisation.
 *
 * @example
 * ```tsx
 * import { CampusScene } from '@jemon/ui/scenes';
 *
 * <CampusScene
 *   width={900}
 *   height={620}
 *   buildings={[
 *     {
 *       id: 'dc-a',
 *       label: 'DC-A',
 *       position: [-3, -3],
 *       size: [3, 2.5, 2],
 *       metrics: { cpu: 72, mem: 58, traffic: 44, temp: 51 },
 *     },
 *   ]}
 * />
 * ```
 */
export function CampusScene({
  buildings,
  width = 800,
  height = 600,
  onReady,
}: CampusSceneProps) {
  return (
    <div
      style={{
        width,
        height,
        background: '#0a0e1a',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Canvas
        frameloop="always"
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%' }}
        onCreated={onReady}
      >
        <Suspense fallback={null}>
          <SceneGraph buildings={buildings} />
        </Suspense>
      </Canvas>
    </div>
  );
}
