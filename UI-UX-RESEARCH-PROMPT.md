# UI/UX Research Brief — GymPal Fitness App

## What This App Is

A personal mobile app (iOS/Android) for **fat-loss strength training**. It tells the user exactly what exercises to do in the gym, optimized for maximum fat loss through compound strength exercises. The target user is a sporty, intermediate-level male — not a beginner, not a bodybuilder.

## Core Screens & Features (What Needs Visual Design)

### Screen 1: Home / Start
- "How much time today?" — three options: 30 / 45 / 60 min
- "Start Workout" button
- Current week status: "2 of 3 sessions done" (subtle, not pushy)
- Quick access to calendar/history

### Screen 2: Active Workout (THE main screen — user spends 90% of time here)
- Scrollable checklist of 4-7 exercises for today's session
- Each exercise shows: name, sets × reps (e.g., "3 × 12"), small demo image
- Tick-off functionality — user checks exercises as done, in ANY order (non-sequential)
- Swap/dice icon on every exercise — tap to replace with alternative
- Progress indicator: "4 of 6 done" (simple, not a timer or countdown)
- Expandable tooltip per exercise for effort guidance (hidden by default, keeps UI clean)
- Must work well with sweaty fingers and gym gloves

### Screen 3: Exercise Detail (tap any exercise to expand)
- Two demonstration images: start position + end position
- Step-by-step form instructions
- Primary/secondary muscles targeted
- Equipment needed
- Effort guidance (percentage-based: "aim for ~80% effort")

### Screen 4: Monthly Calendar
- Full month grid view
- Workout days get a visual badge/marker
- Tap any past date → see the exact exercises done that day
- Streak counter and monthly summary
- Swipe between months

### Screen 5: Equipment Setup (one-time / rare)
- Photo capture interface for gym equipment scanning
- Equipment inventory list (editable)
- Simple, functional — not a daily screen

## Design Requirements

- **Mobile-first** (React Native / Expo)
- **Offline-capable** — works in gyms with no signal
- **Dark mode preferred** — gym lighting varies, screens are bright
- **Large tap targets** — used during exercise with sweaty hands
- **Minimal text, maximum clarity** — user glances at phone between sets, doesn't read paragraphs
- **Premium feel** — modern, clean, motivating but not aggressive/shouty
- **No clutter** — the app does one thing, the UI should reflect that focus

## What This App Does NOT Have (Don't Research These)

- No calorie tracking or nutrition features
- No social/community features or leaderboards
- No wearable/smartwatch integration
- No video playback during workouts
- No complex settings or customization screens
- No onboarding wizard or multi-step setup flow (besides equipment scan)
- No cardio/running features

---

## Research Task

### What To Find

1. **Best-in-class fitness app UI examples** — screenshot or reference the top 5-10 fitness/workout apps with the most polished, modern mobile UI. Focus on apps that guide users through workouts (not just tracking apps).

2. **Workout session screen patterns** — how do the best apps present the active workout? Checklist vs card stack vs single-exercise-fullscreen? How do they handle exercise completion, progress, and transitions?

3. **Exercise demonstration presentation** — how do top apps show the user what an exercise looks like? Static images, GIFs, video, animated illustrations? What works best for quick glancing between sets?

4. **Minimalist fitness UI** — apps that achieve a premium feel with minimal elements. No clutter, no information overload. Clean, modern, motivating.

5. **Calendar/history views in fitness apps** — how do the best apps show workout history? Monthly grid, streak visualization, achievement badges?

6. **Color schemes and typography** — what color palettes work for fitness apps that feel premium but not aggressive? Dark mode examples especially.

7. **Micro-interactions and gamification** — how do top apps handle the "completion" moment? Check-off animations, progress celebrations, streak badges?

### Apps To Specifically Investigate

- **Hevy** — popular workout tracker, clean UI
- **Strong** — minimal workout logging
- **Fitbod** — AI-generated workouts, good exercise presentation
- **Nike Training Club** — premium design, guided workouts
- **JEFIT** — exercise database with images
- **Freeletics** — bodyweight focus, strong UX
- **Peloton** — premium feel, class-based
- **Future** — personal training app, modern UI
- **Caliber** — strength training focus
- **Apple Fitness+** — benchmark for polish and simplicity

### What To Bring Back

For each app investigated:
1. What they do well visually (specific screens/patterns)
2. What feels outdated or cluttered (anti-patterns to avoid)
3. Screenshots or detailed descriptions of their best screens
4. Color palette / typography choices
5. How they handle the workout session flow specifically

### The Decision We Need To Make Together

Based on the research, we need to pick:
- **Visual style direction** (dark vs light, bold vs minimal, illustration style)
- **Workout screen layout pattern** (checklist vs cards vs full-screen per exercise)
- **Color palette** (brand color, backgrounds, accents)
- **Exercise image presentation** (static photos vs illustrated vs animated)
- **Overall design personality** (coach-like? calm? energetic? premium-minimal?)
