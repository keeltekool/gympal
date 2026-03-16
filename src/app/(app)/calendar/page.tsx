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

  return (
    <div className="px-5 pt-14">
      {/* Month header */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 active:opacity-70">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">
          {MONTHS[month]} {year}
        </h1>
        <button onClick={nextMonth} className="p-2 active:opacity-70">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {DAYS.map(d => (
          <span key={d} className="text-sm font-medium text-gray-500">{d}</span>
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
              className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                hasWorkout
                  ? 'bg-blue-600 text-white active:opacity-70'
                  : isToday
                    ? 'border-2 border-blue-600 text-blue-600'
                    : 'text-gray-900'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Session detail */}
      {selectedSession && (
        <div className="mt-6 rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {new Date(selectedSession.session.startedAt).toLocaleDateString('en-US', {
                weekday: 'long', month: 'short', day: 'numeric'
              })}
            </h2>
            <button
              onClick={() => setSelectedSession(null)}
              className="text-sm text-gray-400 active:opacity-70"
            >
              Close
            </button>
          </div>

          <p className="mb-3 text-sm text-gray-500">
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
                  ex.completed ? '' : 'text-gray-400'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${
                  ex.completed ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className="font-medium">{ex.exerciseName}</span>
                <span className="font-mono text-gray-500">{ex.sets}×{ex.reps}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
