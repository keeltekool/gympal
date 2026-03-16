import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { workoutExercises } from '@/db/schema'
import { eq } from 'drizzle-orm'

// PUT — toggle exercise completion
export async function PUT(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { exerciseId, completed } = await req.json()

  await db.update(workoutExercises)
    .set({
      completed,
      completedAt: completed ? new Date() : null,
    })
    .where(eq(workoutExercises.id, exerciseId))

  return NextResponse.json({ ok: true })
}
