import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Standard reading column for content screens — keeps text/cards comfortably narrow on desktop instead of stretching edge to edge. Screens that want full width (the map) skip this and render directly in AppShell's <main>. */
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-xl px-4 pt-6', className)}>{children}</div>
}
