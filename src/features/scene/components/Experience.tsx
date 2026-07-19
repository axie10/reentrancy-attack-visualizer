import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useScrollSimulation } from '../../simulation/hooks/useScrollSimulation';
import { ContractNode } from './ContractNode';
import { EthBeam } from './EthBeam';
import { ParticleField } from './ParticleField';
import { GridFloor } from './GridFloor';
import { GITHUB_LINKS } from '../../simulation/constants';
import * as THREE from 'three';

const BANK_POS: [number, number, number] = [-2.8, 0, 0];
const ATTACKER_POS: [number, number, number] = [2.8, 0, 0];

function CameraRig() {
  const { pointer } = useThree();
  const smoothMouse = useRef(new THREE.Vector2(0, 0));

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();

    smoothMouse.current.x += (pointer.x - smoothMouse.current.x) * 0.03;
    smoothMouse.current.y += (pointer.y - smoothMouse.current.y) * 0.03;

    camera.position.x =
      Math.sin(t * 0.15) * 0.2 + smoothMouse.current.x * 1.2;
    camera.position.y =
      Math.cos(t * 0.1) * 0.1 + smoothMouse.current.y * 0.6;
    camera.position.z = 6;

    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function Experience() {
  const { currentStep } = useScrollSimulation();

  return (
    <>
      <CameraRig />

      <ambientLight intensity={0.15} />
      <pointLight position={[0, 8, 8]} intensity={0.6} color="#f9fafb" />
      <pointLight position={[-6, -3, 4]} intensity={0.4} color="#10b981" />
      <pointLight position={[6, -3, 4]} intensity={0.4} color="#ef4444" />
      <pointLight position={[0, 0, 6]} intensity={0.2} color="#6366f1" />

      <ParticleField />
      <GridFloor />

      <ContractNode
        position={BANK_POS}
        label={currentStep.bank.label}
        balance={currentStep.bank.balance}
        isActive={currentStep.activeContract === 'bank'}
        variant="bank"
        githubUrl={GITHUB_LINKS.simpleBank}
      />

      <ContractNode
        position={ATTACKER_POS}
        label={currentStep.attacker.label}
        balance={currentStep.attacker.balance}
        isActive={currentStep.activeContract === 'attacker'}
        variant="attacker"
        githubUrl={GITHUB_LINKS.attack}
      />

      <EthBeam
        flow={currentStep.ethFlow}
        bankPosition={BANK_POS}
        attackerPosition={ATTACKER_POS}
        reentrantDepth={currentStep.reentrantDepth}
      />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          intensity={1.5}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}
