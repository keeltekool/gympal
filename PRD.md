# PRD — GymPal

> Personal fat-loss strength training app that tells you exactly what to do in the gym

---

## 1. Problem

The user has a gym membership but rarely goes because of **decision paralysis** — walks in, head goes blank, doesn't know what exercises to do, in what order, or for how long. Existing fitness apps are either too complex (500 exercises, periodization settings, macro tracking) or too generic (same workout every day, no equipment awareness).

## 2. Goal

A dead-simple mobile app that:
1. Knows what equipment is in your gym (via photo scanning)
2. Asks how much time you have today (30 / 45 / 60 min)
3. Gives you a complete workout — exercise by exercise, with visual demos
4. Varies the exercises every session so it never gets boring
5. Lets you tick off progress at your own pace
6. Is 100% optimized for **fat loss through strength training** (not bulking, not cardio)

## 3. Target User

One user: the app creator. A healthy, sporty male who is already in decent shape and active in sports, but wants to lose fat specifically through gym strength training. Not a beginner who needs to learn what a squat is — someone who is physically capable but struggles with **decision paralysis and consistency** in the gym. The app removes the thinking, not the effort. Exercise difficulty and intensity should reflect an intermediate fitness level, not a gentle introduction.

## 4. Core Principles (Research-Backed)

These are non-negotiable, derived from the research foundation (`RESEARCH.md`):

| Principle | Research Basis |
|-----------|---------------|
| **Full-body every session** | Full-body burns more total calories per session, provides frequent muscle stimulus. Splits are for bodybuilders optimizing size, not fat loss. (Frontiers 2025, n=304) |
| **Compound exercises only** | Multi-joint movements (squat, deadlift, row, press) burn more calories and trigger higher EPOC than isolation exercises. (NASM, Built With Science) |
| **No fixed schedule, always max effort** | The app works whenever the user shows up — no rigid schedule, no guilt, no pacing. Every single session is maximum effect for fat loss regardless of frequency. No deloads, no "light days," no load-sharing across the week. If you're at the gym, you get the best possible workout. The algorithm uses recency only for exercise rotation (variety), never to reduce intensity. |
| **30-45 minutes is enough** | The study that produced -8.9kg fat loss used 2-3 sessions/week of moderate duration. Diminishing returns after ~50 min. |
| **Circuit/superset format** | Short rest between exercises keeps heart rate elevated, maximizing caloric burn and EPOC afterburn. (MRT research, NASM OPT) |
| **Effort > exact rep count** | Muscle growth/preservation is nearly identical across all rep ranges >30% 1RM (effect size: 0.03). What matters is training close to failure. (Schoenfeld 2021) |
| **Progressive overload** | 2-for-2 rule: if user can do 2+ extra reps for 2 sessions → suggest weight increase. (Barbell Medicine, NASM) |
| **Exercise rotation** | Every session hits all 6 movement patterns but with different exercises. Prevents boredom and adaptation. |

## 5. Features

### 5.1 Gym Equipment Scanner (Photo Recognition)

**What:** User photographs their gym equipment. AI vision identifies machines, free weights, benches, racks.

**Why:** Every workout recommendation is constrained to equipment the user actually has. No "do barbell hip thrusts" when the gym only has machines.

**How:**
- User takes 5-15 photos of the gym (walk around, capture everything)
- AI vision model (Claude API) identifies equipment: leg press, lat pulldown, cable machine, dumbbells (with weight range), barbells, benches, etc.
- Equipment inventory is stored in the database and editable (user can add/remove items AI missed)
- Exercise catalog is filtered: only exercises doable with available equipment are recommended

**Equipment → Exercise mapping:**
- Each of the 39 exercises in the catalog has an `equipment` field
- If user's gym has `leg press machine` but no `barbell + squat rack`, the squat pattern slot uses leg press instead of barbell squat
- Cable machine unlocks: seated cable rows, cable lat pulldown, tricep pushdowns, face pulls

