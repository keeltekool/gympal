'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, CalendarDays, Bookmark, Settings } from 'lucide-react'

const tabs = [
  { href: '/train', label: 'Train', icon: Zap },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/vault', label: 'Vault', icon: Bookmark },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  // Hide nav during active workout
  if (pathname.startsWith('/workout')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 pb-[env(safe-area-inset-bottom)]"
      style={{ background: 'rgba(10, 10, 18, 0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div className="flex h-14 items-center justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors active:opacity-70 ${
                active ? 'text-accent' : 'text-text-tertiary'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[11px] font-medium">{label}</span>
              {active && (
                <span className="absolute bottom-[calc(env(safe-area-inset-bottom)+2px)] h-0.5 w-5 rounded-full bg-accent" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
