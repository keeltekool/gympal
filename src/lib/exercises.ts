export type MovementPattern = 'squat' | 'hinge' | 'push' | 'pull' | 'core' | 'lunge'
export type Tier = 'A' | 'B' | 'C'

export interface Exercise {
  name: string
  level: string
  mechanic: string
  equipment: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  images: string[]
  localImages: [string, string]
  movementPattern: MovementPattern
  tier: Tier
}

// Image path helper: exercise name → folder name (spaces/special chars → underscores)
function toFolderName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/_$/, '')
}

// Raw catalog data from exercise-catalog.json with tier + pattern assignments
const catalogData: Array<{
  name: string
  movementPattern: MovementPattern
  tier: Tier
}> = [
  // === A-TIER (best compounds — dominate ~2/3 sessions) ===
  { name: 'Barbell Squat', movementPattern: 'squat', tier: 'A' },
  { name: 'Barbell Deadlift', movementPattern: 'hinge', tier: 'A' },
  { name: 'Romanian Deadlift', movementPattern: 'hinge', tier: 'A' },
  { name: 'Barbell Bench Press - Medium Grip', movementPattern: 'push', tier: 'A' },
  { name: 'Barbell Shoulder Press', movementPattern: 'push', tier: 'A' },
  { name: 'Bent Over Barbell Row', movementPattern: 'pull', tier: 'A' },

  // === B-TIER (strong alternatives) ===
  { name: 'Goblet Squat', movementPattern: 'squat', tier: 'B' },
  { name: 'Leg Press', movementPattern: 'squat', tier: 'B' },
  { name: 'Stiff-Legged Barbell Deadlift', movementPattern: 'hinge', tier: 'B' },
  { name: 'Barbell Hip Thrust', movementPattern: 'hinge', tier: 'B' },
  { name: 'Dumbbell Bench Press', movementPattern: 'push', tier: 'B' },
  { name: 'Dumbbell Shoulder Press', movementPattern: 'push', tier: 'B' },
  { name: 'Dips - Triceps Version', movementPattern: 'push', tier: 'B' },
  { name: 'Bent Over Two-Dumbbell Row', movementPattern: 'pull', tier: 'B' },
  { name: 'Wide-Grip Lat Pulldown', movementPattern: 'pull', tier: 'B' },
  { name: 'Seated Cable Rows', movementPattern: 'pull', tier: 'B' },
  { name: 'Dumbbell Lunges', movementPattern: 'lunge', tier: 'B' },
  { name: 'Barbell Lunge', movementPattern: 'lunge', tier: 'B' },
  { name: 'Barbell Walking Lunge', movementPattern: 'lunge', tier: 'B' },
  { name: 'Plank', movementPattern: 'core', tier: 'B' },
  { name: 'Russian Twist', movementPattern: 'core', tier: 'B' },

  // === C-TIER (variety / accessories) ===
  { name: 'Barbell Glute Bridge', movementPattern: 'hinge', tier: 'C' },
  { name: 'One-Arm Kettlebell Swings', movementPattern: 'hinge', tier: 'C' },
  { name: 'Barbell Step Ups', movementPattern: 'lunge', tier: 'C' },
  { name: 'Dumbbell Step Ups', movementPattern: 'lunge', tier: 'C' },
  { name: 'Machine Bench Press', movementPattern: 'push', tier: 'C' },
  { name: 'Decline Push-Up', movementPattern: 'push', tier: 'C' },
  { name: 'Push-Ups With Feet Elevated', movementPattern: 'push', tier: 'C' },
  { name: 'Pushups', movementPattern: 'push', tier: 'C' },
  { name: 'Incline Push-Up', movementPattern: 'push', tier: 'C' },
  { name: 'Kettlebell Thruster', movementPattern: 'push', tier: 'C' },
  { name: 'Close-Grip Front Lat Pulldown', movementPattern: 'pull', tier: 'C' },
  { name: 'Alternating Renegade Row', movementPattern: 'pull', tier: 'C' },
  { name: 'Mountain Climbers', movementPattern: 'core', tier: 'C' },
  { name: 'Bench Dips', movementPattern: 'push', tier: 'C' },
  { name: 'Push-Ups - Close Triceps Position', movementPattern: 'push', tier: 'C' },
]

// Load and merge with full exercise data
import rawCatalog from './exercise-catalog.json'

const rawMap = new Map(
  (rawCatalog as Array<{
    name: string
    level: string
    mechanic: string
    equipment: string
    primaryMuscles: string[]
    secondaryMuscles: string[]
    instructions: string[]
    images: string[]
  }>).map(e => [e.name, e])
)

export const exercises: Exercise[] = catalogData
  .map(({ name, movementPattern, tier }) => {
    const raw = rawMap.get(name)
    if (!raw) return null
    const folder = toFolderName(name)
    return {
      ...raw,
      movementPattern,
      tier,
      localImages: [
        `/exercises/${folder}/0.jpg`,
        `/exercises/${folder}/1.jpg`,
      ] as [string, string],
    }
  })
  .filter((e): e is Exercise => e !== null)

// Helpers
export function getExercisesByPattern(pattern: MovementPattern): Exercise[] {
  return exercises.filter(e => e.movementPattern === pattern)
}

export function getExerciseByName(name: string): Exercise | undefined {
  return exercises.find(e => e.name === name)
}