### 5.2 Time-Based Workout Scaling

**What:** User selects session duration before each workout: **30 min**, **45 min**, or **60 min**.

**How each duration works:**

| Duration | Structure | Exercises | Sets | Rest Between Exercises |
|----------|-----------|-----------|------|----------------------|
| **30 min** | 1 circuit, 3 rounds | 4-5 exercises (one per movement pattern, core combined) | 3 per exercise | ~15 sec |
| **45 min** | 2 superset pairs + 1 finisher | 5-6 exercises (all patterns covered) | 3 per exercise | ~15-30 sec |
| **60 min** | 3 superset pairs + finisher circuit | 6-7 exercises (all patterns + accessories) | 3-4 per exercise | ~30-60 sec |

**Key rule:** All three durations ALWAYS cover the 6 movement patterns (squat, hinge, push, pull, lunge, core). The 30-min version picks fewer exercises per pattern. The 60-min version adds variety and accessories.

### 5.3 Exercise Rotation & Variety

**What:** No two consecutive sessions have the same exercises. The app intelligently rotates within each movement pattern.

**How:**
- Each movement pattern has 3-8 exercise variants in the catalog
- The app queries the database for recent sessions to know what was used
- Each new session picks exercises the user hasn't done recently, within equipment constraints
- Example rotation for squat pattern across a week:
  - Monday: Barbell Squat
  - Wednesday: Goblet Squat
  - Friday: Leg Press

**Exercise Tier System:**

Not all exercises are equal. A barbell squat burns more calories and activates more muscle than a leg press. The algorithm respects this:

| Tier | Role | Frequency | Description |
|------|------|-----------|-------------|
| **A — Primary** | The best compound movements | ~2 out of 3 sessions | Barbell squat, deadlift, bench press, bent-over row, overhead press |
| **B — Rotation** | Strong alternatives for variety | Regular rotation | Goblet squat, Romanian deadlift, dumbbell press, lat pulldown, dumbbell lunges |
| **C — Variety** | Keep things fresh, fill equipment gaps | ~1x per week or less | Leg press, kettlebell swings, incline push-ups, step-ups, machine exercises |

**Selection algorithm per session:**
1. For each movement pattern, start with the A-tier exercise
2. If user did that exact exercise last session → swap to B-tier
3. If they did B-tier last time too → use C-tier
4. Filter by available equipment (no barbell → A-tier becomes the best available alternative)
5. Result: the most effective exercises dominate, but no two consecutive sessions are identical

**Example week (squat slot):**
- Monday: Barbell Squat (A) → Wednesday: Goblet Squat (B) → Friday: Barbell Squat (A)

**Rules:**
- A-tier exercises SHOULD repeat frequently — they're the best and that's the point. The algorithm varies B and C tier slots for freshness, but the golden compound movements (squat, deadlift, bench, row) can appear in most sessions
- Variety comes from rotating the supporting exercises, not from avoiding the best ones
- Always maintain movement pattern balance (never 2 push exercises and 0 pull)
- Equipment constraints override tier (if gym has no barbell, B-tier becomes the new A for that user)

### 5.4 Workout Session UI (The Core Experience)

**What:** A clean, exercise-by-exercise guided session with progress tracking.

**Design reference:** Hevy app — light/clean aesthetic, card-based exercise layout, generous whitespace, green checkmarks for completion, inline exercise thumbnails. Adapted to our simpler checklist interaction (not a data entry form).

**The screen shows (Layer 1 — Checklist):**
- Scrollable list of exercise cards
- Each card: exercise name, sets × reps (e.g., "3 × 12"), small demo thumbnail, equipment label
- Checkmark to tick off (green when done)
- Swap/dice icon on every exercise (swap individual exercise)
- **Shuffle entire workout button** — regenerates the full exercise list in one tap. Same rules (all 6 patterns, equipment, tiers) but a completely different combination. For when the whole workout doesn't feel right.
- Simple progress indicator: "4 of 6 done"

