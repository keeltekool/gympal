'use client'

import { useEffect, useState } from 'react'

interface WorkoutHeaderProps {
  duration: number
  completedCount: number
  totalCount: number
}

export function WorkoutHeader({ duration, completedCount, totalCount }: WorkoutHeaderProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="sticky top-0 z-40 px-5 pb-3 pt-[env(safe-area-inset-top)]"
      style={{ background: 'rgba(10, 10, 18, 0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-between pt-3">
        <h1 className="text-lg font-bold text-foreground">Full Body · {duration} min</h1>
        <span className="font-mono text-lg font-medium text-accent">{timeStr}</span>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card-elevated">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-1.5 text-sm font-medium text-text-secondary">
        {completedCount} of {totalCount} done
      </p>
    </div>
  )
}
