import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { EthFlowAnimation } from '../../simulation/engine/types';

interface EthBeamProps {
  readonly flow: EthFlowAnimation | null;
  readonly bankPosition: [number, number, number];
  readonly attackerPosition: [number, number, number];
  readonly reentrantDepth: number;
}

const PARTICLES_PER_STREAM = 25;
const STREAM_COUNT = 3;
const TOTAL_PARTICLES = PARTICLES_PER_STREAM * STREAM_COUNT;

export function EthBeam({
  flow,
  bankPosition,
  attackerPosition,
  reentrantDepth,
}: EthBeamProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => new Float32Array(TOTAL_PARTICLES * 3), []);
  const sizes = useMemo(() => {
    const s = new Float32Array(TOTAL_PARTICLES);
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      s[i] = 0.03 + Math.random() * 0.04;
    }
    return s;
  }, []);

  const from = useMemo(
    () => new THREE.Vector3(...(flow?.from === 'bank' ? bankPosition : attackerPosition)),
    [flow, bankPosition, attackerPosition],
  );

  const to = useMemo(
    () => new THREE.Vector3(...(flow?.to === 'bank' ? bankPosition : attackerPosition)),
    [flow, bankPosition, attackerPosition],
  );

  useFrame(() => {
    if (!pointsRef.current || !flow) return;

    const time = Date.now() * 0.003;
    const speed = 0.8 + reentrantDepth * 0.25;

    for (let s = 0; s < STREAM_COUNT; s++) {
      const streamOffset = s / STREAM_COUNT;
      const waveAmplitude = 0.08 + s * 0.04;

      for (let i = 0; i < PARTICLES_PER_STREAM; i++) {
        const idx = s * PARTICLES_PER_STREAM + i;
        const t = ((i / PARTICLES_PER_STREAM + time * speed + streamOffset) % 1);
        const pos = new THREE.Vector3().lerpVectors(from, to, t);

        // Wave offset per stream
        pos.y += Math.sin(t * Math.PI * 3 + time * 2 + s * 2.1) * waveAmplitude;
        pos.z += Math.cos(t * Math.PI * 2 + time * 1.5 + s * 1.7) * waveAmplitude * 0.5;

        positions[idx * 3] = pos.x;
        positions[idx * 3 + 1] = pos.y;
        positions[idx * 3 + 2] = pos.z;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!flow) return null;

  const beamColor = reentrantDepth > 1 ? '#ef4444' : '#f59e0b';
  const intensity = Math.min(1, 0.6 + reentrantDepth * 0.15);

  return (
    <>
      {/* Main particle streams */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06 + reentrantDepth * 0.01}
          color={beamColor}
          transparent
          opacity={intensity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Core line glow */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([...from.toArray(), ...to.toArray()]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={beamColor}
          transparent
          opacity={0.08 + reentrantDepth * 0.03}
          blending={THREE.AdditiveBlending}
        />
      </line>
    </>
  );
}
