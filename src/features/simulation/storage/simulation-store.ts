import { useSyncExternalStore } from 'react';
import type { SimulationStep } from '../engine/types';
import { generateSimulationSteps } from '../engine/simulation-engine';

interface SimulationSnapshot {
  readonly step: SimulationStep;
  readonly stepIndex: number;
  readonly totalSteps: number;
}

const steps = generateSimulationSteps();

let snapshot: SimulationSnapshot = {
  step: steps[0],
  stepIndex: 0,
  totalSteps: steps.length,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function setSimulationStep(stepIndex: number) {
  const clamped = Math.max(0, Math.min(stepIndex, steps.length - 1));
  if (clamped === snapshot.stepIndex) return;

  snapshot = {
    step: steps[clamped],
    stepIndex: clamped,
    totalSteps: steps.length,
  };
  notify();
}

export function useSimulationSnapshot(): SimulationSnapshot {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot,
  );
}
