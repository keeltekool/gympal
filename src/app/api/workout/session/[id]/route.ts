import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { workoutSessions, workoutExercises } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'

// GET — get session detail with exercises
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const session = await db.query.workoutSessions.findFirst({
    where: eq(workoutSessions.id, id),
  })

  if (!session || session.clerkUserId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const exercises = await db
    .select()
    .from(workoutExercises)
    .where(eq(workoutExercises.sessionId, id))
    .orderBy(asc(workoutExercises.orderIndex))

  return NextResponse.json({ session, exercises })
}
