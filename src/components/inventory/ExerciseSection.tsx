import { useState } from 'react'
import { Plus, Trash2, Pencil, Trophy, CalendarClock } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { todayKey } from '@/lib/calendar'
import { MUSCLE_GROUPS, muscleGroup } from '@/data/muscleGroups'
import { BodyMap } from '@/components/inventory/BodyMap'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ExerciseItem, MuscleGroup } from '@/types'

function bestLog(item: ExerciseItem) {
  return item.logs.reduce<ExerciseItem['logs'][number] | null>(
    (best, log) => (!best || log.weight > best.weight ? log : best),
    null,
  )
}

function lastLog(item: ExerciseItem) {
  // logExerciseSet prepends, so the most recent session is always first.
  return item.logs[0] ?? null
}

export function ExerciseSection() {
  const exerciseItems = useGameStore((s) => s.exerciseItems)
  const addExerciseItem = useGameStore((s) => s.addExerciseItem)
  const updateExerciseItem = useGameStore((s) => s.updateExerciseItem)
  const deleteExerciseItem = useGameStore((s) => s.deleteExerciseItem)
  const logExerciseSet = useGameStore((s) => s.logExerciseSet)

  const [view, setView] = useState<'frente' | 'espalda'>('frente')
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null)
  const [recordMessage, setRecordMessage] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [loggingId, setLoggingId] = useState<string | null>(null)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')

  const counts = exerciseItems.reduce<Partial<Record<MuscleGroup, number>>>((acc, item) => {
    acc[item.muscleGroup] = (acc[item.muscleGroup] ?? 0) + 1
    return acc
  }, {})

  const visibleGroups = MUSCLE_GROUPS.filter((g) => g.view === view)
  const groupItems = selectedGroup ? exerciseItems.filter((i) => i.muscleGroup === selectedGroup) : []

  function selectGroup(group: MuscleGroup) {
    setSelectedGroup(group)
    setEditingId(null)
    setName('')
    setLoggingId(null)
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !selectedGroup) return
    if (editingId) updateExerciseItem(editingId, { name: name.trim(), muscleGroup: selectedGroup })
    else addExerciseItem({ name: name.trim(), muscleGroup: selectedGroup })
    setName('')
    setEditingId(null)
  }

  function startEdit(item: ExerciseItem) {
    setEditingId(item.id)
    setName(item.name)
    setLoggingId(null)
  }

  function startLog(item: ExerciseItem) {
    setLoggingId(item.id)
    setWeight('')
    setReps('')
    setEditingId(null)
  }

  function handleLogSubmit(e: React.FormEvent, item: ExerciseItem) {
    e.preventDefault()
    const parsedWeight = Number(weight)
    const parsedReps = Number(reps)
    if (!parsedWeight || parsedWeight <= 0 || !parsedReps || parsedReps <= 0) return

    const previousBest = bestLog(item)
    logExerciseSet(item.id, { weight: parsedWeight, reps: parsedReps, date: todayKey() })
    if (!previousBest || parsedWeight > previousBest.weight) {
      setRecordMessage(`🏆 ¡Nuevo récord en ${item.name}! ${parsedWeight}kg x ${parsedReps}`)
      setTimeout(() => setRecordMessage(null), 4000)
    }
    setLoggingId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          onClick={() => setView('frente')}
          className={cn(
            'flex-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
            view === 'frente' && 'bg-ink-800 text-gold-400',
          )}
        >
          Frente
        </button>
        <button
          onClick={() => setView('espalda')}
          className={cn(
            'flex-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
            view === 'espalda' && 'bg-ink-800 text-gold-400',
          )}
        >
          Espalda
        </button>
      </div>

      <div className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
        <BodyMap view={view} selected={selectedGroup} counts={counts} onSelect={selectGroup} />

        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {[...visibleGroups, muscleGroup('otros')].map((group) => (
            <button
              key={group.id}
              onClick={() => selectGroup(group.id)}
              className={cn(
                'rounded-full border border-ink-600 px-2.5 py-1 text-[11px] text-ink-300',
                selectedGroup === group.id && 'border-gold-400 bg-gold-500/20 text-gold-400',
              )}
            >
              {group.icon} {group.label} {counts[group.id] ? `(${counts[group.id]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {recordMessage && (
        <p className="rounded-xl border border-gold-400/50 bg-gold-500/10 p-2 text-center text-xs text-gold-400">
          {recordMessage}
        </p>
      )}

      {!selectedGroup && (
        <p className="text-center text-sm text-ink-400">Toca un grupo muscular para ver o agregar tus ejercicios.</p>
      )}

      {selectedGroup && (
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-50">
            {muscleGroup(selectedGroup).icon} {muscleGroup(selectedGroup).label}
          </h2>

          <form onSubmit={handleAddSubmit} className="flex gap-2">
            <Input
              placeholder="Nombre del ejercicio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Plus size={16} />
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingId(null)
                  setName('')
                }}
              >
                Cancelar
              </Button>
            )}
          </form>

          <div className="flex flex-col gap-2">
            {groupItems.length === 0 && (
              <p className="text-xs text-ink-400">Aún no agregas ejercicios para este grupo.</p>
            )}
            {groupItems.map((item) => {
              const best = bestLog(item)
              const last = lastLog(item)
              return (
                <div key={item.id} className="rounded-xl border border-ink-700 bg-ink-900 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-50">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => startEdit(item)} className="text-ink-500 hover:text-gold-400">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteExerciseItem(item.id)} className="text-ink-500 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-3 text-[10px] text-ink-400">
                    {best && (
                      <span className="flex items-center gap-1 text-gold-400">
                        <Trophy size={11} /> Mejor: {best.weight}kg x {best.reps}
                      </span>
                    )}
                    {last && (
                      <span className="flex items-center gap-1">
                        <CalendarClock size={11} /> Último: {last.date} · {last.weight}kg x {last.reps}
                      </span>
                    )}
                    {item.logs.length > 0 && <span>{item.logs.length} sesión(es) registradas</span>}
                  </div>

                  {loggingId === item.id ? (
                    <form onSubmit={(e) => handleLogSubmit(e, item)} className="mt-2 flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="Kg"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-20"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Reps"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        className="w-20"
                      />
                      <Button type="submit" size="sm" className="flex-1">
                        Registrar
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setLoggingId(null)}>
                        Cancelar
                      </Button>
                    </form>
                  ) : (
                    <Button size="sm" className="mt-2 w-full" onClick={() => startLog(item)}>
                      Registrar hoy
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
