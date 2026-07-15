import { useState } from 'react'
import { List, Calendar as CalendarIcon, Plus } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { MissionsListView } from '@/components/planning/MissionsListView'
import { CalendarView } from '@/components/planning/CalendarView'
import { XpToast } from '@/components/missions/XpToast'
import { MissionFormDialog } from '@/components/planning/MissionFormDialog'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/PageContainer'
import { cn } from '@/lib/utils'
import type { Mission } from '@/types'

export function MissionsPage() {
  const addMission = useGameStore((s) => s.addMission)
  const updateMission = useGameStore((s) => s.updateMission)
  const deleteMission = useGameStore((s) => s.deleteMission)

  const [view, setView] = useState<'lista' | 'calendario'>('lista')
  const [dialog, setDialog] = useState<{ open: boolean; mission?: Mission; date?: string }>({ open: false })

  return (
    <PageContainer>
      <XpToast />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-pixel text-lg text-gold-400">Misiones</h1>
        <Button size="icon" onClick={() => setDialog({ open: true })}>
          <Plus size={18} />
        </Button>
      </div>

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
      </div>

      {view === 'lista' ? (
        <MissionsListView onEdit={(mission) => setDialog({ open: true, mission })} />
      ) : (
        <CalendarView
          onCreateOnDate={(date) => setDialog({ open: true, date })}
          onEdit={(mission) => setDialog({ open: true, mission })}
        />
      )}

      <MissionFormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        defaultDate={dialog.date}
        mission={dialog.mission}
        onSubmit={(input) => (dialog.mission ? updateMission(dialog.mission.id, input) : addMission(input))}
        onDelete={dialog.mission ? () => deleteMission(dialog.mission!.id) : undefined}
      />
    </PageContainer>
  )
}
