import { exercises, getExercisesByPattern, type Exercise, type MovementPattern } from './exercises'

export interface GeneratedExercise {
  name: string
  movementPattern: MovementPattern
  tier: string
  sets: number
  reps: number
  equipment: string
  localImages: [string, string]
  instructions: string[]
  primaryMuscles: string[]
  secondaryMuscles: string[]
  level: string
}

type Duration = 30 | 45 | 60

// Movement pattern slots per duration
function getSlots(duration: Duration): MovementPattern[] {
  switch (duration) {
    case 30:
      return ['squat', 'hinge', 'push', 'pull', 'core']
    case 45:
      return ['squat', 'hinge', 'push', 'pull', 'core', 'lunge']
    case 60:
      return ['squat', 'hinge', 'push', 'pull', 'core', 'lunge', 'push']
  }
}

// Sets/reps per duration
function getSetsReps(duration: Duration): { sets: number; reps: number } {
  switch (duration) {
    case 30:
      return { sets: 3, reps: 12 }
    case 45:
      return { sets: 3, reps: 12 }
    case 60:
      return { sets: 4, reps: 10 }
  }
}

// Pick best exercise for a pattern, avoiding recently used ones
function pickExercise(
  pattern: MovementPattern,
  recentExercises: string[],
  alreadyPicked: string[]
): Exercise {
  const candidates = getExercisesByPattern(pattern)

  // Sort by tier: A first, then B, then C
  const tierOrder = { A: 0, B: 1, C: 2 }
  const sorted = [...candidates].sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier])

  // Try to find one not recently used and not already picked this session
  const fresh = sorted.find(
    e => !recentExercises.includes(e.name) && !alreadyPicked.includes(e.name)
  )
  if (fresh) return fresh

  // All were recent — pick highest tier not already in this session
  const notPicked = sorted.find(e => !alreadyPicked.includes(e.name))
  if (notPicked) return notPicked

  // Fallback: just return first (shouldn't happen with 36 exercises)
  return sorted[0]
}

export function generateWorkout(params: {
  duration: Duration
  recentExercises: string[]
}): GeneratedExercise[] {
  const { duration, recentExercises } = params
  const slots = getSlots(duration)
  const { sets, reps } = getSetsReps(duration)
  const alreadyPicked: string[] = []

  return slots.map((pattern) => {
    const exercise = pickExercise(pattern, recentExercises, alreadyPicked)
    alreadyPicked.push(exercise.name)

    return {
      name: exercise.name,
      movementPattern: exercise.movementPattern,
      tier: exercise.tier,
      sets,
      reps,
      equipment: exercise.equipment,
      localImages: exercise.localImages,
      instructions: exercise.instructions,
      primaryMuscles: exercise.primaryMuscles,
      secondaryMuscles: exercise.secondaryMuscles,
      level: exercise.level,
    }
  })
}

// Pick a replacement for a single exercise (same pattern, different exercise)
export function pickSwapExercise(
  currentName: string,
  pattern: MovementPattern,
  sessionExercises: string[]
): GeneratedExercise | null {
  const candidates = getExercisesByPattern(pattern)
    .filter(e => e.name !== currentName && !sessionExercises.includes(e.name))

  if (candidates.length === 0) return null

  // Pick randomly from available
  const exercise = candidates[Math.floor(Math.random() * candidates.length)]
  return {
    name: exercise.name,
    movementPattern: exercise.movementPattern,
    tier: exercise.tier,
    sets: 3,
    reps: 12,
    equipment: exercise.equipment,
    localImages: exercise.localImages,
    instructions: exercise.instructions,
    primaryMuscles: exercise.primaryMuscles,
    secondaryMuscles: exercise.secondaryMuscles,
    level: exercise.level,
  }
}
