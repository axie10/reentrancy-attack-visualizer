import { useMemo, useState } from 'react';
import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { generateSimulationSteps } from '../engine/simulation-engine';
import type { SimulationStep } from '../engine/types';
import { setSimulationStep } from '../storage/simulation-store';

interface UseScrollSimulationReturn {
  readonly currentStep: SimulationStep;
  readonly currentStepIndex: number;
  readonly totalSteps: number;
}

export function useScrollSimulation(): UseScrollSimulationReturn {
  const steps = useMemo(() => generateSimulationSteps(), []);
  const scroll = useScroll();
  const [currentIndex, setCurrentIndex] = useState(0);

  useFrame(() => {
    const offset = scroll.offset;
    const simulationRange = Math.max(0, Math.min(1, (offset - 0.1) / 0.65));
    const stepIndex = Math.max(
      0,
      Math.min(Math.floor(simulationRange * steps.length), steps.length - 1),
    );

    if (stepIndex !== currentIndex) {
      setCurrentIndex(stepIndex);
      setSimulationStep(stepIndex);
    }
  });

  return {
    currentStep: steps[currentIndex],
    currentStepIndex: currentIndex,
    totalSteps: steps.length,
  };
}