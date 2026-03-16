# GymPal MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a PWA that generates fat-loss strength workouts, lets users tick off exercises, and tracks history via a calendar — mobile-only, offline-ready, personal use.

**Architecture:** Next.js app with Clerk auth, Neon/Drizzle database for workout sessions/history/vault/settings, exercise catalog bundled as JSON + images in `/public/`. Workout generation algorithm runs server-side via API route, UI is a mobile-optimized SPA with Framer Motion animations. PWA via next-pwa service worker.

**Tech Stack:** Next.js 15, Tailwind CSS, Framer Motion, Clerk, Neon (Postgres), Drizzle ORM, Vercel, next-pwa

---

## Pre-Build: Gap Resolutions (Reference)

These decisions were made during brainstorming and override/supplement the PRD where noted:

- **Auth:** Clerk (free tier, already used on 5 projects)
- **Equipment scanner:** OUT of MVP — gym has all equipment, all 36 exercises available
- **Equipment filtering:** OUT — no equipment tables, no setup screen for equipment
- **Images:** Bundled into `/public/exercises/` (downloaded from GitHub at build time)
- **Timer:** Stopwatch counting UP from 0:00, informational only, no alerts
- **Completion:** Auto-prompt overlay when last exercise ticked + "End Workout" button always available
- **Settings page:** Stores default workout duration (30/45/60). 4 bottom tabs: Train, Calendar, Vault, Settings
- **Home screen:** Duration pills pre-select saved default, overridable per session
- **Movement pattern mapping:** 9 catalog categories → 6 algorithm patterns:
  - Squat = Squat + Lunge/Single Leg
  - Hinge = Hip Hinge
  - Push = Horizontal Push + Vertical Push + Dips
  - Pull = Horizontal Pull + Vertical Pull
  - Core = Core
  - For 30-min (4-5 exercises): Squat, Hinge, Push, Pull, Core (5). Lunge merged into Squat slot.
  - For 45-min (5-6 exercises): all 5 above + Lunge gets its own slot (6)
  - For 60-min (6-7 exercises): all 6 above + one accessory from Push or Pull (7)

---

## Task 1: Project Scaffold + Git + Vercel

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `.gitignore`, `.env.local`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Step 1: Scaffold Next.js project**

```bash
cd C:\Users\Kasutaja\Claude_Projects\gym-app
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Note: project dir already has files (PRD, research, images). The scaffold should merge into it. If it refuses because dir is non-empty, create in a temp dir and move files over.

**Step 2: Install dependencies**

```bash
npm install framer-motion @clerk/nextjs drizzle-orm @neondatabase/serverless next-pwa
npm install -D drizzle-kit @types/node
```

**Step 3: Add Google Fonts (DM Sans + JetBrains Mono)**

In `src/app/layout.tsx`, import from `next/font/google`:
- `DM_Sans` weight 400,500,600,700
- `JetBrains_Mono` weight 400,500

Apply as CSS variables: `--font-dm-sans`, `--font-jetbrains-mono`.
Extend `tailwind.config.ts` with `fontFamily: { sans: ['var(--font-dm-sans)'], mono: ['var(--font-jetbrains-mono)'] }`.

**Step 4: Create GitHub repo + push**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js project with Tailwind, Clerk, Drizzle, Framer Motion"
gh repo create gympal --public --source=. --push
```

**Step 5: Connect to Vercel**

```bash
npx vercel link --yes
npx vercel --prod
```

**Step 6: Verify**

- `npm run dev` → app loads on localhost:3000
- Vercel deployment succeeds

---

## Task 2: Clerk Authentication

**Files:**
- Create: `src/middleware.ts`
- Modify: `src/app/layout.tsx`
- Create: `src/app/sign-in/[[...sign-in]]/page.tsx`
- Create: `src/app/sign-up/[[...sign-up]]/page.tsx`

**Step 1: Create Clerk application**

Go to Clerk dashboard (already have account). Create app "GymPal". Get publishable key + secret key.

**Step 2: Add env vars to `.env.local`**

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

**Step 3: Add ClerkProvider to layout.tsx**

Wrap the app in `<ClerkProvider>`. Keep font setup from Task 1.

