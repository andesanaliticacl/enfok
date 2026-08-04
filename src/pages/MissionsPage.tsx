import { useState } from 'react'
import { CalendarDays, Calendar as CalendarIcon, GitBranch, Plus } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { TodayHeader } from '@/components/planning/TodayHeader'
import { CalendarView } from '@/components/planning/CalendarView'
import { DayView } from '@/components/planning/DayView'
import { GoalTreeView } from '@/components/planning/GoalTreeView'
import { MissionHierarchyGuide } from '@/components/planning/MissionHierarchyGuide'
import { FirstGoalCelebration } from '@/components/planning/FirstGoalCelebration'
import { XpToast } from '@/components/missions/XpToast'
import { MissionFormDialog } from '@/components/planning/MissionFormDialog'
import { GoalFormDialog } from '@/components/planning/GoalFormDialog'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/PageContainer'
import { cn } from '@/lib/utils'
import type { Goal, Mission } from '@/types'

export function MissionsPage() {
  const regions = useGameStore((s) => s.regions)
  const addMission = useGameStore((s) => s.addMission)
  const updateMission = useGameStore((s) => s.updateMission)
  const deleteMission = useGameStore((s) => s.deleteMission)
  const addGoal = useGameStore((s) => s.addGoal)
  const updateGoal = useGameStore((s) => s.updateGoal)
  const deleteGoal = useGameStore((s) => s.deleteGoal)

  const [view, setView] = useState<'arbol' | 'dia' | 'calendario'>('dia')
  const [dialog, setDialog] = useState<{ open: boolean; mission?: Mission; date?: string; goalId?: string }>({
    open: false,
  })
  const [goalDialog, setGoalDialog] = useState<{ open: boolean; goal?: Goal }>({ open: false })

  const goals = useGameStore((s) => s.goals)
  // A mission has nowhere to live without a goal, so before the first one the
  // primary action is always "create a goal" — whatever view you're in.
  const needsFirstGoal = goals.length === 0
  /** Set only when the goal just created was the very first one. */
  const [firstGoal, setFirstGoal] = useState<Goal | null>(null)

  function handleGoalSubmit(input: Parameters<typeof addGoal>[0]) {
    if (goalDialog.goal) {
      updateGoal(goalDialog.goal.id, input)
      return
    }
    const wasFirst = goals.length === 0
    const id = addGoal(input)
    if (wasFirst) {
      const created = useGameStore.getState().goals.find((g) => g.id === id)
      if (created) setFirstGoal(created)
    }
  }

  function handlePrimaryAdd() {
    if (needsFirstGoal || view === 'arbol') setGoalDialog({ open: true })
    else setDialog({ open: true })
  }

  return (
    <PageContainer>
      <XpToast />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-pixel text-lg text-gold-400">Misiones</h1>
        {/* Spelling out what the + creates — it changes with the view, so an icon alone is a guess */}
        <Button size="sm" onClick={handlePrimaryAdd}>
          <Plus size={15} /> {needsFirstGoal || view === 'arbol' ? 'Nueva meta' : 'Nueva misión'}
        </Button>
      </div>

      <TodayHeader />

      {/* Before the first goal there's nothing to plan — teach the hierarchy instead of showing empty views */}
      {needsFirstGoal ? (
        <div className="mt-4">
          <MissionHierarchyGuide variant="full" onCreateGoal={() => setGoalDialog({ open: true })} />
        </div>
      ) : (
        <>
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setView('arbol')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
                view === 'arbol' && 'bg-ink-800 text-gold-400',
              )}
            >
              <GitBranch size={14} /> Árbol
            </button>
            <button
              onClick={() => setView('dia')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
                view === 'dia' && 'bg-ink-800 text-gold-400',
              )}
            >
              <CalendarDays size={14} /> Mi día
            </button>
            <button
              onClick={() => setView('calendario')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
                view === 'calendario' && 'bg-ink-800 text-gold-400',
              )}
            >
              <CalendarIcon size={14} /> Calendario
            </button>
          </div>

          {view === 'arbol' ? (
            <GoalTreeView
              onEditGoal={(goal) => setGoalDialog({ open: true, goal })}
              onCreateMission={(goalId) => setDialog({ open: true, goalId })}
              onEditMission={(mission) => setDialog({ open: true, mission })}
            />
          ) : view === 'dia' ? (
            <DayView
              onEdit={(mission) => setDialog({ open: true, mission })}
              onCreate={(date) => setDialog({ open: true, date })}
            />
          ) : (
            <CalendarView
              onCreateOnDate={(date) => setDialog({ open: true, date })}
              onEdit={(mission) => setDialog({ open: true, mission })}
            />
          )}
        </>
      )}

      <FirstGoalCelebration
        goal={firstGoal}
        onClose={() => setFirstGoal(null)}
        onCreateMission={() => {
          const goalId = firstGoal?.id
          setFirstGoal(null)
          setDialog({ open: true, goalId })
        }}
      />

      <MissionFormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        defaultGoalId={dialog.goalId}
        defaultDate={dialog.date}
        mission={dialog.mission}
        onSubmit={(input) => (dialog.mission ? updateMission(dialog.mission.id, input) : addMission(input))}
        onDelete={dialog.mission ? () => deleteMission(dialog.mission!.id) : undefined}
      />

      <GoalFormDialog
        open={goalDialog.open}
        onClose={() => setGoalDialog({ open: false })}
        defaultRegionId={goalDialog.goal?.regionId ?? regions[0]?.id}
        goal={goalDialog.goal}
        onSubmit={handleGoalSubmit}
        onDelete={goalDialog.goal ? () => deleteGoal(goalDialog.goal!.id) : undefined}
      />
    </PageContainer>
  )
}
