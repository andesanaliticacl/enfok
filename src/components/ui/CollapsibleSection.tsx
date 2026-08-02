import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  icon?: ReactNode
  /** Right-aligned chip in the header (e.g. coin count, "3/7"). */
  badge?: ReactNode
  defaultOpen?: boolean
  /** Gold-gradient, glowing treatment for the "legendary" sections (achievements). */
  legendary?: boolean
  children: ReactNode
}

/** A titled panel that expands/collapses on header tap — the profile's building block for tucking Shop/Plans/Logros away until wanted. */
export function CollapsibleSection({ title, icon, badge, defaultOpen = false, legendary, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section
      className={cn(
        'panel-bevel overflow-hidden rounded-2xl border bg-ink-900/85',
        legendary ? 'border-gold-500/50' : 'border-ink-700',
      )}
      style={legendary ? { boxShadow: '0 0 0 1px rgba(242,204,109,0.12), 0 4px 20px rgba(0,0,0,0.4)' } : undefined}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors',
          legendary && 'bg-gradient-to-r from-gold-500/10 to-transparent',
        )}
      >
        <h2 className={cn('flex items-center gap-1.5 text-xs uppercase tracking-wide', legendary ? 'text-gold-400' : 'text-ink-300')}>
          {icon}
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {badge}
          <ChevronDown size={16} className={cn('text-ink-400 transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {open && <div className="px-4 pb-4">{children}</div>}
    </section>
  )
}
