import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { workoutSessions, workoutExercises } from '@/db/schema'
import { eq, and, gte, lt, desc, or, isNull } from 'drizzle-orm'

// GET — get workout sessions for a month
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const month = req.nextUrl.searchParams.get('month') // format: 2026-03
  if (!month) return NextResponse.json({ error: 'Month required' }, { status: 400 })

  const [year, mon] = month.split('-').map(Number)
  const startDate = new Date(year, mon - 1, 1)
  const endDate = new Date(year, mon, 1)

  // Only return sessions with actualDuration >= 15 min (900s) — filter out test/cancelled
  const sessions = await db
    .select()
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.clerkUserId, userId),
        gte(workoutSessions.startedAt, startDate),
        lt(workoutSessions.startedAt, endDate),
        gte(workoutSessions.actualDuration, 900)
      )
    )
    .orderBy(desc(workoutSessions.startedAt))

  return NextResponse.json(sessions)
}
