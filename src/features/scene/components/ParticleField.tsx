import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NODE_COUNT = 80;
const CONNECTION_DISTANCE = 2.8;
const SPREAD_X = 16;
const SPREAD_Y = 10;
const SPREAD_Z = 8;

export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(NODE_COUNT * 3);
    const vel = new Float32Array(NODE_COUNT * 3);
    for (let i = 0; i < NODE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * SPREAD_X;
      pos[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
      pos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z - 4;
      vel[i * 3] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return { positions: pos, velocities: vel };
  }, []);

  // Pre-allocate line geometry (max possible connections)
  const maxLines = NODE_COUNT * 6;
  const linePositions = useMemo(() => new Float32Array(maxLines * 6), [maxLines]);
  const lineColors = useMemo(() => new Float32Array(maxLines * 6), [maxLines]);

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current) return;

    // Move particles
    for (let i = 0; i < NODE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Bounce
      if (Math.abs(positions[i3]) > SPREAD_X / 2) velocities[i3] *= -1;
      if (Math.abs(positions[i3 + 1]) > SPREAD_Y / 2) velocities[i3 + 1] *= -1;
      if (Math.abs(positions[i3 + 2] + 4) > SPREAD_Z / 2) velocities[i3 + 2] *= -1;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Build connections
    let lineIndex = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONNECTION_DISTANCE && lineIndex < maxLines) {
          const alpha = 1 - dist / CONNECTION_DISTANCE;
          const li = lineIndex * 6;

          linePositions[li] = positions[i * 3];
          linePositions[li + 1] = positions[i * 3 + 1];
          linePositions[li + 2] = positions[i * 3 + 2];
          linePositions[li + 3] = positions[j * 3];
          linePositions[li + 4] = positions[j * 3 + 1];
          linePositions[li + 5] = positions[j * 3 + 2];

          const c = alpha * 0.15;
          lineColors[li] = c * 0.6;
          lineColors[li + 1] = c;
          lineColors[li + 2] = c * 0.8;
          lineColors[li + 3] = c * 0.6;
          lineColors[li + 4] = c;
          lineColors[li + 5] = c * 0.8;

          lineIndex++;
        }
      }
    }

    const lineGeom = linesRef.current.geometry;
    lineGeom.attributes.position.needsUpdate = true;
    lineGeom.attributes.color.needsUpdate = true;
    lineGeom.setDrawRange(0, lineIndex * 2);
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color="#4ade80"
          transparent
          opacity={0.6}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </>
  );
}
