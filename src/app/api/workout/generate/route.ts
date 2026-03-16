import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { workoutSessions, workoutExercises } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { generateWorkout } from '@/lib/workout-generator'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { duration } = await req.json()
  if (![30, 45, 60].includes(duration)) {
    return NextResponse.json({ error: 'Invalid duration' }, { status: 400 })
  }

  // Get last 2 sessions to extract recent exercises
  const recentSessions = await db
    .select({ id: workoutSessions.id })
    .from(workoutSessions)
    .where(eq(workoutSessions.clerkUserId, userId))
    .orderBy(desc(workoutSessions.startedAt))
    .limit(2)

  let recentExercises: string[] = []
  if (recentSessions.length > 0) {
    const sessionIds = recentSessions.map(s => s.id)
    const recentExerciseRows = await db
      .select({ exerciseName: workoutExercises.exerciseName })
      .from(workoutExercises)
      .where(
        sessionIds.length === 1
          ? eq(workoutExercises.sessionId, sessionIds[0])
          : eq(workoutExercises.sessionId, sessionIds[0])
      )

    // Get exercises from both sessions
    for (const sessionId of sessionIds) {
      const rows = await db
        .select({ exerciseName: workoutExercises.exerciseName })
        .from(workoutExercises)
        .where(eq(workoutExercises.sessionId, sessionId))
      recentExercises.push(...rows.map(r => r.exerciseName))
    }
  }

  const exercises = generateWorkout({ duration, recentExercises })

  return NextResponse.json({ exercises })
}
