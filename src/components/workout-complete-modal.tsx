'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface WorkoutCompleteModalProps {
  open: boolean
  elapsed: string
  completedCount: number
  totalCount: number
  onSaveToVault: () => void
  onDone: () => void
}

export function WorkoutCompleteModal({
  open,
  elapsed,
  completedCount,
  totalCount,
  onSaveToVault,
  onDone,
}: WorkoutCompleteModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(10, 10, 18, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-lg border border-border bg-card-elevated p-6 text-center"
          >
            <h2 className="text-2xl font-bold text-foreground">
              {completedCount === totalCount ? 'Workout Complete!' : 'Workout Ended'}
            </h2>

            <div className="mt-4 space-y-1">
              <p className="font-mono text-3xl font-medium text-accent">{elapsed}</p>
              <p className="text-sm text-text-secondary">
                {completedCount} of {totalCount} completed
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={onSaveToVault}
                className="h-[44px] w-full rounded-lg border border-accent text-base font-semibold text-accent transition-opacity active:opacity-70"
              >
                Save to Vault
              </button>
              <button
                onClick={onDone}
                className="h-[44px] w-full rounded-lg bg-accent text-base font-semibold text-background transition-opacity active:opacity-70"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
