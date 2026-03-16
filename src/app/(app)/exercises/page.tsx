'use client'

import { useState } from 'react'
import { exercises } from '@/lib/exercises'
import { ExerciseDetail } from '@/components/exercise-detail'
import { AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import type { Exercise } from '@/lib/exercises'

type BodyGroup = 'upper' | 'lower' | 'core'

const bodyGroups: { key: BodyGroup; label: string; patterns: string[] }[] = [
  { key: 'upper', label: 'Upper Body', patterns: ['push', 'pull'] },
  { key: 'lower', label: 'Lower Body', patterns: ['squat', 'hinge', 'lunge'] },
  { key: 'core', label: 'Core', patterns: ['core'] },
]

function groupExercises() {
  const grouped: Record<BodyGroup, Exercise[]> = { upper: [], lower: [], core: [] }
  for (const ex of exercises) {
    for (const bg of bodyGroups) {
      if (bg.patterns.includes(ex.movementPattern)) {
        grouped[bg.key].push(ex)
        break
      }
    }
  }
  // Sort each group: A tier first, then B, then C
  const tierOrder = { A: 0, B: 1, C: 2 }
  for (const key of Object.keys(grouped) as BodyGroup[]) {
    grouped[key].sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier])
  }
  return grouped
}

const grouped = groupExercises()

export default function ExercisesPage() {
  const [activeGroup, setActiveGroup] = useState<BodyGroup>('upper')
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null)

  return (
    <div className="px-5 pt-14">
      <h1 className="mb-1 text-[28px] font-bold text-foreground">Exercises</h1>
      <p className="mb-5 text-sm text-text-secondary">{exercises.length} exercises in the library</p>

      {/* Body group tabs */}
      <div className="mb-6 flex gap-2">
        {bodyGroups.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveGroup(key)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors active:opacity-70 ${
              activeGroup === key
                ? 'bg-accent text-background'
                : 'border border-border bg-card text-text-secondary'
            }`}
          >
            {label}
            <span className="ml-1.5 font-mono text-xs opacity-70">{grouped[key].length}</span>
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="space-y-3">
        {grouped[activeGroup].map((ex) => (
          <button
            key={ex.name}
            onClick={() => setDetailExercise(ex)}
            className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-4 text-left active:opacity-70"
          >
            {/* Thumbnail */}
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-card-elevated">
              <Image
                src={ex.localImages[0]}
                alt={ex.name}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold leading-tight text-foreground">{ex.name}</p>
              <p className="mt-0.5 text-sm text-text-secondary">
                <span className="capitalize">{ex.equipment}</span>
                <span className="mx-1.5 text-text-tertiary">·</span>
                <span className="capitalize">{ex.movementPattern}</span>
              </p>
            </div>

            {/* Tier badge */}
            <span className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-xs font-bold ${
              ex.tier === 'A'
                ? 'bg-accent-dim text-accent'
                : ex.tier === 'B'
                  ? 'bg-teal/10 text-teal'
                  : 'bg-card-elevated text-text-tertiary'
            }`}>
              {ex.tier}
            </span>
          </button>
        ))}
      </div>

      {/* Exercise detail overlay */}
      <AnimatePresence>
        {detailExercise && (
          <ExerciseDetail
            exercise={{ ...detailExercise, sets: 3, reps: 12 }}
            onClose={() => setDetailExercise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