**Tap any exercise → Layer 2 (Exercise Detail):**
- Opens full-screen detail view
- 2 demonstration images (start position + end position)
- Step-by-step form instructions
- Primary and secondary muscles targeted
- Equipment needed
- Expandable effort guidance tooltip

**Progress tracking:**
- Full exercise list visible as a scrollable checklist
- User ticks off exercises as they complete them
- **Flexible ticking:** can tick one at a time, or do 3 exercises and tick them all off at once, or tick everything at the end — no enforcement
- **Non-sequential order:** user can tick off exercises in ANY order — exercise 6 first, then 3, then 1. The list is a guide, not a mandatory sequence. This handles the real-world problem of equipment being taken — user skips to whatever's available and comes back later
- Completed exercises get a visual checkmark / fade
- Remaining exercises stay prominent
- Subtle overall pace awareness without per-exercise timers or countdowns

**Exercise swap ("roll the dice"):**
- Each exercise in the list has a small swap/dice icon — always available on every exercise
- One tap → exercise is instantly replaced with another from the same movement pattern
- Swap logic: picks an alternative that uses different equipment, maintains quality tier, and hasn't been done recently
- Tap again → get yet another option (cycles through available alternatives)
- Movement pattern is ALWAYS preserved — swapping a squat gives you another squat-type exercise, never a pull or push
- Full-body balance maintained no matter how many exercises are swapped
- Use cases: equipment is taken, user is injured/sore in a specific area, user simply doesn't feel like that exercise today
- The user still completes all movement patterns, so the workout is "complete" regardless of swaps

**Effort guidance (expandable tooltip per exercise):**
- NOT shown on the main exercise screen by default — keeps the UI clean
- User can tap an info/expand icon to reveal effort guidance
- Effort expressed as **percentage of max effort**, not in kilos: "Aim for ~80% effort — you should be able to do 2-3 more reps but it should feel challenging"
- Effort levels per phase:
  - Foundation (weeks 1-4): "~70% effort — focus on form, should feel moderate"
  - Build (weeks 5-8): "~80% effort — last 2-3 reps should be hard"
  - Intensity (weeks 9+): "~85-90% effort — last rep should be a real push"
- Simple language, no jargon, no load percentages or 1RM calculations

**What it does NOT have:**
- No per-set countdown timers
- No beeping or alerts
- No red/yellow/green urgency signals
- No forced confirmation between sets
- No calorie counter
- No heart rate display
- No warm-up routines (user handles this themselves)

### 5.5 Workout Vault (Save Favorite Workouts)

**What:** User can save any completed workout as a favorite and re-use it anytime.

**How:**
- After completing a workout (or from the calendar history), user can tap "Save to Vault"
- Workout is saved with all exercises, sets, reps, and order
- Vault is accessible from the home screen
- When the app generates a new workout and the user doesn't feel like it, they can open the Vault and pick a saved favorite instead
- Saved workouts can be renamed, deleted, or re-ordered in the Vault

**Why:** Sometimes the algorithm generates a perfect session. The user should be able to capture that and replay it. This also gives the user a sense of control — the app suggests, but the user decides.

### 5.6 Phase Progression (Behind the Scenes) — PHASE 2

**What:** The app automatically adjusts workout difficulty over time using the NASM OPT model, without exposing periodization complexity to the user.

**Phases:**

| Phase | Weeks | What Changes (Invisible to User) |
|-------|-------|----------------------------------|
| **1: Foundation** | 1-4 | Moderate tempo, reps 10-12, circuit format, establish baseline across all movement patterns |
| **2: Build** | 5-8 | Normal tempo, moderate reps (10-12), superset format, more demanding exercises introduced |
| **3: Intensity** | 9+ | Full MRT, lower reps (8-10) with heavier weight suggestions, shorter rest, advanced exercises unlocked |

**The user never sees "Phase 2" or "periodization."** They just notice workouts gradually getting more challenging. The app handles progression automatically based on weeks trained and exercise feedback.

