import { pgTable, text, integer, timestamp, boolean, json, uuid } from 'drizzle-orm/pg-core'

export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  defaultDuration: integer('default_duration').notNull().default(45),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const workoutSessions = pgTable('workout_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').notNull(),
  duration: integer('duration').notNull(),
  actualDuration: integer('actual_duration'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  exerciseCount: integer('exercise_count').notNull(),
  completedCount: integer('completed_count').notNull().default(0),
})

export const workoutExercises = pgTable('workout_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => workoutSessions.id, { onDelete: 'cascade' }),
  exerciseName: text('exercise_name').notNull(),
  movementPattern: text('movement_pattern').notNull(),
  tier: text('tier').notNull(),
  sets: integer('sets').notNull(),
  reps: integer('reps').notNull(),
  orderIndex: integer('order_index').notNull(),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
})

export const vaultWorkouts = pgTable('vault_workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').notNull(),
  name: text('name').notNull(),
  duration: integer('duration').notNull(),
  exercises: json('exercises').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