**Step 4: Create middleware.ts**

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'],
}
```

**Step 5: Create sign-in and sign-up pages**

Minimal Clerk `<SignIn />` and `<SignUp />` components. Styled to match app aesthetic.

**Step 6: Verify**

- Unauthenticated → redirected to `/sign-in`
- Sign in → see home page
- Add env vars to Vercel: `npx vercel env add`

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add Clerk authentication"
```

---

## Task 3: Neon Database + Drizzle Schema

**Files:**
- Create: `src/db/index.ts` (Drizzle client)
- Create: `src/db/schema.ts` (all tables)
- Create: `drizzle.config.ts`

**Step 1: Create Neon database**

Go to Neon console (already have account). Create project "gympal". Get connection string.

**Step 2: Add DATABASE_URL to `.env.local`**

```
DATABASE_URL=postgresql://...@...neon.tech/gympal?sslmode=require
```

**Step 3: Define schema**

```typescript
// src/db/schema.ts
import { pgTable, text, integer, timestamp, boolean, json, uuid } from 'drizzle-orm/pg-core'

// User settings (one row per user)
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  defaultDuration: integer('default_duration').notNull().default(45), // 30, 45, or 60
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Workout sessions
export const workoutSessions = pgTable('workout_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').notNull(),
  duration: integer('duration').notNull(), // selected duration (30/45/60)
  actualDuration: integer('actual_duration'), // elapsed seconds when ended
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  exerciseCount: integer('exercise_count').notNull(),
  completedCount: integer('completed_count').notNull().default(0),
})

// Exercises within a workout session
export const workoutExercises = pgTable('workout_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => workoutSessions.id, { onDelete: 'cascade' }),
  exerciseName: text('exercise_name').notNull(), // matches catalog name
  movementPattern: text('movement_pattern').notNull(), // squat/hinge/push/pull/core/lunge
  tier: text('tier').notNull(), // A/B/C
  sets: integer('sets').notNull(),
  reps: integer('reps').notNull(),
  orderIndex: integer('order_index').notNull(),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
})

// Vault (saved favorite workouts)
export const vaultWorkouts = pgTable('vault_workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').notNull(),
  name: text('name').notNull(),
  duration: integer('duration').notNull(),
  exercises: json('exercises').notNull(), // JSON array of exercise objects
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

**Step 4: Create Drizzle client**

```typescript
// src/db/index.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

**Step 5: Configure Drizzle Kit**

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

**Step 6: Generate and push migration**

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

**Step 7: Verify**

