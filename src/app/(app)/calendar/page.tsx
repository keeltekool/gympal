'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Session {
  id: string
  startedAt: string
  duration: number
  exerciseCount: number
  completedCount: number
  actualDuration: number | null
}

interface SessionDetail {
  session: Session
  exercises: Array<{
    exerciseName: string
    movementPattern: string
    sets: number
    reps: number
    completed: boolean
  }>
}

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

  // Fetch sessions for current month
  useEffect(() => {
    fetch(`/api/workout/history?month=${monthStr}`)
      .then(r => r.json())
      .then(data => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
  }, [monthStr])

  // Get workout dates
  const workoutDates = new Set(
    sessions.map(s => new Date(s.startedAt).getDate())
  )

  // Calendar grid
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7 // Monday = 0
  const daysInMonth = lastDay.getDate()

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const viewSession = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/workout/session/${sessionId}`)
      const data = await res.json()
      setSelectedSession(data)
    } catch {}
  }, [])

  // Monthly stats
  const totalWorkouts = sessions.length
  const totalExercises = sessions.reduce((sum, s) => sum + s.completedCount, 0)

  return (
    <div className="px-5 pt-14">
      {/* Month header */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 text-text-secondary active:opacity-70">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-foreground">
          {MONTHS[month]} {year}
        </h1>
        <button onClick={nextMonth} className="p-2 text-text-secondary active:opacity-70">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="font-mono text-2xl font-bold text-accent">{totalWorkouts}</p>
          <p className="text-xs text-text-tertiary">Workouts</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="font-mono text-2xl font-bold text-teal">{totalExercises}</p>
          <p className="text-xs text-text-tertiary">Exercises Done</p>
        </div>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {DAYS.map(d => (
          <span key={d} className="text-sm font-medium text-text-tertiary">{d}</span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-11" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const hasWorkout = workoutDates.has(day)
          const isToday = isCurrentMonth && today.getDate() === day
          const session = sessions.find(s => new Date(s.startedAt).getDate() === day)

          return (
            <button
              key={day}
              onClick={() => session && viewSession(session.id)}
              disabled={!hasWorkout}
              className="relative flex h-11 w-11 items-center justify-center text-sm font-medium transition-colors"
            >
              <span className={
                isToday
                  ? 'flex h-8 w-8 items-center justify-center rounded-full border border-accent text-accent'
                  : hasWorkout
                    ? 'text-foreground'
                    : 'text-text-tertiary'
              }>
                {day}
              </span>
              {hasWorkout && (
                <span className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </div>

      {/* Session detail */}
      {selectedSession && (
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              {new Date(selectedSession.session.startedAt).toLocaleDateString('en-US', {
                weekday: 'long', month: 'short', day: 'numeric'
              })}
            </h2>
            <button
              onClick={() => setSelectedSession(null)}
              className="text-sm text-text-tertiary active:opacity-70"
            >
              Close
            </button>
          </div>

          <p className="mb-3 text-sm text-text-secondary">
            {selectedSession.session.completedCount} of {selectedSession.session.exerciseCount} exercises
            {selectedSession.session.actualDuration && (
              <> · {Math.floor(selectedSession.session.actualDuration / 60)} min</>
            )}
          </p>

          <div className="space-y-2">
            {selectedSession.exercises.map((ex, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-sm ${
                  ex.completed ? 'text-foreground' : 'text-text-tertiary'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${
                  ex.completed ? 'bg-accent' : 'bg-text-tertiary'
                }`} />
                <span className="font-medium">{ex.exerciseName}</span>
                <span className="font-mono text-text-secondary">{ex.sets}×{ex.reps}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
