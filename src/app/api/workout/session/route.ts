import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { workoutSessions, workoutExercises } from '@/db/schema'
import { eq } from 'drizzle-orm'

// POST — create a new workout session
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { duration, exercises } = await req.json()

  const [session] = await db.insert(workoutSessions).values({
    clerkUserId: userId,
    duration,
    exerciseCount: exercises.length,
    completedCount: 0,
  }).returning()

  // Insert exercises
  await db.insert(workoutExercises).values(
    exercises.map((ex: { name: string; movementPattern: string; tier: string; sets: number; reps: number }, i: number) => ({
      sessionId: session.id,
      exerciseName: ex.name,
      movementPattern: ex.movementPattern,
      tier: ex.tier,
      sets: ex.sets,
      reps: ex.reps,
      orderIndex: i,
    }))
  )

  return NextResponse.json({ sessionId: session.id })
}

// PUT — update session (complete or end early)
export async function PUT(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId, actualDuration, completedCount } = await req.json()

  await db.update(workoutSessions)
    .set({
      completedAt: new Date(),
      actualDuration,
      completedCount,
    })
    .where(eq(workoutSessions.id, sessionId))

  return NextResponse.json({ ok: true })
}
