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
      className="fixed inset-0 z-50 overflow-y-auto bg-white"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-5 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button
          onClick={onClose}
          className="mb-3 flex items-center gap-1 text-sm font-medium text-blue-600 active:opacity-70"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <h1 className="text-2xl font-bold">{exercise.name}</h1>

        {/* Tabs */}
        <div className="mt-3 flex gap-6 border-b border-gray-200">
          {(['howto', 'info'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-400'
              }`}
            >
              {t === 'howto' ? 'How To' : 'Info'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {tab === 'howto' ? (
          <>
            {/* Demo images side by side */}
            <div className="mb-6 flex gap-3">
              {exercise.localImages.map((img, i) => (
                <div key={i} className="flex-1 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={img}
                    alt={`${exercise.name} - ${i === 0 ? 'start' : 'end'} position`}
                    width={300}
                    height={300}
                    className="h-auto w-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Instructions */}
            <ol className="space-y-3">
              {exercise.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-base leading-relaxed">
                  <span className="shrink-0 font-mono text-sm font-medium text-blue-600">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-400">Primary Muscles</p>
              <p className="mt-1 text-base font-medium capitalize">
                {exercise.primaryMuscles.join(', ')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Secondary Muscles</p>
              <p className="mt-1 text-base capitalize text-gray-600">
                {exercise.secondaryMuscles.join(', ') || 'None'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Equipment</p>
              <p className="mt-1 text-base font-medium capitalize">{exercise.equipment}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Difficulty</p>
              <p className="mt-1 text-base font-medium capitalize">{exercise.level}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Sets × Reps</p>
              <p className="mt-1 font-mono text-base font-medium">
                {exercise.sets} × {exercise.reps}
              </p>
            </div>

            {/* Effort guidance */}
            <details className="mt-4 rounded-lg border border-gray-200 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-blue-600">
                Effort Guidance
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
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
