import { ArrowRight, RotateCcw } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { cn } from '@/lib/utils'
import type { LifeSystem } from '@/types'

/** "Juan Pérez" → "JP", "Ana" → "AN" — a compact stand-in for an avatar. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

interface SystemFlowProps {
  system: LifeSystem
  /** Highlights one box — used while editing a step. */
  activeStepId?: string | null
  onStepClick?: (stepId: string) => void
}

/**
 * The system drawn as boxes joined by arrows. It wraps instead of scrolling
 * sideways so a 10-step machine still fits on a phone and you can see the whole
 * thing at once — which is the entire point of drawing it.
 */
export function SystemFlow({ system, activeStepId, onStepClick }: SystemFlowProps) {
  const people = useGameStore((s) => s.people)

  if (system.steps.length === 0) {
    return <p className="text-center text-[11px] text-ink-500">Agrega el primer paso para dibujar el sistema.</p>
  }

  return (
    <div className="flex flex-wrap items-stretch gap-1.5">
      {system.steps.map((step, index) => (
        <div key={step.id} className="flex items-stretch gap-1.5">
          <button
            type="button"
            onClick={() => onStepClick?.(step.id)}
            disabled={!onStepClick}
            title={step.note}
            className={cn(
              'flex min-w-[84px] max-w-[150px] flex-col items-center justify-center rounded-xl border px-2.5 py-2 text-center transition-transform',
              onStepClick && 'active:scale-95',
              activeStepId === step.id ? 'border-gold-400 bg-gold-500/15' : 'border-ink-600 bg-ink-950/70',
            )}
            style={activeStepId === step.id ? undefined : { borderColor: `${system.color}66` }}
          >
            <span className="text-[9px] font-medium" style={{ color: system.color }}>
              {index + 1}
            </span>
            <span className="text-[11px] leading-tight text-ink-50">{step.label}</span>
            {step.note && <span className="mt-0.5 text-[9px] leading-tight text-ink-500">{step.note}</span>}

            {/* An unowned step is the one that silently stalls — so ownership is visible on the box itself */}
            {(() => {
              const person = step.personId ? people.find((p) => p.id === step.personId) : undefined
              if (!person && !step.role) return null
              return (
                <span className="mt-1.5 flex w-full flex-col items-center gap-0.5 border-t border-ink-700/70 pt-1.5">
                  {person && (
                    <span className="flex max-w-full items-center gap-1">
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[7px] font-bold text-ink-950"
                        style={{ backgroundColor: system.color }}
                      >
                        {initialsOf(person.name)}
                      </span>
                      <span className="truncate text-[9px] text-ink-200">{person.name}</span>
                    </span>
                  )}
                  {step.role && (
                    <span
                      className="max-w-full truncate rounded-full px-1.5 py-px text-[8px] uppercase tracking-wide"
                      style={{ backgroundColor: `${system.color}22`, color: system.color }}
                    >
                      {step.role}
                    </span>
                  )}
                </span>
              )
            })()}
          </button>

          {index < system.steps.length - 1 && (
            <ArrowRight size={14} className="self-center shrink-0 text-ink-600" aria-hidden />
          )}
        </div>
      ))}

      {system.loops && (
        <div className="flex items-center gap-1.5">
          <ArrowRight size={14} className="self-center shrink-0 text-ink-600" aria-hidden />
          <span
            className="flex items-center gap-1 rounded-xl border border-dashed px-2.5 py-2 text-[10px]"
            style={{ borderColor: `${system.color}88`, color: system.color }}
            title="El último paso alimenta al primero"
          >
            <RotateCcw size={11} /> Vuelve al inicio
          </span>
        </div>
      )}
    </div>
  )
}
