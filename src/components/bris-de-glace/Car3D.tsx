'use client';

import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Lightformer, useGLTF } from '@react-three/drei';

/**
 * Bris de glace selector — photoreal 2022 Renault Austral (Sketchfab, CC-BY,
 * by tonielpro520), optimized to ~845KB (draco + webp; decoder served locally
 * from /draco so it works offline).
 *
 * Interaction model: the GLB renders untouched; 7 transparent "glow panes" are
 * positioned over the glass zones (coordinates MEASURED from the raw model's
 * glass-mesh bounding boxes via gltf-transform, then normalized). Invisible at
 * rest, blue translucent on hover, glowing blue when selected — so per-window
 * selection works regardless of how the model's glass meshes are merged.
 *
 * Raw model: car length along Z (front = +Z), lateral = X (left = +X), up = Y.
 * Normalization: world = raw * S + T, with S chosen for a 4.6-unit-long car
 * grounded on y=0 and centered on the origin.
 */

const MODEL_URL = '/models/austral.glb';
const S = 0.2485; // 4.6 / 18.51 (raw Z length)
const T: [number, number, number] = [-0.949, 0, -0.337]; // [-S*centerX, -S*minY, -S*centerZ]

const w = (raw: [number, number, number]): [number, number, number] => [
  raw[0] * S + T[0],
  raw[1] * S + T[1],
  raw[2] * S + T[2]
];

interface ZoneDef {
  id: string;
  center: [number, number, number]; // world
  size: [number, number]; // pane [width(x or z), height] in world units
  kind: 'raked' | 'side';
  rakeRad?: number; // rotation about X for raked panes
}

// Positions derived from measured glass bounding boxes (see plan / measure.mjs).
const ZONES: ZoneDef[] = [
  // Windshield: raw c [3.82,5.26,4.66], size [6.32,2.15,4.04] → rake atan2(2.15,4.04)
  { id: 'windshield', center: w([3.82, 5.26, 4.66]), size: [1.45, 1.1], kind: 'raked', rakeRad: Math.atan2(2.15, 4.04) },
  // Rear window: raw c [3.82,5.53,-6.04], size [5.36,1.1,2.1] → opposite rake
  { id: 'rear_window', center: w([3.82, 5.53, -6.04]), size: [1.25, 0.62], kind: 'raked', rakeRad: -Math.atan2(1.1, 2.1) },
  // Panoramic roof: horizontal pane across the roof span
  { id: 'roof', center: w([3.82, 6.55, -0.8]), size: [1.05, 1.85], kind: 'raked', rakeRad: Math.PI / 2 },
  // Side door windows (left = +X). Rear panes extended to cover the quarter glass.
  { id: 'front_left', center: w([6.85, 5.49, 2.62]), size: [1.12, 0.42], kind: 'side' },
  { id: 'front_right', center: w([0.8, 5.49, 2.62]), size: [1.12, 0.42], kind: 'side' },
  { id: 'rear_left', center: w([6.85, 5.55, -2.3]), size: [1.35, 0.4], kind: 'side' },
  { id: 'rear_right', center: w([0.8, 5.55, -2.3]), size: [1.35, 0.4], kind: 'side' }
];

interface Car3DProps {
  value: string[];
  onChange?: (ids: string[]) => void;
  readOnly?: boolean;
  onHover?: (id: string | null) => void;
  primary: string;
  primaryDark: string;
  isDark: boolean;
}

function AustralModel() {
  const { scene } = useGLTF(MODEL_URL, '/draco/');
  const model = useMemo(() => {
    scene.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          const std = m as THREE.MeshStandardMaterial;
          if (std && 'envMapIntensity' in std) std.envMapIntensity = 1.1;
        });
      }
    });
    return scene;
  }, [scene]);
  return <primitive object={model} scale={S} position={T} />;
}

function ZonePane({
  zone,
  selected,
  hovered,
  readOnly,
  primary,
  onClick,
  onOver,
  onOut
}: {
  zone: ZoneDef;
  selected: boolean;
  hovered: boolean;
  readOnly: boolean;
  primary: string;
  onClick: () => void;
  onOver: () => void;
  onOut: () => void;
}) {
  const rotation: [number, number, number] =
    zone.kind === 'side' ? [0, Math.PI / 2, 0] : [zone.rakeRad ?? 0, 0, 0];

  const opacity = selected ? 0.55 : hovered && !readOnly ? 0.35 : 0;

  return (
    <mesh
      position={zone.center}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onOver();
      }}
      onPointerOut={onOut}
    >
      <boxGeometry args={[zone.size[0], zone.size[1], 0.06]} />
      <meshPhysicalMaterial
        color={primary}
        emissive={primary}
        emissiveIntensity={selected ? 0.9 : hovered ? 0.5 : 0}
        transparent
        opacity={opacity}
        depthWrite={false}
        roughness={0.15}
      />
    </mesh>
  );
}

function SceneContent({ value, onChange, readOnly, onHover, primary, primaryDark, isDark }: Car3DProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const isSel = (id: string) => value.includes(id);

  const toggle = (id: string) => {
    if (readOnly || !onChange) return;
    onChange(isSel(id) ? value.filter((z) => z !== id) : [...value, id]);
  };

  const hover = (id: string | null) => {
    setHovered(id);
    onHover?.(id);
    if (!readOnly) document.body.style.cursor = id ? 'pointer' : 'auto';
  };

  return (
    <group>
      <AustralModel />

      {ZONES.map((z) => (
        <ZonePane
          key={z.id}
          zone={z}
          selected={isSel(z.id)}
          hovered={hovered === z.id}
          readOnly={readOnly ?? false}
          primary={primary}
          onClick={() => toggle(z.id)}
          onOver={() => hover(z.id)}
          onOut={() => hover(null)}
        />
      ))}

      {/* Check badge on selected zones */}
      {ZONES.filter((z) => isSel(z.id)).map((z) => (
        <group key={`badge-${z.id}`} position={[z.center[0], z.center[1] + 0.02, z.center[2]]}>
          <mesh>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color={primaryDark} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function Car3D(props: Car3DProps) {
  const { isDark } = props;
  return (
    <Canvas
      camera={{ position: [3.6, 1.7, 4.2], fov: 40 }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 8, 4]} intensity={1.2} />
      <directionalLight position={[-6, 5, -4]} intensity={0.45} />

      <SceneContent {...props} />

      <ContactShadows position={[0, 0, 0]} opacity={isDark ? 0.6 : 0.42} scale={9} blur={2.4} far={3} resolution={512} />

      {/* Procedural studio lighting — works offline (no HDR download) */}
      <Environment resolution={128}>
        <Lightformer intensity={2.2} position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1.4} position={[-5, 2, -1]} rotation={[0, Math.PI / 2, 0]} scale={[8, 2, 1]} />
        <Lightformer intensity={1.4} position={[5, 2, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 2, 1]} />
        <Lightformer intensity={0.8} position={[0, 2, 6]} scale={[9, 2, 1]} />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={8.5}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.75, 0]}
        makeDefault
      />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL, '/draco/');
