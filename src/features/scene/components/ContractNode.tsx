import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface ContractNodeProps {
  readonly position: [number, number, number];
  readonly label: string;
  readonly balance: number;
  readonly isActive: boolean;
  readonly variant: 'bank' | 'attacker';
  readonly githubUrl: string;
}

export function ContractNode({
  position,
  label,
  balance,
  isActive,
  variant,
  githubUrl,
}: ContractNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = variant === 'bank' ? '#10b981' : '#ef4444';
  const colorObj = new THREE.Color(color);

  const handleClick = useCallback(() => {
    window.open(githubUrl, '_blank', 'noopener,noreferrer');
  }, [githubUrl]);

  const handlePointerOver = useCallback(() => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'default';
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const offset = variant === 'bank' ? 0 : Math.PI;

    // Float
    groupRef.current.position.y =
      position[1] + Math.sin(t * 0.8 + offset) * 0.12;

    // Gentle rotation — faster on hover
    const rotSpeed = hovered ? 0.4 : 0.15;
    groupRef.current.rotation.y = Math.sin(t * 0.3 + offset) * rotSpeed;

    // Ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z = t * (hovered ? 1.2 : 0.5);
      ringRef.current.rotation.x = Math.sin(t * 0.3) * 0.3;
    }

    // Pulse inner glow
    if (innerGlowRef.current) {
      const mat = innerGlowRef.current.material as THREE.MeshBasicMaterial;
      const baseOpacity = hovered ? 0.08 : isActive ? 0.06 : 0.02;
      const pulse = hovered || isActive ? Math.sin(t * 3) * 0.08 : 0;
      const targetOpacity = baseOpacity + pulse;
      mat.opacity += (targetOpacity - mat.opacity) * 0.1;
    }
  });

  const isHighlighted = hovered || isActive;

  return (
    <group ref={groupRef} position={position}>
      {/* Outer glow sphere */}
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isHighlighted ? 0.03 : 0.005}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Inner glow */}
      <mesh ref={innerGlowRef} scale={[1.15, 0.85, 0.4]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.03}
          depthWrite={false}
        />
      </mesh>

      {/* Clickable hitbox — invisible but captures events */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[2.2, 1.5, 0.6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Main box - glass style */}
      <RoundedBox args={[2, 1.3, 0.35]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          color="#111827"
          metalness={0.3}
          roughness={0.1}
          transmission={0.3}
          thickness={0.5}
          envMapIntensity={0.5}
          emissive={colorObj}
          emissiveIntensity={isHighlighted ? 0.4 : 0.05}
        />
      </RoundedBox>

      {/* Edge wireframe */}
      <RoundedBox args={[2.02, 1.32, 0.37]} radius={0.06} smoothness={4}>
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={isHighlighted ? 0.5 : 0.1}
        />
      </RoundedBox>

      {/* Orbiting ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.4, 0.008, 16, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isHighlighted ? 0.8 : 0.15}
        />
      </mesh>

      {/* Second ring on hover */}
      {hovered && (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.5, 0.005, 16, 64]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Corner indicators */}
      {[
        [-0.95, 0.6, 0.18],
        [0.95, 0.6, 0.18],
        [-0.95, -0.6, 0.18],
        [0.95, -0.6, 0.18],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[isHighlighted ? 0.035 : 0.025, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={isHighlighted ? 1 : 0.3}
          />
        </mesh>
      ))}

      {/* Label */}
      <Text
        position={[0, 0.25, 0.5]}
        fontSize={0.13}
        color={hovered ? color : '#9ca3af'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        {label.toUpperCase()}
      </Text>

      {/* Balance */}
      <Text
        position={[0, -0.2, 0.5]}
        fontSize={0.28}
        color={isHighlighted ? color : '#f9fafb'}
        anchorX="center"
        anchorY="middle"
      >
        {`${balance} ETH`}
      </Text>

      {/* Hover tooltip */}
      {hovered && (
        <Html position={[0, -1.3, 0]} center>
          <div
            style={{
              background: 'rgba(3, 7, 18, 0.85)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${variant === 'bank' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: '8px',
              padding: '6px 12px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: '10px',
                color: '#9ca3af',
                letterSpacing: '0.05em',
              }}
            >
              Click to view{' '}
              <span style={{ color: variant === 'bank' ? '#10b981' : '#ef4444' }}>
                {variant === 'bank' ? 'SimpleBank.sol' : 'Attack.sol'}
              </span>
              {' '}on GitHub
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
