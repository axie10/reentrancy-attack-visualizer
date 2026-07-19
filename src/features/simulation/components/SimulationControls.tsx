interface SimulationControlsProps {
  readonly isPlaying: boolean;
  readonly isComplete: boolean;
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly progress: number;
  readonly onPlay: () => void;
  readonly onPause: () => void;
  readonly onReset: () => void;
  readonly onNext: () => void;
  readonly onPrev: () => void;
}

export function SimulationControls({
  isPlaying,
  isComplete,
  currentStep,
  totalSteps,
  progress,
  onPlay,
  onPause,
  onReset,
  onNext,
  onPrev,
}: SimulationControlsProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Progress */}
      <div className="flex w-full items-center gap-3">
        <span className="font-mono text-[11px] text-gray-700">
          {currentStep + 1}/{totalSteps}
        </span>
        <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentStep === 0}
          className="rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-20"
          aria-label="Previous step"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {isComplete ? (
          <button
            onClick={onReset}
            className="rounded-full bg-gray-800 px-5 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-gray-700"
          >
            Replay
          </button>
        ) : (
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="min-w-[120px] rounded-full bg-gray-100 px-5 py-2 text-sm font-medium text-gray-900 transition-all hover:bg-white"
          >
            {isPlaying ? 'Pause' : currentStep === 0 ? 'Run Attack' : 'Continue'}
          </button>
        )}

        <button
          onClick={onNext}
          disabled={isComplete}
          className="rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-20"
          aria-label="Next step"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
