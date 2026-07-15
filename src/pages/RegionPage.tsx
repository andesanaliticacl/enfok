import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Pencil } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { goalProgress } from '@/lib/planning/goalEngine'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { MissionRow } from '@/components/missions/MissionRow'
import { XpToast } from '@/components/missions/XpToast'
import { GoalFormDialog } from '@/components/planning/GoalFormDialog'
import { MissionFormDialog } from '@/components/planning/MissionFormDialog'
import type { Goal, Mission, RegionId } from '@/types'

export function RegionPage() {
  const { regionId } = useParams<{ regionId: RegionId }>()
  const navigate = useNavigate()

  const regions = useGameStore((s) => s.regions)
  const allGoals = useGameStore((s) => s.goals)
  const missions = useGameStore((s) => s.missions)
  const completeMission = useGameStore((s) => s.completeMission)
  const addGoal = useGameStore((s) => s.addGoal)
  const updateGoal = useGameStore((s) => s.updateGoal)
  const deleteGoal = useGameStore((s) => s.deleteGoal)
  const addMission = useGameStore((s) => s.addMission)
  const updateMission = useGameStore((s) => s.updateMission)
  const deleteMission = useGameStore((s) => s.deleteMission)

  const [goalDialog, setGoalDialog] = useState<{ open: boolean; goal?: Goal }>({ open: false })
  const [missionDialog, setMissionDialog] = useState<{ open: boolean; goalId?: string; mission?: Mission }>({
    open: false,
  })

  const region = useMemo(() => regions.find((r) => r.id === regionId), [regions, regionId])
  const goals = useMemo(() => allGoals.filter((g) => g.regionId === regionId), [allGoals, regionId])

  if (!region) {
    return (
      <PageContainer className="text-sm text-ink-400">
        Región no encontrada.
        <button onClick={() => navigate('/')} className="ml-2 text-gold-400 underline">
          Volver al mapa
        </button>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <XpToast />

      <button
        onClick={() => navigate('/')}
        className="mb-4 flex items-center gap-1 text-xs text-ink-400"
      >
        <ChevronLeft size={16} /> Mapa
      </button>

      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
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
        </div>
        <Button size="icon" onClick={() => setGoalDialog({ open: true })}>
          <Plus size={18} />
        </Button>
      </header>

      {goals.length === 0 && (
        <p className="text-sm text-ink-400">Todavía no hay metas en esta región. Crea la primera.</p>
      )}

      <div className="flex flex-col gap-4">
        {goals.map((goal) => {
          const goalMissions = missions.filter((m) => m.goalId === goal.id)
          const progress = goalProgress(goal, missions)

          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {goal.icon} {goal.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-[10px] text-gold-400">{progress}%</span>
                    <button
                      onClick={() => setGoalDialog({ open: true, goal })}
                      className="text-ink-400 hover:text-ink-50"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>
                <CardDescription>{goal.description}</CardDescription>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: goal.color }}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {goalMissions.map((mission) => (
                  <MissionRow
                    key={mission.id}
                    mission={mission}
                    onComplete={completeMission}
                    onEdit={(m) => setMissionDialog({ open: true, goalId: goal.id, mission: m })}
                  />
                ))}
                <button
                  onClick={() => setMissionDialog({ open: true, goalId: goal.id })}
                  className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-ink-600 py-2 text-xs text-ink-400 hover:text-ink-50"
                >
                  <Plus size={14} /> Agregar misión
                </button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <GoalFormDialog
        open={goalDialog.open}
        onClose={() => setGoalDialog({ open: false })}
        defaultRegionId={region.id}
        goal={goalDialog.goal}
        onSubmit={(input) => (goalDialog.goal ? updateGoal(goalDialog.goal.id, input) : addGoal(input))}
        onDelete={goalDialog.goal ? () => deleteGoal(goalDialog.goal!.id) : undefined}
      />

      <MissionFormDialog
        open={missionDialog.open}
        onClose={() => setMissionDialog({ open: false })}
        defaultGoalId={missionDialog.goalId}
        mission={missionDialog.mission}
        onSubmit={(input) =>
          missionDialog.mission ? updateMission(missionDialog.mission.id, input) : addMission(input)
        }
        onDelete={missionDialog.mission ? () => deleteMission(missionDialog.mission!.id) : undefined}
      />
    </PageContainer>
  )
}
