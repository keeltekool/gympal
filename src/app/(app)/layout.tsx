import { BottomNav } from '@/components/bottom-nav'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white pb-20">
      {children}
      <BottomNav />
    </div>
  )
}
