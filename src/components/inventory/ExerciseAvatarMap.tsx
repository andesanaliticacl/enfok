import { useEffect, useState } from 'react'
import { useAvatarStore } from '@/store/useAvatarStore'
import { AvatarLayerImage } from '@/components/avatar/AvatarLayerImage'
import { lpcProvider } from '@/lib/avatar/providers/lpcProvider'
import { MUSCLE_GROUPS } from '@/data/muscleGroups'
import { cn } from '@/lib/utils'
import type { MuscleGroup } from '@/types'

interface ExerciseAvatarMapProps {
  view: 'frente' | 'espalda'
  selected: MuscleGroup | null
  counts: Partial<Record<MuscleGroup, number>>
  onSelect: (group: MuscleGroup) => void
}

/** A neutral charcoal shade — no skin/hair/garment color leaks in, so the silhouette reads as one clean anatomical shape. */
const SILHOUETTE_HEX = '#3a3d42'

/** Anchor on the body each marker's leader line starts from (percent of frame). */
const ANCHOR_POSITION: Record<MuscleGroup, { x: number; y: number }[]> = {
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

/** Where the emoji label floats, pushed outward from its anchor so it never sits on top of the body. */
const LABEL_POSITION: Record<MuscleGroup, { x: number; y: number }[]> = {
  hombros: [{ x: 12, y: 20 }, { x: 88, y: 20 }],
  pecho: [{ x: 50, y: 12 }],
  biceps: [{ x: 2, y: 45 }, { x: 98, y: 45 }],
  cuadriceps: [{ x: 26, y: 92 }, { x: 74, y: 92 }],
  espalda: [{ x: 50, y: 12 }],
  triceps: [{ x: 2, y: 45 }, { x: 98, y: 45 }],
  lumbar: [{ x: 82, y: 60 }],
  femoral: [{ x: 26, y: 92 }, { x: 74, y: 92 }],
  otros: [],
}

/**
 * The real avatar's body shape stands in for the old abstract silhouette, but
 * stripped to body+head and recolored to one neutral charcoal tone — no
 * clothes, hair, or hat. That sidesteps the "mask stays facing front when you
 * turn around" bug entirely, since those single-frame accessory layers simply
 * aren't rendered here. Turning to "Espalda" plays a quick turn-around (a
 * horizontal squeeze/expand swap). Muscle markers float a short leader-line
 * away from their body point instead of sitting on top of it, and the line
 * glows gold when its group is selected.
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

  const bodyLayer = lpcProvider.resolveLayer('body', avatar.options.body ?? 'male', undefined, avatar.figure)
  const headLayer = lpcProvider.resolveLayer('head', avatar.options.body ?? 'male', undefined, avatar.figure)
  const silhouetteLayers = [bodyLayer, headLayer]
    .filter((l): l is NonNullable<typeof l> => l !== null)
    .map((l) => ({ ...l, recolorTargetHex: SILHOUETTE_HEX }))

  const groups = MUSCLE_GROUPS.filter((g) => g.view === view)
  const frameSize = lpcProvider.frameSize
  const scale = 224 / frameSize

  return (
    <div className="relative mx-auto h-72 w-56">
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-in"
        style={{ transform: turning ? 'scaleX(0.05)' : 'scaleX(1)' }}
      >
        <div style={{ width: frameSize, height: frameSize, position: 'relative', transform: `scale(${scale})` }}>
          {silhouetteLayers.map((layer) => (
            <AvatarLayerImage key={layer.category} layer={layer} facing={displayFacing} />
          ))}
        </div>
      </div>

      {!turning && (
        <>
          {/* Leader lines — one SVG overlay so they always sit under the emoji buttons */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
            {groups.flatMap((group) =>
              ANCHOR_POSITION[group.id].map((anchor, i) => {
                const label = LABEL_POSITION[group.id][i]
                const isSelected = selected === group.id
                return (
                  <line
                    key={`${group.id}-line-${i}`}
                    x1={anchor.x}
                    y1={anchor.y}
                    x2={label.x}
                    y2={label.y}
                    stroke={isSelected ? 'var(--color-gold-400)' : 'rgba(255,255,255,0.35)'}
                    strokeWidth={isSelected ? 1.2 : 0.6}
                    style={isSelected ? { filter: 'drop-shadow(0 0 3px var(--color-gold-400))' } : undefined}
                  />
                )
              }),
            )}
          </svg>

          {groups.map((group) =>
            LABEL_POSITION[group.id].map((pos, i) => {
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
                      ? 'border-gold-400 bg-gold-400/90 text-ink-950 shadow-[0_0_10px_2px_rgba(242,204,109,0.6)]'
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
        </>
      )}
    </div>
  )
}
