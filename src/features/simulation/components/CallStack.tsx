import { motion, AnimatePresence } from 'framer-motion';
import type { CallStackFrame } from '../engine/types';

interface CallStackProps {
  readonly frames: readonly CallStackFrame[];
  readonly reentrantDepth: number;
}

export function CallStack({ frames, reentrantDepth }: CallStackProps) {
  if (frames.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-xs font-medium text-gray-600">Call Stack</span>
        {reentrantDepth > 1 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-full bg-red-500/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-red-400 ring-1 ring-red-500/20"
          >
            depth {reentrantDepth}
          </motion.span>
        )}
      </div>

      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {frames.map((frame, index) => {
            const isReentrant = frame.functionName.includes('reentrant');
            return (
              <motion.div
                key={`${frame.functionName}-${frame.depth}`}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs ${
                  isReentrant
                    ? 'bg-red-500/5 text-red-300 ring-1 ring-red-500/10'
                    : 'bg-gray-800/40 text-gray-400'
                }`}
              >
                <span className="w-4 text-right text-gray-700">
                  {frame.depth}
                </span>
                <span className="text-gray-800">│</span>
                <span className={isReentrant ? 'text-red-400' : ''}>
                  {frame.target === 'bank' ? 'SimpleBank' : 'Attack'}.
                  {frame.functionName}()
                </span>
                {frame.value !== undefined && (
                  <span className="ml-auto text-gray-700">
                    {'{'}value: {frame.value}{'}'}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
