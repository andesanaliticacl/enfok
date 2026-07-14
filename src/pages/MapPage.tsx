import { useGameStore } from '@/store/useGameStore'
import { regionProgress } from '@/lib/selectors'
import { RegionNode } from '@/components/map/RegionNode'

export function MapPage() {
  const regions = useGameStore((s) => s.regions)
  const objectives = useGameStore((s) => s.objectives)
  const missions = useGameStore((s) => s.missions)
  const profile = useGameStore((s) => s.profile)

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-pixel text-lg text-gold-400">Questly</h1>
          <p className="mt-1 text-xs text-ink-400">El mapa de tu vida</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-400">Nivel {profile.level}</p>
          <p className="font-pixel text-[10px] text-gold-400">{profile.xp} XP</p>
        </div>
      </header>

      <div className="relative flex flex-col gap-6 pl-2">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ink-700" />
        {regions.map((region, index) => (
          <RegionNode
            key={region.id}
            region={region}
            progress={regionProgress(region, objectives, missions)}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
