import { motion } from 'framer-motion';

interface ContractBlockProps {
  readonly label: string;
  readonly balance: number;
  readonly isActive: boolean;
  readonly variant: 'bank' | 'attacker';
  readonly codeHighlight?: string | null;
}

export function ContractBlock({
  label,
  balance,
  isActive,
  variant,
  codeHighlight,
}: ContractBlockProps) {
  const accent = variant === 'attacker' ? 'red' : 'emerald';
  const dotColor = variant === 'attacker' ? 'bg-red-400' : 'bg-emerald-400';

  return (
    <motion.div
      layout
      animate={isActive ? { scale: 1.02 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative flex-1"
    >
      {/* Glow effect */}
      {isActive && (
        <motion.div
          layoutId={`glow-${variant}`}
          className={`absolute -inset-px rounded-2xl bg-gradient-to-b ${
            variant === 'attacker'
              ? 'from-red-500/20 to-transparent'
              : 'from-emerald-500/20 to-transparent'
          } blur-sm`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      <div
        className={`relative rounded-2xl border bg-gray-900/80 p-6 backdrop-blur-sm transition-colors duration-300 ${
          isActive
            ? `border-${accent}-500/40`
            : 'border-gray-800'
        }`}
      >
        <div className="mb-4 flex items-center gap-2.5">
          <div className={`h-2 w-2 rounded-full ${dotColor}`} />
          <span className="font-mono text-[13px] font-medium tracking-wide text-gray-400">
            {label}
          </span>
        </div>

        <div className="mb-1">
          <span className="text-xs text-gray-600">Balance</span>
        </div>
        <motion.div
          key={balance}
          initial={{ scale: 1.15, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="font-mono text-3xl font-bold text-gray-50"
        >
          {balance}
          <span className="ml-1.5 text-sm font-normal text-gray-600">ETH</span>
        </motion.div>

        {codeHighlight && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden rounded-lg bg-gray-950/80 px-3 py-2.5"
          >
            <code className="font-mono text-[11px] leading-relaxed text-amber-300/80">
              {codeHighlight}
            </code>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
