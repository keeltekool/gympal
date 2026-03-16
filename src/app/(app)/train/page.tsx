'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronRight, Flame } from 'lucide-react'

const durations = [30, 45, 60] as const

interface TrainStats {
  thisWeek: number
  weekTarget: number
  streak: number
  lastSession: {
    duration: number
    exerciseCount: number
    completedCount: number
    actualDuration: number | null
    startedAt: string
  } | null
}

export default function TrainPage() {
  const router = useRouter()
  const [selectedDuration, setSelectedDuration] = useState<30 | 45 | 60>(45)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<TrainStats | null>(null)

  // Load default duration + stats
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.defaultDuration) setSelectedDuration(data.defaultDuration)
      })
      .catch(() => {})

    fetch('/api/workout/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {})
  }, [])

  async function handleStartWorkout() {
    setLoading(true)
    try {
      const genRes = await fetch('/api/workout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: selectedDuration }),
      })
      const { exercises } = await genRes.json()

      const sessionRes = await fetch('/api/workout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: selectedDuration, exercises }),
      })
      const { sessionId } = await sessionRes.json()

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
      {/* Streak badge */}
      {stats && stats.streak >= 2 && (
        <div className="mb-4 flex items-center gap-1.5 rounded-full border border-accent/15 bg-accent-dim px-3 py-1">
          <Flame size={14} className="text-accent" />
          <span className="font-mono text-xs font-medium text-accent">{stats.streak} week streak</span>
        </div>
      )}

      <h1 className="mb-1 text-[28px] font-bold text-foreground">GymPal</h1>

      {/* Weekly progress subtitle */}
      {stats && (
        <p className="mb-3 text-sm text-text-secondary">
          Session {stats.thisWeek} of {stats.weekTarget} this week
        </p>
      )}

      {/* Weekly progress bar */}
      {stats && (
        <div className="mb-8 flex w-full max-w-xs gap-2">
          {Array.from({ length: stats.weekTarget }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < stats.thisWeek ? 'bg-accent' : 'bg-border'
              }`}
            />
          ))}
        </div>
      )}

      {!stats && <p className="mb-10 text-base text-text-secondary">How much time today?</p>}

      {/* Duration pills */}
      <div className="mb-8 flex gap-3">
        {durations.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDuration(d)}
            className={`h-[44px] rounded-lg px-6 text-base font-semibold transition-colors active:opacity-70 ${
              selectedDuration === d
                ? 'bg-accent text-background'
                : 'border border-border bg-card text-text-secondary'
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
        className="flex h-[52px] w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-accent text-base font-semibold text-background transition-opacity active:opacity-70 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Start Workout'}
        {!loading && <ArrowRight size={20} />}
      </button>

      {/* Last session card */}
      {stats?.lastSession && (
        <button
          onClick={() => router.push('/calendar')}
          className="mt-6 flex w-full max-w-xs items-center justify-between rounded-lg border border-border bg-card p-4 text-left active:opacity-70"
        >
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Last Session</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Full Body · {stats.lastSession.exerciseCount} exercises
              {stats.lastSession.actualDuration && (
                <> · {Math.floor(stats.lastSession.actualDuration / 60)} min</>
              )}
            </p>
          </div>
          <ChevronRight size={16} className="text-text-tertiary" />
        </button>
      )}
    </div>
  )
}
