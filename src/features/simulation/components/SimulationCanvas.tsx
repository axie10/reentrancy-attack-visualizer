import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../hooks/useSimulation';
import { ContractBlock } from './ContractBlock';
import { EthFlow } from './EthFlow';
import { CallStack } from './CallStack';
import { SimulationControls } from './SimulationControls';

export function SimulationCanvas() {
  const {
    currentStep,
    totalSteps,
    currentStepIndex,
    isPlaying,
    isComplete,
    progress,
    play,
    pause,
    reset,
    nextStep,
    prevStep,
  } = useSimulation();

  return (
    <div className="rounded-3xl border border-gray-800/60 bg-gray-900/30 p-6 backdrop-blur-sm md:p-10">
      {/* Contracts + Flow */}
      <div className="mb-8 flex items-start gap-4 md:gap-6">
        <ContractBlock
          label={currentStep.bank.label}
          balance={currentStep.bank.balance}
          isActive={currentStep.activeContract === 'bank'}
          variant="bank"
          codeHighlight={
            currentStep.activeContract === 'bank'
              ? currentStep.activeCodeLine?.code
              : null
          }
        />

        <div className="flex shrink-0 items-center self-center">
          <EthFlow flow={currentStep.ethFlow} />
        </div>

        <ContractBlock
          label={currentStep.attacker.label}
          balance={currentStep.attacker.balance}
          isActive={currentStep.activeContract === 'attacker'}
          variant="attacker"
          codeHighlight={
            currentStep.activeContract === 'attacker'
              ? currentStep.activeCodeLine?.code
              : null
          }
        />
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mb-8"
        >
          <p className="text-center text-sm leading-relaxed text-gray-400 md:text-[15px]">
            {currentStep.description}
          </p>

          {currentStep.vulnerability && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mx-auto mt-3 max-w-xl rounded-xl bg-red-500/5 px-4 py-2.5 text-center font-mono text-xs text-red-400/90 ring-1 ring-red-500/10"
            >
              {currentStep.vulnerability}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Call Stack */}
      {currentStep.callStack.length > 0 && (
        <div className="mb-8">
          <CallStack
            frames={currentStep.callStack}
            reentrantDepth={currentStep.reentrantDepth}
          />
        </div>
      )}

      {/* Controls */}
      <SimulationControls
        isPlaying={isPlaying}
        isComplete={isComplete}
        currentStep={currentStepIndex}
        totalSteps={totalSteps}
        progress={progress}
        onPlay={play}
        onPause={pause}
        onReset={reset}
        onNext={nextStep}
        onPrev={prevStep}
      />
    </div>
  );
}
