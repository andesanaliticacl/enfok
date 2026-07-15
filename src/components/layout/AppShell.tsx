import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col pb-20">
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  )
}
