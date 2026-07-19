import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function GridFloor() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, -2]}>
      <planeGeometry args={[40, 40, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#10b981') },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          varying vec2 vUv;

          void main() {
            vec2 grid = abs(fract(vUv * 20.0 - 0.5) - 0.5);
            float line = min(grid.x, grid.y);
            float gridLine = 1.0 - smoothstep(0.0, 0.03, line);

            // Fade out at edges
            float fadeX = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
            float fadeY = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
            float fade = fadeX * fadeY;

            // Pulse
            float pulse = 0.5 + 0.5 * sin(uTime * 0.5 + vUv.y * 6.0);

            float alpha = gridLine * fade * 0.08 * (0.7 + pulse * 0.3);
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </mesh>
  );
}