Connect to Neon console → tables exist with correct columns.

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add Neon database with Drizzle schema"
```

---

## Task 4: Exercise Catalog + Image Bundling

**Files:**
- Create: `src/lib/exercises.ts` (typed catalog with tier/pattern assignments)
- Create: `scripts/download-exercise-images.ts` (build-time image downloader)
- Create: `public/exercises/` (downloaded images)

**Step 1: Create typed exercise catalog**

Transform `exercise-catalog.json` into a TypeScript module with added fields:
- `movementPattern`: one of `squat | hinge | push | pull | core | lunge`
- `tier`: one of `A | B | C`
- `localImages`: paths to bundled images (`/exercises/Exercise_Name/0.jpg`, `/exercises/Exercise_Name/1.jpg`)

Each of the 36 exercises manually assigned a tier and pattern based on PRD Section 5.3 rules:

**A-tier (best compounds):**
- Squat: Barbell Squat
- Hinge: Barbell Deadlift, Romanian Deadlift
- Push: Barbell Bench Press, Overhead Press
- Pull: Bent Over Barbell Row

**B-tier (strong alternatives):**
- Squat: Goblet Squat
- Hinge: Dumbbell Stiff Leg Deadlift
- Push: Dumbbell Bench Press, Incline Dumbbell Press, Dips (Chest Version)
- Pull: Dumbbell Row, Lat Pulldown
- Lunge: Dumbbell Lunges, Barbell Lunge
- Core: Plank, Hanging Leg Raise

**C-tier (variety):**
- All remaining exercises in the catalog

**Step 2: Write image download script**

Node.js script that reads the catalog, downloads each exercise's 2 images from GitHub, saves to `/public/exercises/{ExerciseName}/0.jpg` and `1.jpg`.

```bash
npx tsx scripts/download-exercise-images.ts
```

**Step 3: Add `/public/exercises/` to .gitignore**

Images are ~8MB total. Add to `.gitignore` to keep repo light. Download script runs during build or setup.

Actually — reconsider: for Vercel deployment, images MUST be in the repo (Vercel builds from git). So DO commit them. They're public domain (Unlicense).

**Step 4: Run download + verify images exist**

```bash
ls public/exercises/ | wc -l  # should be 36 directories
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add exercise catalog with tier system + bundled images"
```

---

## Task 5: Workout Generation Algorithm (API Route)

**Files:**
- Create: `src/app/api/workout/generate/route.ts`
- Create: `src/lib/workout-generator.ts` (pure function, testable)

**Step 1: Implement workout generator**

The core algorithm. Pure function with signature:

```typescript
function generateWorkout(params: {
  duration: 30 | 45 | 60,
  recentExercises: string[], // exercise names from last 2 sessions
}): GeneratedExercise[]
```

**Algorithm:**

1. **Determine slots based on duration:**
   - 30 min → 5 slots: Squat, Hinge, Push, Pull, Core
   - 45 min → 6 slots: Squat, Hinge, Push, Pull, Core, Lunge
   - 60 min → 7 slots: Squat, Hinge, Push, Pull, Core, Lunge, +1 accessory (Push or Pull)

2. **For each movement pattern slot:**
   a. Get all exercises matching that pattern
   b. Sort by tier: A first, then B, then C
   c. Pick the highest-tier exercise NOT in `recentExercises`
   d. If all A-tier were done last session → pick B-tier
   e. If all B-tier too → pick C-tier
   f. If everything was done recently → pick A-tier anyway (A-tier repeating is fine)

3. **Assign sets/reps based on duration:**
   - 30 min: 3 sets × 12 reps per exercise
   - 45 min: 3 sets × 12 reps per exercise
   - 60 min: 3-4 sets × 10-12 reps per exercise

4. **Return ordered exercise list** with: name, pattern, tier, sets, reps, images, instructions

**Step 2: Create API route**

```typescript
// src/app/api/workout/generate/route.ts
// POST { duration: 30|45|60 }
// - Fetches last 2 sessions from DB for the current user
// - Extracts recent exercise names
// - Calls generateWorkout()
// - Returns generated exercise list
```

**Step 3: Test manually**

```bash
curl -X POST http://localhost:3000/api/workout/generate -H "Content-Type: application/json" -d '{"duration": 45}'
```

Verify: returns 6 exercises, all different patterns, correct tiers.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: workout generation algorithm with tier-based rotation"
```

---

## Task 6: Bottom Navigation + App Shell

**Files:**
- Create: `src/components/bottom-nav.tsx`
- Create: `src/app/(app)/layout.tsx` (authenticated layout with nav)
- Create: `src/app/(app)/train/page.tsx` (placeholder)
- Create: `src/app/(app)/calendar/page.tsx` (placeholder)
- Create: `src/app/(app)/vault/page.tsx` (placeholder)
- Create: `src/app/(app)/settings/page.tsx` (placeholder)

**Step 1: Create bottom navigation component**

