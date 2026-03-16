import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pickSwapExercise } from '@/lib/workout-generator'
import type { MovementPattern } from '@/lib/exercises'

// POST — swap a single exercise for another in the same movement pattern
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentName, movementPattern, sessionExercises } = await req.json()

  const replacement = pickSwapExercise(
    currentName,
    movementPattern as MovementPattern,
    sessionExercises
  )

  if (!replacement) {
    return NextResponse.json({ error: 'No alternative available' }, { status: 404 })
  }

  return NextResponse.json({ exercise: replacement })
}
