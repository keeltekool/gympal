'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dices } from 'lucide-react'
import Image from 'next/image'

interface ExerciseCardProps {
  name: string
  sets: number
  reps: number
  equipment: string
  localImages: [string, string]
  completed: boolean
  isNext?: boolean
  onToggle: () => void
  onSwap: () => void
  onTapName: () => void
}

export function ExerciseCard({
  name,
  sets,
  reps,
  equipment,
  localImages,
  completed,
  isNext,
  onToggle,
  onSwap,
  onTapName,
}: ExerciseCardProps) {
  const [swapRotation, setSwapRotation] = useState(0)

  function handleSwap() {
    setSwapRotation(prev => prev + 360)
    onSwap()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${
        completed
          ? 'border-border/50 bg-card/50 opacity-60'
          : isNext
            ? 'border-accent/30 bg-accent-dim'
            : 'border-border bg-card'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors active:opacity-70"
        style={{
          borderColor: completed ? '#c8ff00' : '#222230',
          backgroundColor: completed ? '#c8ff00' : 'transparent',
        }}
      >
        {completed && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, type: 'spring' }}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M3 7L6 10L11 4"
              stroke="#0a0a12"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </button>

      {/* Exercise info */}
      <div className="flex-1 min-w-0">
        <button onClick={onTapName} className="text-left active:opacity-70">
          <p className={`text-lg font-semibold leading-tight ${completed ? 'line-through text-text-tertiary' : 'text-foreground'}`}>
            {name}
          </p>
        </button>
        <p className="mt-0.5 text-sm text-text-secondary">
          <span className="font-mono">{sets} × {reps}</span>
          <span className="mx-1.5 text-text-tertiary">·</span>
          <span className="capitalize">{equipment}</span>
        </p>
      </div>

      {/* Right side: swap + thumbnail */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <button
          onClick={handleSwap}
          className="p-1 text-accent active:opacity-70"
          aria-label="Swap exercise"
        >
          <motion.span
            className="inline-block"
            animate={{ rotate: swapRotation }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Dices size={20} />
          </motion.span>
        </button>
        <div className="h-12 w-12 overflow-hidden rounded-lg bg-card-elevated">
          <Image
            src={localImages[0]}
            alt={name}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </motion.div>
  )
}
