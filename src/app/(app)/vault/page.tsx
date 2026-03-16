'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'

interface VaultExercise {
  name: string
  movementPattern: string
  tier: string
  sets: number
  reps: number
  equipment: string
  localImages: [string, string]
}

interface VaultWorkout {
  id: string
  name: string
  duration: number
  exercises: VaultExercise[]
  createdAt: string
}

export default function VaultPage() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<VaultWorkout[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/vault')
      .then(r => r.json())
      .then(data => setWorkouts(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  async function deleteWorkout(id: string) {
    await fetch('/api/vault', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  async function useWorkout(workout: VaultWorkout) {
    // Create a new session with vault exercises
    const res = await fetch('/api/workout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duration: workout.duration,
        exercises: workout.exercises,
      }),
    })
    const { sessionId } = await res.json()

    sessionStorage.setItem('activeWorkout', JSON.stringify({
      sessionId,
      duration: workout.duration,
      exercises: workout.exercises,
    }))

    router.push('/workout')
  }

  return (
    <div className="px-5 pt-14">
      <h1 className="mb-6 text-[28px] font-bold">Vault</h1>

      {workouts.length === 0 ? (
        <p className="text-center text-gray-400">
          No saved workouts yet. Complete a session and save your favorites.
        </p>
      ) : (
        <div className="space-y-3">
          {workouts.map(workout => (
            <div
              key={workout.id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={() => setExpandedId(
                    expandedId === workout.id ? null : workout.id
                  )}
                  className="flex-1 text-left active:opacity-70"
                >
                  <p className="text-base font-semibold">{workout.name}</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {new Date(workout.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric'
                    })}
                    {' · '}
                    {workout.exercises.length} exercises
                    {' · '}
                    {workout.duration} min
                  </p>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteWorkout(workout.id)}
                    className="p-2 text-red-400 active:opacity-70"
                    aria-label="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                  {expandedId === workout.id ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </div>
              </div>

              {expandedId === workout.id && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <div className="space-y-2">
                    {workout.exercises.map((ex, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        <span className="font-medium">{ex.name}</span>
                        <span className="font-mono text-gray-500">{ex.sets}×{ex.reps}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => useWorkout(workout)}
                    className="mt-4 h-[44px] w-full rounded-lg bg-blue-600 text-base font-semibold text-white transition-opacity active:opacity-70"
                  >
                    Use This Workout
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
