'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { GeneratedExercise } from '@/lib/workout-generator'

interface ExerciseDetailProps {
  exercise: GeneratedExercise
  onClose: () => void
}

type Tab = 'howto' | 'info'

export function ExerciseDetail({ exercise, onClose }: ExerciseDetailProps) {
  const [tab, setTab] = useState<Tab>('howto')

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-none bg-background"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]"
        style={{ background: 'rgba(10, 10, 18, 0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <button
          onClick={onClose}
          className="mb-3 flex items-center gap-1 text-sm font-medium text-accent active:opacity-70"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <h1 className="text-2xl font-bold text-foreground">{exercise.name}</h1>

        {/* Tabs */}
        <div className="mt-3 flex gap-6 border-b border-border">
          {(['howto', 'info'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-text-tertiary'
              }`}
            >
              {t === 'howto' ? 'How To' : 'Info'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="selectable px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {tab === 'howto' ? (
          <>
            {/* Demo images side by side */}
            <div className="mb-6 flex gap-3">
              {exercise.localImages.map((img, i) => (
                <div key={i} className="flex-1">
                  <div className="overflow-hidden rounded-lg bg-card-elevated">
                    <Image
                      src={img}
                      alt={`${exercise.name} - ${i === 0 ? 'start' : 'end'} position`}
                      width={300}
                      height={300}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                  <p className="mt-1.5 text-center font-mono text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
                    {i === 0 ? 'Start Position' : 'End Position'}
                  </p>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <ol className="space-y-3">
              {exercise.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-base leading-relaxed text-text-secondary">
                  <span className="shrink-0 font-mono text-sm font-medium text-accent">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <div className="space-y-4">
            {/* Muscle tags */}
            <div>
              <p className="text-sm font-medium text-text-tertiary">Primary Muscles</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {exercise.primaryMuscles.map((m) => (
                  <span key={m} className="rounded-md bg-accent-dim px-2.5 py-1 text-sm font-medium capitalize text-accent">
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-text-tertiary">Secondary Muscles</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {exercise.secondaryMuscles.length > 0 ? exercise.secondaryMuscles.map((m) => (
                  <span key={m} className="rounded-md bg-card-elevated px-2.5 py-1 text-sm font-medium capitalize text-text-secondary">
                    {m}
                  </span>
                )) : (
                  <span className="text-sm text-text-tertiary">None</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-text-tertiary">Equipment</p>
              <p className="mt-1 text-base font-medium capitalize text-foreground">{exercise.equipment}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-tertiary">Difficulty</p>
              <p className="mt-1 text-base font-medium capitalize text-foreground">{exercise.level}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-tertiary">Sets × Reps</p>
              <p className="mt-1 font-mono text-base font-medium text-foreground">
                {exercise.sets} × {exercise.reps}
              </p>
            </div>

            {/* Effort guidance */}
            <details className="mt-4 rounded-lg border border-border bg-card p-3">
              <summary className="cursor-pointer text-sm font-semibold text-accent">
                Effort Guidance
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Aim for ~80% effort on each set. You should feel like you could do 2-3 more reps
                at the end of each set, but not more. The last rep should feel challenging but
                achievable with good form. If form breaks down, reduce the weight.
              </p>
            </details>
          </div>
        )}
      </div>
    </motion.div>
  )
}
