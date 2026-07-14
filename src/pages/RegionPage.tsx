import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { objectiveProgress } from '@/lib/selectors'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MissionRow } from '@/components/missions/MissionRow'
import { XpToast } from '@/components/missions/XpToast'
import type { RegionId } from '@/types'

export function RegionPage() {
  const { regionId } = useParams<{ regionId: RegionId }>()
  const navigate = useNavigate()

  const regions = useGameStore((s) => s.regions)
  const allObjectives = useGameStore((s) => s.objectives)
  const missions = useGameStore((s) => s.missions)
  const completeMission = useGameStore((s) => s.completeMission)

  const region = useMemo(() => regions.find((r) => r.id === regionId), [regions, regionId])
  const objectives = useMemo(
    () => allObjectives.filter((o) => o.regionId === regionId),
    [allObjectives, regionId],
  )

  if (!region) {
    return (
      <div className="text-sm text-ink-400">
        Región no encontrada.
        <button onClick={() => navigate('/')} className="ml-2 text-gold-400 underline">
          Volver al mapa
        </button>
      </div>
    )
  }

  return (
    <div>
      <XpToast />

      <button
        onClick={() => navigate('/')}
        className="mb-4 flex items-center gap-1 text-xs text-ink-400"
      >
        <ChevronLeft size={16} /> Mapa
      </button>

      <header className="mb-6 flex items-center gap-3">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
          style={{ backgroundColor: `color-mix(in srgb, ${region.color} 25%, transparent)` }}
        >
          {region.emoji}
        </div>
        <div>
          <h1 className="text-lg font-semibold text-ink-50">{region.name}</h1>
          <p className="text-xs text-ink-400">{region.description}</p>
        </div>
      </header>

      {objectives.length === 0 && (
        <p className="text-sm text-ink-400">Todavía no hay objetivos en esta región.</p>
      )}

      <div className="flex flex-col gap-4">
        {objectives.map((objective) => {
          const objMissions = missions.filter((m) => m.objectiveId === objective.id)
          const progress = objectiveProgress(objective, missions)

          return (
            <Card key={objective.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {objective.icon} {objective.name}
                  </CardTitle>
                  <span className="font-pixel text-[10px] text-gold-400">{progress}%</span>
                </div>
                <CardDescription>{objective.description}</CardDescription>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: objective.color }}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {objMissions.map((mission) => (
                  <MissionRow key={mission.id} mission={mission} onComplete={completeMission} />
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