### 5.6 Progressive Overload Tracking

**What:** The app remembers what weight/reps the user did and suggests when to increase.

**How:**
- After each exercise, optional quick log: "What weight did you use?" (tap preset or type)
- App stores history per exercise in the database
- When user consistently hits the target reps (2+ extra for 2 sessions), app suggests: "Try 2.5kg heavier next time"
- Weight suggestions are gentle nudges, not requirements
- User can dismiss and stay at current weight

### 5.7 Workout Calendar & History

**What:** A monthly calendar view that shows every gym visit and what was done.

**Monthly Calendar View:**
- Full month grid (like a standard calendar app)
- Workout days get a visual marker (filled dot or checkmark)
- Non-workout days are blank
- Swipe between months to see history
- No streak counters, no goals, no progress bars — just the calendar with marked days

**Tap Any Date → Workout Detail:**
- Opens the exact workout from that day
- Shows: every exercise that was in the plan, which ones were ticked off, exercise order
- Since exercises rotate, this is genuinely useful — "what did I do last Wednesday?" has a real answer
- Optional: weight used per exercise (if logged)

**What it does NOT have:**
- No streak counters or weekly goals
- No "active days goal" progress bars
- No estimated calories burned
- No body weight tracking
- No before/after photos
- No social comparison or leaderboards

## 6. Exercise Database

**Source:** [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Public Domain, Unlicense)

**Curated catalog:** 39 exercises selected for fat-loss strength training, organized by movement pattern:

| Movement Pattern | Exercises | Equipment Variants |
|-----------------|-----------|-------------------|
| Squat | 3 | Barbell, dumbbell/kettlebell, machine |
| Hip Hinge | 6 | Barbell, dumbbell, kettlebell |
| Horizontal Push | 8 | Barbell, dumbbell, machine, bodyweight |
| Vertical Push | 3 | Barbell, dumbbell, kettlebell |
| Horizontal Pull | 4 | Barbell, dumbbell, cable, bodyweight |
| Vertical Pull | 2 | Cable/machine |
| Lunge/Single Leg | 5 | Barbell, dumbbell |
| Core | 3 | Bodyweight |
| Dips | 2 | Bodyweight |

**Each exercise includes:**
- Name, difficulty level, mechanic (compound/isolation), equipment
- Primary and secondary muscles
- Step-by-step form instructions
- 2 demonstration images (start + end position)

**Full database (800+ exercises)** stored for the equipment scanner to match against and for future expansion.

## 7. Design Language

**Primary reference:** Hevy app (hevyapp.com). Every design decision below is derived from studying the actual Hevy UI screens. We adapt their proven patterns to our simpler use case.

### 7.1 Overall Aesthetic

Hevy uses a **clean, professional, light-mode design** that feels like a premium productivity app, not a loud fitness bro app. Key characteristics:
- Pure white backgrounds with very subtle gray separators
- No gradients, no dark backgrounds on main screens (the only dark screen in Hevy is the active workout logging view)
- No background images, textures, or decorative elements
- Everything feels iOS-native — rounded corners, system-like spacing, familiar interaction patterns
- The design gets out of the way — content is king, chrome is minimal

Our app adopts this exact philosophy: **premium-minimal, content-forward, zero visual noise.**

### 7.2 Typography

- **DM Sans 700** — headings, exercise names, buttons, section titles. Geometric sans-serif, clean, modern, warmer than Inter. (Google Fonts)
- **DM Sans 400/500** — body text, descriptions, form instructions, labels
- **JetBrains Mono** — sets/reps numbers, data labels, progress counts. Monospace creates clear visual distinction between "content" (exercise names) and "data" (3 × 12), and aligns numbers perfectly in lists.

