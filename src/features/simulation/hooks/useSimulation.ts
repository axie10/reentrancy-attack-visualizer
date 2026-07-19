import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { generateSimulationSteps } from '../engine/simulation-engine';
import { SIMULATION_CONFIG } from '../constants';
import type { SimulationState, SimulationStep } from '../engine/types';

interface UseSimulationReturn {
  readonly currentStep: SimulationStep;
  readonly totalSteps: number;
  readonly currentStepIndex: number;
  readonly isPlaying: boolean;
  readonly isComplete: boolean;
  readonly progress: number;
  play: () => void;
  pause: () => void;
  reset: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
}

export function useSimulation(): UseSimulationReturn {
  const steps = useMemo(() => generateSimulationSteps(), []);

  const [state, setState] = useState<SimulationState>({
    steps,
    currentStepIndex: 0,
    isPlaying: false,
    isComplete: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentStepIndex + 1;
      const isLastStep = nextIndex >= prev.steps.length - 1;

      return {
        ...prev,
        currentStepIndex: Math.min(nextIndex, prev.steps.length - 1),
        isComplete: isLastStep,
        isPlaying: isLastStep ? false : prev.isPlaying,
      };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStepIndex: Math.max(prev.currentStepIndex - 1, 0),
      isComplete: false,
    }));
  }, []);

  const goToStep = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      currentStepIndex: Math.max(0, Math.min(index, prev.steps.length - 1)),
      isComplete: index >= prev.steps.length - 1,
      isPlaying: false,
    }));
    clearAutoPlay();
  }, [clearAutoPlay]);

  const play = useCallback(() => {
    setState((prev) => {
      if (prev.isComplete) {
        return { ...prev, currentStepIndex: 0, isPlaying: true, isComplete: false };
      }
      return { ...prev, isPlaying: true };
    });
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
    clearAutoPlay();
  }, [clearAutoPlay]);

  const reset = useCallback(() => {
    clearAutoPlay();
    setState({
      steps,
      currentStepIndex: 0,
      isPlaying: false,
      isComplete: false,
    });
  }, [clearAutoPlay, steps]);

  useEffect(() => {
    if (state.isPlaying && !state.isComplete) {
      intervalRef.current = setInterval(nextStep, SIMULATION_CONFIG.autoPlayInterval);
    } else {
      clearAutoPlay();
    }

    return clearAutoPlay;
  }, [state.isPlaying, state.isComplete, nextStep, clearAutoPlay]);

  const currentStep = state.steps[state.currentStepIndex];
  const progress = ((state.currentStepIndex) / (state.steps.length - 1)) * 100;

  return {
    currentStep,
    totalSteps: state.steps.length,
    currentStepIndex: state.currentStepIndex,
    isPlaying: state.isPlaying,
    isComplete: state.isComplete,
    progress,
    play,
    pause,
    reset,
    nextStep,
    prevStep,
    goToStep,
  };
}
