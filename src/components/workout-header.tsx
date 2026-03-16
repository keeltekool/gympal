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
    <div className="sticky top-0 z-40 bg-white px-5 pb-3 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between pt-3">
        <h1 className="text-lg font-bold">Full Body · {duration} min</h1>
        <span className="font-mono text-lg font-medium text-gray-600">{timeStr}</span>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-1.5 text-sm font-medium text-gray-500">
        {completedCount} of {totalCount} done
      </p>
    </div>
  )
}