**Size scale (mobile):**
| Element | Size | Weight | Font |
|---------|------|--------|------|
| Screen title ("Today's Workout") | 24-28px | 700 bold | DM Sans |
| Exercise name on card | 18-20px | 600 semibold | DM Sans |
| Sets × reps on card | 16px | 400 regular | JetBrains Mono |
| Equipment label on card | 14px | 400 regular | DM Sans |
| Progress indicator ("4 of 6") | 14px | 500 medium | DM Sans |
| Button text | 16px | 700 bold | DM Sans |
| Form instructions (detail view) | 16px | 400 regular | DM Sans |
| Effort tooltip text | 14px | 400 regular | DM Sans |

**Rules:**
- Never use thin/light font weights on workout screens — must be readable at a glance with sweaty eyes in variable gym lighting
- WCAG AA (4.5:1) contrast minimum for all text
- Minimum tap target: 48px height for all interactive elements

### 7.3 Color Palette

Derived from Hevy's color system:

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Background** | White | #FFFFFF | Page backgrounds, main surfaces |
| **Card background** | White | #FFFFFF | Exercise cards sit on the white bg, separated by subtle borders |
| **Card border** | Light gray | #E5E7EB | 1px border on exercise cards, very subtle separation |
| **Surface secondary** | Off-white | #F9FAFB | Header bars, input backgrounds, section dividers |
| **Text primary** | Near-black | #111827 | Exercise names, headings, primary content |
| **Text secondary** | Medium gray | #6B7280 | Equipment labels, metadata, timestamps, secondary info |
| **Text tertiary** | Light gray | #9CA3AF | Placeholder text, disabled states |
| **Accent / Interactive** | Blue | #2563EB | Buttons, tappable links, swap icons, active tab indicators — Hevy uses a similar blue (#1d83ea) |
| **Accent hover/press** | Darker blue | #1D4ED8 | Pressed state on buttons |
| **Success / Completion** | Green | #22C55E | Checkmarks on completed exercises, "Workout Complete" confirmation |
| **Swap dice icon** | Blue | #2563EB | Same as accent — keeps it clean with one accent color |
| **Bottom nav active** | Blue | #2563EB | Active tab icon + label |
| **Bottom nav inactive** | Gray | #9CA3AF | Inactive tab icons |

**No dark mode in MVP.** Light mode only, matching the Hevy reference. The active workout screen stays light too (unlike Hevy which switches to dark during logging) — our screen is simpler and doesn't need the contrast shift.

### 7.4 Layout & Spacing

**Screen structure (from Hevy patterns):**
```
┌─────────────────────────────────┐
│  Status bar (system)            │
│─────────────────────────────────│
│  Screen header                  │  ← 56px height, left-aligned title
│  (title + optional actions)     │     DM Sans 700, 24-28px
│─────────────────────────────────│
│                                 │
│  Content area                   │  ← Scrollable
│  (exercise cards / calendar /   │     16px horizontal padding
│   vault list)                   │     12px gap between cards
│                                 │
│                                 │
│─────────────────────────────────│
│  Bottom navigation bar          │  ← 56-64px height, 4 tabs
│  Train | Calendar | Vault |Setup│     Icon + label per tab
└─────────────────────────────────┘
```

**Spacing system:**
- Horizontal page padding: 16px (both sides)
- Gap between exercise cards: 12px
- Card internal padding: 16px
- Section title to content: 8px
- Between text elements within a card: 4px
- Bottom nav height: 56-64px (matches iOS tab bar conventions)

**Exercise card anatomy (from Hevy):**
```
┌─────────────────────────────────────┐
│ [✓]  Barbell Squat            [🔄] │  ← Checkbox left, swap icon right
│      3 × 12 · Barbell        [img] │  ← Sets×reps in mono, equipment label, thumbnail right
└─────────────────────────────────────┘
```
- Checkbox (left edge): 24px, green fill when checked
- Exercise name: DM Sans 600, 18px, primary text color
- Sets × reps: JetBrains Mono 400, 16px, secondary text color
- Equipment label: DM Sans 400, 14px, secondary text color, separated by a middle dot (·)
- Demo thumbnail: 48×48px, rounded-lg corners, right-aligned
- Swap/dice icon: 20px, accent blue, right side above thumbnail
- Card background: white, 1px #E5E7EB border, rounded-lg corners
- Card padding: 16px all sides
- Min card height: 64px (comfortable tap target)

