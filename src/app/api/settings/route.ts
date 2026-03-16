import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { userSettings } from '@/db/schema'
import { eq } from 'drizzle-orm'

// GET — get user settings (creates default if none exists)
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.clerkUserId, userId),
  })

  if (!settings) {
    const [created] = await db.insert(userSettings).values({
      clerkUserId: userId,
    }).returning()
    settings = created
  }

  return NextResponse.json(settings)
}

// PUT — update user settings
export async function PUT(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { defaultDuration } = await req.json()

  if (![30, 45, 60].includes(defaultDuration)) {
    return NextResponse.json({ error: 'Invalid duration' }, { status: 400 })
  }

  await db.update(userSettings)
    .set({ defaultDuration, updatedAt: new Date() })
    .where(eq(userSettings.clerkUserId, userId))

  return NextResponse.json({ ok: true })
}
