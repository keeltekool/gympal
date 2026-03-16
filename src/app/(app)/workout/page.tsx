'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { WorkoutHeader } from '@/components/workout-header'
import { ExerciseCard } from '@/components/exercise-card'
import { WorkoutCompleteModal } from '@/components/workout-complete-modal'
import { ExerciseDetail } from '@/components/exercise-detail'
import type { GeneratedExercise } from '@/lib/workout-generator'

interface WorkoutData {
  sessionId: string
  duration: number
  exercises: GeneratedExercise[]
}

interface ExerciseState extends GeneratedExercise {
  id?: string
  completed: boolean
}

export default function WorkoutPage() {
  const router = useRouter()
  const [workout, setWorkout] = useState<WorkoutData | null>(null)
  const [exercises, setExercises] = useState<ExerciseState[]>([])
  const [showComplete, setShowComplete] = useState(false)
  const [detailExercise, setDetailExercise] = useState<ExerciseState | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef<number>(Date.now())

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Wake Lock — keep screen on during workout (iOS 16.4+ and all modern Android)
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null

    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
        }
      } catch {}
    }

    requestWakeLock()

    // Re-acquire wake lock when tab becomes visible again (iOS releases it on tab switch)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestWakeLock()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      wakeLock?.release().catch(() => {})
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const elapsedStr = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  // Load workout from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('activeWorkout')
    if (!stored) {
      router.replace('/train')
      return
    }
    const data: WorkoutData = JSON.parse(stored)
    setWorkout(data)
    setExercises(data.exercises.map(ex => ({ ...ex, completed: false })))
  }, [router])

  const completedCount = exercises.filter(e => e.completed).length

  // Find first non-completed exercise index
  const nextIndex = exercises.findIndex(e => !e.completed)

  // Toggle exercise completion
  const toggleExercise = useCallback(async (index: number) => {
    setExercises(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], completed: !updated[index].completed }

      // Check if all completed
      const allDone = updated.every(e => e.completed)
      if (allDone) {
        setTimeout(() => setShowComplete(true), 300)
      }

      return updated
    })

    // Persist to DB if we have an exercise ID
    if (exercises[index].id) {
      fetch('/api/workout/exercise', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: exercises[index].id,
          completed: !exercises[index].completed,
        }),
      }).catch(() => {})
    }
  }, [exercises])

  // Swap single exercise
  const swapExercise = useCallback(async (index: number) => {
    const current = exercises[index]
    const sessionExercises = exercises.map(e => e.name)

    try {
      const res = await fetch('/api/workout/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentName: current.name,
          movementPattern: current.movementPattern,
          sessionExercises,
        }),
      })

      if (!res.ok) return

      const { exercise } = await res.json()
      setExercises(prev => {
        const updated = [...prev]
        updated[index] = { ...exercise, completed: false }
        return updated
      })
    } catch {}
  }, [exercises])

  // Shuffle entire workout
  const shuffleWorkout = useCallback(async () => {
    if (!workout) return
    try {
      const res = await fetch('/api/workout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: workout.duration }),
      })
      const { exercises: newExercises } = await res.json()
      setExercises(newExercises.map((ex: GeneratedExercise) => ({ ...ex, completed: false })))
    } catch {}
  }, [workout])

  // End workout (complete or early)
  const endWorkout = useCallback(async (saveToVault: boolean) => {
    if (!workout) return

    // Update session in DB
    await fetch('/api/workout/session', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: workout.sessionId,
        actualDuration: elapsed,
        completedCount,
      }),
    }).catch(() => {})

    if (saveToVault) {
      const name = `Full Body · ${workout.duration} min`
      await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          duration: workout.duration,
          exercises: exercises.map(({ name, movementPattern, tier, sets, reps, equipment, localImages }) => ({
            name, movementPattern, tier, sets, reps, equipment, localImages,
          })),
        }),
      }).catch(() => {})
    }

    sessionStorage.removeItem('activeWorkout')
    router.replace('/train')
  }, [workout, elapsed, completedCount, exercises, router])

  if (!workout) return null

  return (
    <div className="min-h-screen bg-background pb-28">
      <WorkoutHeader
        duration={workout.duration}
        completedCount={completedCount}
        totalCount={exercises.length}
      />

      {/* Shuffle button */}
      <div className="flex justify-end px-5 py-2">
        <button
          onClick={shuffleWorkout}
          className="flex items-center gap-1.5 text-sm font-medium text-accent active:opacity-70"
        >
          <RefreshCw size={16} />
          Shuffle
        </button>
      </div>

      {/* Exercise list */}
      <div className="space-y-3 px-5">
        <AnimatePresence mode="popLayout">
          {exercises.map((ex, i) => (
            <ExerciseCard
              key={`${ex.name}-${i}`}
              name={ex.name}
              sets={ex.sets}
              reps={ex.reps}
              equipment={ex.equipment}
              localImages={ex.localImages}
              completed={ex.completed}
              isNext={i === nextIndex}
              onToggle={() => toggleExercise(i)}
              onSwap={() => swapExercise(i)}
              onTapName={() => setDetailExercise(ex)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* End Workout button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
        style={{ background: 'rgba(10, 10, 18, 0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <button
          onClick={() => setShowComplete(true)}
          className="h-[44px] w-full rounded-lg border border-danger text-base font-semibold text-danger transition-opacity active:opacity-70"
        >
          End Workout
        </button>
      </div>

      {/* Exercise detail overlay */}
      <AnimatePresence>
        {detailExercise && (
          <ExerciseDetail
            exercise={detailExercise}
            onClose={() => setDetailExercise(null)}
          />
        )}
      </AnimatePresence>

      {/* Completion modal */}
      <WorkoutCompleteModal
        open={showComplete}
        elapsed={elapsedStr}
        completedCount={completedCount}
        totalCount={exercises.length}
        onSaveToVault={() => endWorkout(true)}
        onDone={() => endWorkout(false)}
      />
    </div>
  )
}
