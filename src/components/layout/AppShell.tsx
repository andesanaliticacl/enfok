import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col pb-20">
      <main className="flex-1 px-4 pt-6">{children}</main>
      <BottomNav />
    </div>
  )
}
