import { Canvas } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import { Experience } from './features/scene/components/Experience';
import { ScrollOverlay } from './features/overlay/components/ScrollOverlay';
import { HudOverlay } from './features/scene/components/HudOverlay';

export default function App() {
  return (
    <div className="h-screen w-screen bg-gray-950">
      {/* HUD — outside Canvas, always fixed */}
      <HudOverlay />

      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#030712' }}
      >
        <ScrollControls pages={6} damping={0.15}>
          <Experience />
          <ScrollOverlay />
        </ScrollControls>
      </Canvas>
    </div>
  );
}
