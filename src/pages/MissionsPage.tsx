import { useState } from 'react'
import { List, Calendar as CalendarIcon, GitBranch, Plus } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { MissionsListView } from '@/components/planning/MissionsListView'
import { TodayHeader } from '@/components/planning/TodayHeader'
import { CalendarView } from '@/components/planning/CalendarView'
import { GoalTreeView } from '@/components/planning/GoalTreeView'
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

  const [view, setView] = useState<'lista' | 'calendario' | 'arbol'>('lista')
  const [dialog, setDialog] = useState<{ open: boolean; mission?: Mission; date?: string; goalId?: string }>({
    open: false,
  })
  const [goalDialog, setGoalDialog] = useState<{ open: boolean; goal?: Goal }>({ open: false })

  function handlePrimaryAdd() {
    if (view === 'arbol') setGoalDialog({ open: true })
    else setDialog({ open: true })
  }

  return (
    <PageContainer>
      <XpToast />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-pixel text-lg text-gold-400">Misiones</h1>
        <Button size="icon" onClick={handlePrimaryAdd} title={view === 'arbol' ? 'Nueva meta' : 'Nueva misión'}>
          <Plus size={18} />
        </Button>
      </div>

      <TodayHeader />

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setView('lista')}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
            view === 'lista' && 'bg-ink-800 text-gold-400',
          )}
        >
          <List size={14} /> Lista
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
        <button
          onClick={() => setView('arbol')}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
            view === 'arbol' && 'bg-ink-800 text-gold-400',
          )}
        >
          <GitBranch size={14} /> Árbol
        </button>
      </div>

      {view === 'lista' ? (
        <MissionsListView onEdit={(mission) => setDialog({ open: true, mission })} />
      ) : view === 'calendario' ? (
        <CalendarView
          onCreateOnDate={(date) => setDialog({ open: true, date })}
          onEdit={(mission) => setDialog({ open: true, mission })}
        />
      ) : (
        <GoalTreeView
          onEditGoal={(goal) => setGoalDialog({ open: true, goal })}
          onCreateMission={(goalId) => setDialog({ open: true, goalId })}
          onEditMission={(mission) => setDialog({ open: true, mission })}
        />
      )}

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
        onSubmit={(input) => (goalDialog.goal ? updateGoal(goalDialog.goal.id, input) : addGoal(input))}
        onDelete={goalDialog.goal ? () => deleteGoal(goalDialog.goal!.id) : undefined}
      />
    </PageContainer>
  )
}
