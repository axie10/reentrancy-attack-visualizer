import { motion, AnimatePresence } from 'framer-motion';
import type { EthFlowAnimation } from '../engine/types';

interface EthFlowProps {
  readonly flow: EthFlowAnimation | null;
}

export function EthFlow({ flow }: EthFlowProps) {
  const direction = flow?.from === 'bank' ? 1 : -1;

  return (
    <div className="flex h-12 w-32 shrink-0 items-center justify-center">
      <AnimatePresence mode="wait">
        {flow && (
          <motion.div
            key={`${flow.from}-${flow.to}-${flow.amount}`}
            initial={{ opacity: 0, x: direction * -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * 20 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ x: [0, direction * 6, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-full bg-amber-500/15 px-3 py-1 ring-1 ring-amber-500/20"
            >
              <span className="font-mono text-xs font-semibold text-amber-400">
                {flow.amount} ETH
              </span>
            </motion.div>
            <span className="text-gray-700">{direction === 1 ? '→' : '←'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