**Completed exercise card:**
- Checkmark fills green (#22C55E)
- Exercise name and details: opacity reduced to 0.5
- Card border: changes to green (#22C55E) at 0.3 opacity, or stays neutral — test both
- Thumbnail stays visible (user might want to reference form even after completing)

### 7.5 Screen-by-Screen Design Specs

**Screen 1: Home / Start Workout**

Inspired by Hevy's Workout tab — clean, immediate, one primary action:
- Header: "GymPal" in DM Sans 700, 28px
- Time selector: three pill buttons in a row — "30m" "45m" "60m". Selected pill: blue background + white text. Unselected: white background + gray border + gray text. Rounded-lg, 44px height each.
- Primary CTA: "Start Workout →" — full-width blue button, white text, DM Sans 700, 16px, rounded-lg, 52px height. This is the most important button in the app.
- Below CTA: "Last session" summary — one line, secondary text color, shows date + exercise count + duration. Tappable to view detail.
- Bottom nav: 4 tabs — Train (lightning icon), Calendar (grid icon), Vault (bookmark/star icon), Setup (gear icon)

**Screen 2: Active Workout (Core Screen)**

The user spends 90% of their time here. Adapted from Hevy's workout logging screen but radically simplified:
- Header: workout title (auto-generated, e.g., "Full Body · 45 min"), right-aligned elapsed time in JetBrains Mono
- Progress bar: thin horizontal bar below header, fills blue as exercises are completed. Subtle, not dominant.
- Progress text: "4 of 6 done" — DM Sans 500, 14px, secondary text color, centered below progress bar
- Exercise list: scrollable card stack (see card anatomy above)
- **Shuffle button:** positioned above the exercise list or in the header area — small icon button with refresh/shuffle icon in accent blue. Regenerates entire workout.
- Bottom bar during workout: "End Workout" button (red/destructive color, left) + "Tips" button (blue, right). Matches Hevy's workout bottom bar pattern.

**Screen 3: Exercise Detail (Layer 2)**

Opens when tapping an exercise name. Full-screen overlay or push navigation:
- Back arrow (top-left) to return to checklist
- Exercise name: DM Sans 700, 24px, centered or left-aligned
- Tab bar below name: "How To" | "Info" — underline-style tabs (matches our global UI rules)
- **How To tab:**
  - Two demo images side by side (start + end position), equal width, rounded-lg, showing the full movement
  - Below images: numbered step-by-step instructions, DM Sans 400, 16px, with comfortable line-height (1.6)
- **Info tab:**
  - Primary muscles: listed with small colored dots or muscle group icons
  - Secondary muscles: listed in secondary text color
  - Equipment: shown with label
  - Difficulty: beginner / intermediate / advanced badge
  - Effort guidance: expandable accordion — "Effort Guide ▼" — opens to show percentage guidance text

**Screen 4: Monthly Calendar**

Clean calendar grid inspired by Hevy's profile calendar and the circled reference screenshot:
- Header: "March 2026" — DM Sans 700, 24px. Left/right arrows or swipe to change month.
- Day-of-week headers: Mo Tu We Th Fr Sa Su — DM Sans 500, 14px, secondary text color
- Day cells: 44×44px, centered number in DM Sans 400, 16px
- Workout days: number gets a filled blue circle background with white text (like the reference screenshot)
- Today: outlined blue circle (not filled) if no workout yet, filled if workout done
- Non-workout days: plain number, primary text color
- Past months: swipe left, workout days stay marked
- Tap any marked day → navigates to workout detail view showing the full exercise list from that session

**Screen 5: Vault**

Simple list of saved favorite workouts:
- Header: "Vault" — DM Sans 700, 24px
- Each saved workout is a card showing: name (user-given or auto-generated), date saved, exercise count, duration
- Tap to expand → see full exercise list
- "Use This Workout" button — blue CTA, starts the workout session with this exact exercise list
- Swipe left to delete (iOS convention)
- Empty state: "No saved workouts yet. After a great session, tap 'Save to Vault' to keep it."

**Screen 6: Setup / Equipment**

Accessed rarely — functional, not fancy:
- Equipment inventory list with checkmarks (what's in your gym)
- "Scan Gym" button — opens camera for photo-based equipment recognition
- Manual add/remove equipment toggles
- Minimal styling, form-like layout

### 7.6 Navigation

**Bottom tab bar (4 tabs):**
| Tab | Icon | Label | Screen |
|-----|------|-------|--------|
| Train | ⚡ Lightning bolt | Train | Home / Start Workout |
| Calendar | 📅 Grid | Calendar | Monthly calendar + history |
| Vault | ⭐ Star/Bookmark | Vault | Saved favorite workouts |
| Setup | ⚙️ Gear | Setup | Equipment scanner + settings |

- Active tab: blue icon + blue label text
- Inactive tabs: gray icon + gray label text
- Tab bar background: white with top border (#E5E7EB)
- Tab bar height: 56-64px
- Tab bar is HIDDEN during active workout (more screen space for the exercise list) — shows again when workout ends

### 7.7 Interaction & Animation (Framer Motion)

All animations are **subtle, fast (150-300ms), and functional** — they communicate state changes, not celebrate. No bouncing, no confetti, no celebratory pop-ups.

| Interaction | Animation | Duration |
|-------------|-----------|----------|
| Tick off exercise | Checkmark scales in from 0→1 with slight spring, card text fades to 50% opacity | 200ms |
| Swap single exercise (dice) | Current card slides out left, new card slides in from right | 250ms |
| Shuffle entire workout | All cards fade out simultaneously, new cards fade in with slight stagger (50ms between each) | 300ms total |
| Open exercise detail | Card expands to full screen or pushes from right (standard iOS navigation) | 250ms |
| Close exercise detail | Reverse of open | 200ms |
| Progress bar fill | Smooth width transition as exercises complete | 300ms ease |
| Time selector pill | Selected pill fills blue with background color transition | 150ms |
| Save to Vault confirmation | Brief checkmark + "Saved" toast that auto-dismisses | 1500ms visible |

### 7.8 Mobile-Only Rules

- **Design for 375-430px width only** — no responsive breakpoints, no tablet, no desktop
- **Bottom navigation** — thumb-reachable, matches iOS tab bar conventions
- **No horizontal scrolling anywhere** — everything stacks vertically
- **Offline-ready visuals** — all exercise images cached locally via service worker, no loading spinners during workouts, no skeleton states for cached content
- **Safe area awareness** — respect iOS notch/Dynamic Island at top and home indicator at bottom
- **Touch feedback** — all tappable elements show a brief opacity change (0.7) on press
- **Swipe gestures** — swipe between months on calendar, swipe left on vault items to delete

## 8. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js | Same stack as all other projects, handles both frontend and API routes |
| **UI** | Tailwind CSS | Consistent with all other projects |
| **Database** | Neon (Postgres) | Stores workout sessions, equipment inventory, exercise history. Already have account. |
| **ORM** | Drizzle | Same as other projects (ApplyKit, QuoteKit, etc.) |
| **AI Vision** | Claude API (Anthropic) | Equipment recognition from photos — already have account + API key |
| **Animations** | Framer Motion | Smooth mobile interactions — checkmark tick-off, exercise swap transitions, card animations. Makes the PWA feel native. New dependency for this project. |
| **Hosting** | Vercel | Same as all other projects |
| **Delivery** | PWA | Added to iOS home screen via Safari "Add to Home Screen" — runs full-screen, no browser chrome |

**Why Next.js:** Same proven stack as ApplyKit, QuoteKit, and all other projects. Handles API routes natively for database operations. Deploys as one unit to Vercel.

**Why Neon/Drizzle backend:** Workout history, equipment inventory, and exercise tracking must persist reliably — not just in browser localStorage that can be wiped. Equipment scanner results need database storage for the exercise mapping to work. Calendar/history queries need a real database.

**Why PWA:** No App Store needed, instant deployment via Vercel. User adds to iPhone home screen via Safari — looks and feels like a native app. Service worker caches exercise images and app shell for offline gym use.

## 9. User Flow

```
FIRST TIME:
1. Open app
2. "Let's set up your gym" → Take photos of equipment
3. AI identifies equipment → User confirms/edits list
4. Equipment saved to database
5. "You're ready!"

EVERY WORKOUT:
1. Open app
2. "How much time today?" → 30 / 45 / 60 min
3. "Start Workout" → Exercise list generated (based on equipment, recency, tier system)
4. Exercise checklist: thumbnail + name + sets × reps + swap icon
5. User does exercises, ticks off at their own pace, in any order
6. Can swap any exercise via dice icon if equipment is taken
7. Optional: log weight used
8. "Workout Complete!" → Session saved to database
9. Close app, leave gym

CHECKING HISTORY:
1. Open calendar tab
2. See monthly grid with workout days marked
3. Tap any past date → see exact exercises done that day
```

## 10. What This App Is NOT

- **Not a calorie tracker** — deficit matters but that's a nutrition app
- **Not a social fitness app** — no leaderboards, no sharing, no challenges
- **Not a bodybuilding app** — no muscle isolation, no bulk programs, no "chest day"
- **Not a cardio app** — no treadmill programs, no running plans
- **Not a general fitness platform** — no yoga, no stretching routines, no meditation
- **Not a wearable companion** — no heart rate, no step counting, no sleep tracking
- **Not a beginner tutorial app** — no "what is a squat" hand-holding, no wall push-ups
- **Not a desktop app** — mobile-first and mobile-only, PWA via Safari home screen

It does ONE thing: tells you exactly what strength exercises to do in the gym today, optimized for fat loss.

## 11. MVP Scope

### Phase 1 (MVP)
- [ ] Equipment scanner (photo → AI identification → inventory stored in DB)
- [ ] Time-based workout generation (30/45/60 min)
- [ ] Exercise rotation algorithm with tier system (A/B/C)
- [ ] Workout session UI (exercise checklist, tick-off in any order, swap dice, images)
- [ ] Exercise detail view (full form images + instructions + effort tooltip)
- [ ] Monthly calendar view (marked days + tap-to-see-past-workout-detail)
- [ ] Workout Vault (save favorite workouts, pick from vault instead of generated workout)
- [ ] PWA setup (service worker, manifest, offline exercise image caching)
- [ ] Neon database (workout sessions, equipment inventory, exercise history)

### Phase 2
- [ ] Progressive overload tracking (weight logging + increase suggestions)
- [ ] Phase progression (automatic difficulty scaling over weeks)
- [ ] Workout rating / exercise preference feedback
- [ ] Equipment inventory editing UI

### Phase 3
- [ ] Video demonstrations (YouTube embeds or MuscleWiki integration)
- [ ] Custom exercise additions
- [ ] Multi-device sync (if needed)

## 12. Success Metrics

This is a personal app. Success = the user actually goes to the gym consistently.

- **Primary:** Does the user open the app at the gym and complete workouts?
- **Secondary:** Does the calendar show regular workout days over time?

---

*Research foundation: `RESEARCH.md` (450+ lines, 4 peer-reviewed studies, 25+ sources)*
*Exercise catalog: `EXERCISE-CATALOG.md` (39 exercises with images + instructions)*
*Exercise data: `exercise-catalog.json` (structured JSON) + `exercises-db.json` (full 800+ DB)*
