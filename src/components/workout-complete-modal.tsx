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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-lg bg-white p-6 text-center"
          >
            <h2 className="text-2xl font-bold">
              {completedCount === totalCount ? 'Workout Complete!' : 'Workout Ended'}
            </h2>

            <div className="mt-4 space-y-1">
              <p className="font-mono text-3xl font-medium">{elapsed}</p>
              <p className="text-sm text-gray-500">
                {completedCount} of {totalCount} completed
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={onSaveToVault}
                className="h-[44px] w-full rounded-lg border border-blue-600 text-base font-semibold text-blue-600 transition-opacity active:opacity-70"
              >
                Save to Vault
              </button>
              <button
                onClick={onDone}
                className="h-[44px] w-full rounded-lg bg-blue-600 text-base font-semibold text-white transition-opacity active:opacity-70"
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
