'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

const durations = [30, 45, 60] as const

export default function TrainPage() {
  const router = useRouter()
  const [selectedDuration, setSelectedDuration] = useState<30 | 45 | 60>(45)
  const [loading, setLoading] = useState(false)
  const [lastSession, setLastSession] = useState<string | null>(null)

  // Load default duration from settings
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.defaultDuration) {
          setSelectedDuration(data.defaultDuration)
        }
      })
      .catch(() => {})
  }, [])

  async function handleStartWorkout() {
    setLoading(true)
    try {
      // Generate workout
      const genRes = await fetch('/api/workout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: selectedDuration }),
      })
      const { exercises } = await genRes.json()

      // Create session in DB
      const sessionRes = await fetch('/api/workout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: selectedDuration, exercises }),
      })
      const { sessionId } = await sessionRes.json()

      // Store workout data in sessionStorage for the workout page
      sessionStorage.setItem('activeWorkout', JSON.stringify({
        sessionId,
        duration: selectedDuration,
        exercises,
      }))

      router.push('/workout')
    } catch (err) {
      console.error('Failed to start workout:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-5">
      <h1 className="mb-2 text-[28px] font-bold">GymPal</h1>
      <p className="mb-10 text-base text-gray-500">How much time today?</p>

      {/* Duration pills */}
      <div className="mb-8 flex gap-3">
        {durations.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDuration(d)}
            className={`h-[44px] rounded-lg px-6 text-base font-semibold transition-colors active:opacity-70 ${
              selectedDuration === d
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 bg-white text-gray-500'
            }`}
          >
            {d}m
          </button>
        ))}
      </div>

      {/* Start button */}
      <button
        onClick={handleStartWorkout}
        disabled={loading}
        className="flex h-[52px] w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-blue-600 text-base font-semibold text-white transition-opacity active:opacity-70 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Start Workout'}
        {!loading && <ArrowRight size={20} />}
      </button>
    </div>
  )
}
