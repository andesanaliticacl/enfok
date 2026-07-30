import { MUSCLE_GROUPS } from '@/data/muscleGroups'
import { cn } from '@/lib/utils'
import type { MuscleGroup } from '@/types'

interface BodyMapProps {
  view: 'frente' | 'espalda'
  selected: MuscleGroup | null
  counts: Partial<Record<MuscleGroup, number>>
  onSelect: (group: MuscleGroup) => void
}

/** A stylized humanoid silhouette with tappable markers per muscle group. Same silhouette for both views — only the marker set changes, since front/back limb positions largely coincide. */
export function BodyMap({ view, selected, counts, onSelect }: BodyMapProps) {
  const groups = MUSCLE_GROUPS.filter((g) => g.view === view)

  return (
    <svg viewBox="0 0 200 360" className="mx-auto h-72 w-auto" role="img" aria-label={`Mapa muscular, vista ${view}`}>
      {/* Silhouette */}
      <g fill="var(--color-ink-700)">
        <circle cx="100" cy="32" r="24" />
        <rect x="64" y="58" width="72" height="112" rx="22" />
        <rect x="34" y="62" width="24" height="96" rx="11" />
        <rect x="142" y="62" width="24" height="96" rx="11" />
        <rect x="70" y="168" width="28" height="134" rx="13" />
        <rect x="102" y="168" width="28" height="134" rx="13" />
      </g>

      {groups.map((group) =>
        group.positions.map((pos, i) => {
          const isSelected = selected === group.id
          const count = counts[group.id] ?? 0
          return (
            <g
              key={`${group.id}-${i}`}
              onClick={() => onSelect(group.id)}
              className="cursor-pointer"
              role="button"
              aria-label={group.label}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 17 : 15}
                className={cn(
                  'transition-all',
                  isSelected ? 'fill-gold-400' : count > 0 ? 'fill-gold-500/70' : 'fill-ink-600',
                )}
                stroke={isSelected ? 'var(--color-gold-400)' : 'transparent'}
                strokeWidth={2}
              />
              <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize={14}>
                {group.icon}
              </text>
              {count > 0 && (
                <text
                  x={pos.x + 12}
                  y={pos.y - 10}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  className={isSelected ? 'fill-ink-950' : 'fill-ink-50'}
                >
                  {count}
                </text>
              )}
            </g>
          )
        }),
      )}
    </svg>
  )
}