4 tabs: Train (lightning), Calendar (grid), Vault (bookmark), Settings (gear).
Use Lucide React icons (comes with Next.js). Active = blue (#2563EB), inactive = gray (#9CA3AF).
Fixed to bottom, 56px height, white bg, top border #E5E7EB.
Hides during active workout (controlled via context/state).

**Step 2: Create app layout with nav**

`(app)/layout.tsx` wraps all authenticated pages with the bottom nav. Uses safe-area padding for iOS.

**Step 3: Create placeholder pages**

Each page shows just the title for now. Will be built in subsequent tasks.

**Step 4: Verify**

- All 4 tabs navigate correctly
- Active tab highlights blue
- Mobile viewport (375px) looks correct

**Step 5: Commit**

```bash
git add .
git commit -m "feat: bottom navigation + app shell with 4 tabs"
```

---

## Task 7: Home / Train Screen

**Files:**
- Modify: `src/app/(app)/train/page.tsx`
- Create: `src/app/api/settings/route.ts` (GET/PUT user settings)
- Create: `src/app/api/workout/last/route.ts` (GET last session summary)

**Step 1: Build Train screen**

- Header: "GymPal" in DM Sans 700, 28px
- Duration pills: 30m / 45m / 60m — pre-selected from user's saved default
  - Selected: bg-blue-600 text-white
  - Unselected: bg-white border border-gray-200 text-gray-500
  - Height 44px, rounded-lg, gap-3
- "Start Workout →" button: full-width, bg-blue-600, white text, 52px height, rounded-lg
- Last session summary below: "Last: Thursday · 6 exercises · 42 min" — secondary text, tappable

**Step 2: Settings API route**

- `GET /api/settings` — returns user settings (creates default row if none exists)
- `PUT /api/settings` — updates default duration

**Step 3: Wire up duration selection**

- On page load: fetch settings, pre-select default duration pill
- Tapping a different pill: updates local state (does NOT save to DB — that's just a per-session override)
- The selected duration is passed to "Start Workout" action

**Step 4: Verify on mobile viewport**

- Pills render correctly at 375px width
- Default duration loads from DB
- Button tap target is 52px

**Step 5: Commit**

```bash
git add .
git commit -m "feat: train screen with duration selector + start workout button"
```

---

## Task 8: Active Workout Screen (Core Experience)

**Files:**
- Create: `src/app/(app)/workout/page.tsx` (the workout session screen)
- Create: `src/components/exercise-card.tsx`
- Create: `src/components/workout-header.tsx`
- Create: `src/components/workout-complete-modal.tsx`
- Create: `src/app/api/workout/session/route.ts` (POST create, PUT update)
- Create: `src/app/api/workout/exercise/route.ts` (PUT toggle complete)
- Create: `src/app/api/workout/swap/route.ts` (POST swap single exercise)

**Step 1: Build workout header**

- Left: workout title "Full Body · 45 min" (DM Sans 700)
- Right: elapsed time "23:14" (JetBrains Mono) — useEffect interval counting up from 0
- Below: thin blue progress bar (width = completedCount / totalCount * 100%)
- Below bar: "4 of 6 done" (DM Sans 500, 14px, text-gray-500)

**Step 2: Build exercise card component**

Per PRD Section 7.4 card anatomy:
- Left: checkbox (24px, green fill when checked via Framer Motion scale animation 200ms)
- Center: exercise name (DM Sans 600, 18px) + "3 × 12 · Barbell" (JetBrains Mono 400, 16px + DM Sans 400, 14px)
- Right top: swap/dice icon (20px, blue #2563EB)
- Right bottom: demo thumbnail (48×48px, rounded-lg)
- Card: white bg, 1px border #E5E7EB, rounded-lg, p-4, min-h 64px
- Completed state: checkbox green, text opacity 50%, Framer Motion animate

**Step 3: Build exercise list**

- Scrollable list of ExerciseCard components
- Shuffle button above list (refresh icon, blue, regenerates entire workout)
- AnimatePresence for swap/shuffle transitions (250ms slide, 300ms stagger fade)
- Non-sequential ticking — any card can be tapped in any order

**Step 4: Build workout session flow**

1. User taps "Start Workout" on Train screen
2. POST `/api/workout/generate` with duration → get exercise list
3. POST `/api/workout/session` → create session in DB, get session ID
4. Navigate to `/workout` with session data
5. Tapping checkbox → PUT `/api/workout/exercise` → toggle complete
6. Tapping dice → POST `/api/workout/swap` → get replacement exercise (same pattern)
7. Tapping shuffle → POST `/api/workout/generate` again → replace all exercises

**Step 5: Build completion modal**

When last exercise is ticked:
- Framer Motion overlay fades in
- "Workout Complete!" (DM Sans 700, 24px)
- Duration: "42:17" (JetBrains Mono)
- Exercises: "6 of 6 completed"
- "Save to Vault" button (blue outline)
- "Done" button (blue filled) → saves session, returns to Train tab

"End Workout" button always visible in bottom bar (red/destructive) for early exit.

**Step 6: Bottom nav hidden during workout**

When on `/workout` route, bottom nav component hides. Shows again on exit.

**Step 7: Verify**

- Generate workout → see 5-7 exercise cards
- Tick exercises in random order → progress updates
- Swap individual exercise → card slides out/in
- Shuffle → all cards fade/stagger
- Complete all → modal appears
- End early → modal with partial count
- Timer counts up correctly

**Step 8: Commit**

```bash
git add .
git commit -m "feat: active workout screen with exercise cards, swap, shuffle, completion"
```

---

## Task 9: Exercise Detail View (Layer 2)

**Files:**
- Create: `src/app/(app)/workout/exercise/[name]/page.tsx` (or modal/sheet)
- Create: `src/components/exercise-detail.tsx`

**Step 1: Build exercise detail component**

Tapping exercise name on the card opens full-screen detail:
- Back arrow top-left
- Exercise name: DM Sans 700, 24px
- Tab bar: "How To" | "Info" — underline-style tabs

**How To tab:**
- Two demo images side by side (start + end position), rounded-lg
- Numbered step-by-step instructions below, DM Sans 400, 16px, line-height 1.6

**Info tab:**
- Primary muscles (listed)
- Secondary muscles (secondary text color)
- Equipment label
- Difficulty badge (beginner/intermediate/expert)
- Effort guidance: expandable accordion — percentage text per PRD Section 5.4

**Step 2: Wire navigation**

Tapping exercise name on card → push to detail view (or slide-up sheet with Framer Motion, 250ms).
Back arrow → return to workout list (state preserved).

**Step 3: Verify**

- Tap exercise → detail opens with correct data
- Both tabs show correct content
- Images load from `/public/exercises/`
- Back preserves workout state (timer keeps running, checkmarks preserved)

**Step 4: Commit**

```bash
git add .
git commit -m "feat: exercise detail view with instructions, images, effort guide"
```

---

## Task 10: Monthly Calendar + History

**Files:**
- Modify: `src/app/(app)/calendar/page.tsx`
- Create: `src/components/calendar-grid.tsx`
- Create: `src/app/(app)/calendar/[date]/page.tsx` (workout detail for a past date)
- Create: `src/app/api/workout/history/route.ts` (GET sessions for a month)

**Step 1: Build calendar grid**

- Header: "March 2026" — DM Sans 700, 24px. Left/right chevron arrows to change month.
- Day-of-week headers: Mo Tu We Th Fr Sa Su — DM Sans 500, 14px, text-gray-500
- Day cells: 44×44px grid
  - Workout days: filled blue circle (#2563EB) bg, white text
  - Today (no workout): outlined blue circle
  - Regular days: plain number, text-gray-900
  - Other month overflow: text-gray-300

**Step 2: Build history API**

`GET /api/workout/history?month=2026-03` — returns all completed sessions for the month with dates.

**Step 3: Build past workout detail**

Tap a blue-circled date → navigate to `/calendar/2026-03-16` → shows the exercise list from that session (read-only). Exercise names, sets × reps, completion status. Same card layout as active workout but without swap/checkbox.

**Step 4: Swipe between months**

Use Framer Motion drag/swipe gesture or simple arrow buttons. Fetch new month data on change.

**Step 5: Verify**

- Calendar renders current month correctly
- After completing a workout (Task 8), the date shows a blue circle
- Tapping the date shows the workout detail
- Swiping to previous month works

**Step 6: Commit**

```bash
git add .
git commit -m "feat: monthly calendar with workout history"
```

---

## Task 11: Workout Vault

**Files:**
- Modify: `src/app/(app)/vault/page.tsx`
- Create: `src/components/vault-card.tsx`
- Create: `src/app/api/vault/route.ts` (GET list, POST save, DELETE remove)

**Step 1: Build vault list**

- Header: "Vault" — DM Sans 700, 24px
- List of saved workouts as cards:
  - Name (user-given or auto: "Full Body · 45 min")
  - Date saved, exercise count, duration
  - Tap → expand to see exercise list
  - "Use This Workout" blue CTA button → starts workout with these exact exercises
- Empty state: "No saved workouts yet. Complete a session and save your favorites."

**Step 2: Save to Vault flow**

From the workout completion modal (Task 8):
- "Save to Vault" → prompt for name (pre-filled with auto-name) → POST `/api/vault`
- Toast confirmation: "Saved!" (1500ms auto-dismiss)

**Step 3: Delete from Vault**

Swipe left on card → red delete button. Or long-press → delete option.
For MVP: simple delete button on expanded view is fine.

**Step 4: Use from Vault**

"Use This Workout" → creates a new workout session with the vault's exercises → navigates to active workout screen. Same session flow as generated workouts.

**Step 5: Verify**

- Save a workout to vault from completion modal
- Vault tab shows saved workout
- Tap to expand → see exercises
- "Use This Workout" → starts that workout
- Delete works

**Step 6: Commit**

```bash
git add .
git commit -m "feat: workout vault for saving and replaying favorites"
```

---

## Task 12: Settings Page

**Files:**
- Modify: `src/app/(app)/settings/page.tsx`

**Step 1: Build settings page**

- Header: "Settings" — DM Sans 700, 24px
- **Default Workout Duration** section:
  - Label: "Default Duration"
  - Three pill buttons: 30m / 45m / 60m (same style as Train screen)
  - Selected = saved preference
  - Tap different pill → PUT `/api/settings` → update immediately, show brief "Saved" feedback
- **Account** section:
  - Signed in as: show email from Clerk
  - "Sign Out" button — Clerk `signOut()`
- Keep it minimal. More settings can be added later.

**Step 2: Verify**

- Default duration shows current setting
- Changing it persists across app restart
- Train screen picks up the new default
- Sign out works

**Step 3: Commit**

```bash
git add .
git commit -m "feat: settings page with default duration + sign out"
```

---

## Task 13: PWA Setup (Service Worker + Manifest)

**Files:**
- Modify: `next.config.ts` (add next-pwa config)
- Create: `public/manifest.json`
- Create: `public/icon-192.png`, `public/icon-512.png` (app icons)

**Step 1: Configure next-pwa**

```typescript
// next.config.ts
import withPWA from 'next-pwa'

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})({
  // existing next config
})
```

**Step 2: Create manifest.json**

```json
{
  "name": "GymPal",
  "short_name": "GymPal",
  "description": "Fat-loss strength training workouts",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#2563EB",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Step 3: Create app icons**

Generate simple GymPal icons (blue lightning bolt on white bg, or simple "G" logo). 192px and 512px versions.

**Step 4: Add manifest + meta tags to layout.tsx**

```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#2563EB" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
```

**Step 5: Verify**

- `npm run build` → service worker generated in `/public`
- Safari on iPhone → "Add to Home Screen" → app launches standalone
- Exercise images available offline after first load

**Step 6: Commit**

```bash
git add .
git commit -m "feat: PWA setup with service worker and manifest"
```

---

## Task 14: Polish + Mobile UX Pass

**Files:**
- All component files (CSS refinements)

**Step 1: Touch targets**

Verify all interactive elements are 48px+ height. Fix any undersized buttons/checkboxes.

**Step 2: Safe area padding**

Add `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` padding for iOS notch + home indicator.

**Step 3: Touch feedback**

All tappable elements: `active:opacity-70 transition-opacity` (or Framer Motion whileTap).

**Step 4: Sweaty finger testing**

Test on actual mobile device — large enough tap targets, no accidental taps, scroll doesn't conflict with taps.

**Step 5: Typography audit**

Verify all text matches PRD Section 7.2 size scale. No text smaller than 14px on workout screens.

**Step 6: Commit**

```bash
git add .
git commit -m "chore: mobile UX polish — touch targets, safe areas, typography"
```

---

## Task 15: Deploy + E2E Verify

**Step 1: Add all env vars to Vercel**

```bash
echo -n "$CLERK_KEY" | npx vercel env add CLERK_SECRET_KEY production
echo -n "$CLERK_PK" | npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
echo -n "$DB_URL" | npx vercel env add DATABASE_URL production
```

**Step 2: Deploy to production**

```bash
git push origin main
```

Vercel auto-deploys from main.

**Step 3: Browser E2E test (chrome-devtools MCP)**

- Navigate to live URL
- Sign in via Clerk
- Select 45 min → Start Workout
- Verify exercise cards render with images
- Tick off exercises, verify progress
- Swap an exercise, verify animation
- Complete workout, verify modal
- Save to vault, verify in Vault tab
- Check calendar, verify today is marked
- Check Settings, verify default duration

**Step 4: Update STACK.md files**

- Create `gym-app/STACK.md` (per-project)
- Update `Claude_Projects/STACK.md` (add GymPal to projects table, add any new services)

**Step 5: Final commit**

```bash
git add .
git commit -m "chore: production deploy + STACK.md documentation"
```

---

## Checkpoints (Verification Gates)

The build has **4 checkpoints** where we stop, verify via browser, and optionally compact context before continuing.

### Checkpoint A — Foundation (after Tasks 1-4)
**What's built:** Scaffold, auth, database, exercise catalog with images
**Verify:**
- `npm run dev` → app loads on localhost:3000
- Clerk login works → redirects to authenticated home
- Neon tables exist (check console)
- `/public/exercises/` has all images
- Push to Vercel, verify deploy works
**Context refresh:** Yes — compact here. Tasks 1-4 are infrastructure, not needed in context for UI work.

### Checkpoint B — Core Experience (after Tasks 5-8)
**What's built:** Workout algorithm, nav shell, train screen, active workout screen
**Verify via chrome-devtools MCP:**
- Select duration → Start Workout → see exercise cards
- Tick exercises in any order → progress bar updates
- Swap single exercise → slide animation
- Shuffle entire workout → stagger fade
- Complete all → completion modal appears
- Timer counts up correctly
- Bottom nav hidden during workout
**Context refresh:** Yes — compact here. Core is done, remaining tasks are secondary screens.

### Checkpoint C — All Features (after Tasks 9-12)
**What's built:** Exercise detail, calendar, vault, settings
**Verify via chrome-devtools MCP:**
- Tap exercise → detail view with images + instructions
- Calendar shows workout days with blue circles
- Tap past date → see workout detail
- Save to vault → appears in Vault tab
- Use vault workout → starts session
- Settings default duration → reflected on Train screen
**Context refresh:** Optional — only 3 tasks remain (PWA, polish, deploy).

### Checkpoint D — Production (after Tasks 13-15)
**What's built:** PWA, polish, deployed to Vercel
**Verify via chrome-devtools MCP:**
- Full E2E on live URL (sign in → workout → complete → calendar → vault)
- "Add to Home Screen" on iOS Safari
- Exercise images load offline
- All touch targets 48px+
- STACK.md files updated

---

## Execution Order & Dependencies

```
Task 1 (scaffold) → Task 2 (auth) → Task 3 (DB) → Task 4 (catalog+images)
                         ↓
              ══ CHECKPOINT A ══
                         ↓
Task 5 (algorithm) → Task 6 (nav shell) → Task 7 (train screen) → Task 8 (workout screen)
                         ↓
              ══ CHECKPOINT B ══
                         ↓
Task 9 (exercise detail) → Task 10 (calendar) → Task 11 (vault) → Task 12 (settings)
                         ↓
              ══ CHECKPOINT C ══
                         ↓
Task 13 (PWA) → Task 14 (polish) → Task 15 (deploy)
                         ↓
              ══ CHECKPOINT D ══
```

All tasks are sequential. Each builds on the previous. Commit after every task. Compact context at checkpoints A and B (mandatory), C (optional).

---

## Key Reference Files

- **PRD:** `C:\Users\Kasutaja\Claude_Projects\gym-app\PRD.md`
- **Exercise catalog:** `C:\Users\Kasutaja\Claude_Projects\gym-app\exercise-catalog.json`
- **Exercise images source:** `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/`
- **Research:** `C:\Users\Kasutaja\Claude_Projects\gym-app\RESEARCH.md`
- **Global STACK.md:** `C:\Users\Kasutaja\Claude_Projects\STACK.md`
