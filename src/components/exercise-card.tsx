'use client'

import { useState, useEffect } from 'react'
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
  const [imgIndex, setImgIndex] = useState(0)

  useEffect(() => {
    if (completed) return
    const interval = setInterval(() => {
      setImgIndex(prev => prev === 0 ? 1 : 0)
    }, 1800)
    return () => clearInterval(interval)
  }, [completed])

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

      {/* Right side: swap icon + thumbnail side by side */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={handleSwap}
          className="p-1.5 text-accent active:opacity-70"
          aria-label="Swap exercise"
        >
          <motion.span
            className="inline-block"
            animate={{ rotate: swapRotation }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Dices size={18} />
          </motion.span>
        </button>
        <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-card-elevated">
          <Image
            src={localImages[0]}
            alt={`${name} - start`}
            width={64}
            height={64}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${imgIndex === 0 ? 'opacity-100' : 'opacity-0'}`}
          />
          <Image
            src={localImages[1]}
            alt={`${name} - end`}
            width={64}
            height={64}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${imgIndex === 1 ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      </div>
    </motion.div>
  )
}
