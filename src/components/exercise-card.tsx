'use client'

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
  onToggle,
  onSwap,
  onTapName,
}: ExerciseCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-opacity ${
        completed ? 'opacity-50' : ''
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors active:opacity-70"
        style={{
          borderColor: completed ? '#16a34a' : '#d1d5db',
          backgroundColor: completed ? '#16a34a' : 'transparent',
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
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </button>

      {/* Exercise info */}
      <div className="flex-1 min-w-0">
        <button onClick={onTapName} className="text-left active:opacity-70">
          <p className="text-lg font-semibold leading-tight">{name}</p>
        </button>
        <p className="mt-0.5 text-sm text-gray-500">
          <span className="font-mono">{sets} × {reps}</span>
          <span className="mx-1.5">·</span>
          <span className="capitalize">{equipment}</span>
        </p>
      </div>

      {/* Right side: swap + thumbnail */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <button
          onClick={onSwap}
          className="p-1 text-blue-600 active:opacity-70"
          aria-label="Swap exercise"
        >
          <Dices size={20} />
        </button>
        <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
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
