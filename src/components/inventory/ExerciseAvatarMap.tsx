import { useEffect, useState } from 'react'
import { useAvatarStore } from '@/store/useAvatarStore'
import { AvatarSprite } from '@/components/avatar/AvatarSprite'
import { MUSCLE_GROUPS } from '@/data/muscleGroups'
import { cn } from '@/lib/utils'
import type { MuscleGroup } from '@/types'

interface ExerciseAvatarMapProps {
  view: 'frente' | 'espalda'
  selected: MuscleGroup | null
  counts: Partial<Record<MuscleGroup, number>>
  onSelect: (group: MuscleGroup) => void
}

/** Percent-of-frame position for each muscle marker, tuned to where the LPC sprite's limbs actually sit. */
const MARKER_POSITION: Record<MuscleGroup, { x: number; y: number }[]> = {
  hombros: [{ x: 32, y: 30 }, { x: 68, y: 30 }],
  pecho: [{ x: 50, y: 38 }],
  biceps: [{ x: 23, y: 45 }, { x: 77, y: 45 }],
  cuadriceps: [{ x: 42, y: 75 }, { x: 58, y: 75 }],
  espalda: [{ x: 50, y: 38 }],
  triceps: [{ x: 23, y: 45 }, { x: 77, y: 45 }],
  lumbar: [{ x: 50, y: 55 }],
  femoral: [{ x: 42, y: 75 }, { x: 58, y: 75 }],
  otros: [],
}

/**
 * The real avatar stands in for the old abstract silhouette — tapping "Espalda"
 * plays a quick turn-around (a horizontal squeeze/expand swap, the classic 2D
 * sprite "about-face") instead of just switching art, so it reads as *your*
 * character turning, not a different picture. Muscle markers float over it at
 * the matching body position.
 */
export function ExerciseAvatarMap({ view, selected, counts, onSelect }: ExerciseAvatarMapProps) {
  const avatar = useAvatarStore((s) => s.avatar)
  const [displayFacing, setDisplayFacing] = useState<'front' | 'back'>(view === 'espalda' ? 'back' : 'front')
  const [turning, setTurning] = useState(false)

  useEffect(() => {
    const nextFacing = view === 'espalda' ? 'back' : 'front'
    if (nextFacing === displayFacing) return
    setTurning(true)
    const swap = setTimeout(() => setDisplayFacing(nextFacing), 150)
    const settle = setTimeout(() => setTurning(false), 300)
    return () => {
      clearTimeout(swap)
      clearTimeout(settle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  const groups = MUSCLE_GROUPS.filter((g) => g.view === view)

  return (
    <div className="relative mx-auto flex h-72 w-56 items-center justify-center">
      <div
        className="transition-transform duration-150 ease-in"
        style={{ transform: turning ? 'scaleX(0.05)' : 'scaleX(1)' }}
      >
        <AvatarSprite config={avatar} size={224} facing={displayFacing} />
      </div>

      {!turning &&
        groups.map((group) =>
          MARKER_POSITION[group.id].map((pos, i) => {
            const isSelected = selected === group.id
            const count = counts[group.id] ?? 0
            return (
              <button
                key={`${group.id}-${i}`}
                onClick={() => onSelect(group.id)}
                aria-label={group.label}
                className={cn(
                  'absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-base shadow-lg transition-transform hover:scale-110',
                  isSelected
                    ? 'border-gold-400 bg-gold-400/90 text-ink-950'
                    : count > 0
                      ? 'border-gold-500/70 bg-ink-900/90 text-ink-50'
                      : 'border-ink-500 bg-ink-900/80 text-ink-200',
                )}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {group.icon}
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-bold text-ink-950">
                    {count}
                  </span>
                )}
              </button>
            )
          }),
        )}
    </div>
  )
}
