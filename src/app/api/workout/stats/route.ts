import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { workoutSessions } from '@/db/schema'
import { eq, and, gte, desc } from 'drizzle-orm'

// GET — weekly stats, last session, streak for Train page
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get all sessions from the last 8 weeks for streak calculation
  const eightWeeksAgo = new Date()
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

  const sessions = await db
    .select()
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.clerkUserId, userId),
        gte(workoutSessions.startedAt, eightWeeksAgo)
      )
    )
    .orderBy(desc(workoutSessions.startedAt))

  // This week's sessions (Mon-Sun)
  const now = new Date()
  const dayOfWeek = (now.getDay() + 6) % 7 // Monday = 0
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)

  const thisWeekSessions = sessions.filter(s => new Date(s.startedAt) >= weekStart)

  // Last session
  const lastSession = sessions[0] || null

  // Streak: count consecutive weeks with at least 1 workout
  let streak = 0
  const checkWeekStart = new Date(weekStart)

  // Don't count current week if it has no workouts yet
  if (thisWeekSessions.length === 0) {
    checkWeekStart.setDate(checkWeekStart.getDate() - 7)
  }

  for (let i = 0; i < 8; i++) {
    const wStart = new Date(checkWeekStart)
    wStart.setDate(wStart.getDate() - i * 7)
    const wEnd = new Date(wStart)
    wEnd.setDate(wEnd.getDate() + 7)

    const hasWorkout = sessions.some(s => {
      const d = new Date(s.startedAt)
      return d >= wStart && d < wEnd
    })

    if (hasWorkout) {
      streak++
    } else {
      break
    }
  }

  return NextResponse.json({
    thisWeek: thisWeekSessions.length,
    weekTarget: 3,
    streak,
    lastSession: lastSession
      ? {
          duration: lastSession.duration,
          exerciseCount: lastSession.exerciseCount,
          completedCount: lastSession.completedCount,
          actualDuration: lastSession.actualDuration,
          startedAt: lastSession.startedAt,
        }
      : null,
  })
}
