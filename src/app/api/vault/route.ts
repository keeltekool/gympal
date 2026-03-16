import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { vaultWorkouts } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

// GET — list all vault workouts
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workouts = await db
    .select()
    .from(vaultWorkouts)
    .where(eq(vaultWorkouts.clerkUserId, userId))
    .orderBy(desc(vaultWorkouts.createdAt))

  return NextResponse.json(workouts)
}

// POST — save workout to vault
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, duration, exercises } = await req.json()

  const [saved] = await db.insert(vaultWorkouts).values({
    clerkUserId: userId,
    name,
    duration,
    exercises,
  }).returning()

  return NextResponse.json(saved)
}

// DELETE — remove from vault
export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()

  await db.delete(vaultWorkouts)
    .where(eq(vaultWorkouts.id, id))

  return NextResponse.json({ ok: true })
}
