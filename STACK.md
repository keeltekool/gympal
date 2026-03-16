# GymPal — STACK.md

**Last updated:** 2026-03-16

## Stack
- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Auth:** Clerk (Google-only sign-in)
- **Database:** Neon Postgres (eu-central-1) + Drizzle ORM
- **Hosting:** Vercel
- **Icons:** Lucide React
- **Fonts:** DM Sans (headings), JetBrains Mono (numbers/data)

## URLs
- **Production:** https://gym-app-eight-phi.vercel.app
- **GitHub:** https://github.com/keeltekool/gympal
- **Neon:** project `lucky-lake-11063794` (gympal DB)
- **Clerk:** app `app_3B1tF1MuLepM04cOUisKwrwdL6Y`

## Database Tables
- `user_settings` — default workout duration per user
- `workout_sessions` — session records (duration, timestamps, completion)
- `workout_exercises` — exercises within sessions (name, pattern, tier, completion)
- `vault_workouts` — saved favorite workouts (JSON exercises)

## Key Architecture
- Exercise catalog: 36 exercises in `src/lib/exercises.ts` with A/B/C tier + 6 movement patterns
- Workout algorithm: `src/lib/workout-generator.ts` — tier-based, recency-aware rotation
- Images: 72 bundled JPGs in `public/exercises/` (4.4MB, public domain)
- PWA: manifest.json + standalone mode, no service worker yet

## Gotchas
- **Middleware + .json files:** Clerk middleware matcher must exclude `.json` or manifest.json returns 404
- **Next.js 16 middleware deprecation:** Warning about "middleware → proxy" — still works, cosmetic only
- **viewport/themeColor in metadata:** Should use `generateViewport` export instead (Next.js 16 warning)
- **Google OAuth + automated Chrome:** Cannot sign in via chrome-devtools (standalone) — must use chrome-devtools-live
