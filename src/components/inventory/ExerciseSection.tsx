import { useState } from 'react'
import { Plus, Trash2, Pencil, Trophy, CalendarClock, Check, X, Medal, XCircle } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { todayKey } from '@/lib/calendar'
import { MUSCLE_GROUPS, muscleGroup } from '@/data/muscleGroups'
import { WEEKDAYS, todayWeekday } from '@/data/weekdays'
import { ExerciseAvatarMap } from '@/components/inventory/ExerciseAvatarMap'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ExerciseItem, MuscleGroup, Weekday } from '@/types'

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

const PODIUM_MEDAL = ['🥇', '🥈', '🥉']

export function ExerciseSection() {
  const exerciseItems = useGameStore((s) => s.exerciseItems)
  const addExerciseItem = useGameStore((s) => s.addExerciseItem)
  const updateExerciseItem = useGameStore((s) => s.updateExerciseItem)
  const deleteExerciseItem = useGameStore((s) => s.deleteExerciseItem)
  const logExerciseSet = useGameStore((s) => s.logExerciseSet)
  const deleteExerciseLog = useGameStore((s) => s.deleteExerciseLog)
  const trainingDayNames = useGameStore((s) => s.trainingDayNames)
  const setTrainingDayName = useGameStore((s) => s.setTrainingDayName)

  const [browseBy, setBrowseBy] = useState<'musculo' | 'dia' | 'ranking'>('musculo')
  const [view, setView] = useState<'frente' | 'espalda'>('frente')
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null)
  const [selectedDay, setSelectedDay] = useState<Weekday>(todayWeekday())
  const [recordMessage, setRecordMessage] = useState<string | null>(null)
  const [renamingDay, setRenamingDay] = useState<Weekday | null>(null)
  const [dayNameDraft, setDayNameDraft] = useState('')

  const [name, setName] = useState('')
  const [formGroup, setFormGroup] = useState<MuscleGroup>('otros')
  const [formDays, setFormDays] = useState<Weekday[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const [loggingId, setLoggingId] = useState<string | null>(null)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')

  const counts = exerciseItems.reduce<Partial<Record<MuscleGroup, number>>>((acc, item) => {
    acc[item.muscleGroup] = (acc[item.muscleGroup] ?? 0) + 1
    return acc
  }, {})

  const groupItems = selectedGroup ? exerciseItems.filter((i) => i.muscleGroup === selectedGroup) : []
  const dayItems = exerciseItems.filter((i) => i.trainingDays.includes(selectedDay))

  const today = todayWeekday()

  function dayLabel(day: Weekday): string {
    const def = WEEKDAYS.find((d) => d.id === day)!
    return trainingDayNames[day] ?? `Grupo ${def.group}`
  }

  function resetForm() {
    setEditingId(null)
    setName('')
    setFormDays([])
    setLoggingId(null)
  }

  function selectMuscleGroup(group: MuscleGroup) {
    setSelectedGroup(group)
    setFormGroup(group)
    resetForm()
  }

  function toggleFormDay(day: Weekday) {
    setFormDays((days) => (days.includes(day) ? days.filter((d) => d !== day) : [...days, day]))
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const input = { name: name.trim(), muscleGroup: formGroup, trainingDays: formDays }
    if (editingId) updateExerciseItem(editingId, input)
    else addExerciseItem(input)
    resetForm()
  }

  function startEdit(item: ExerciseItem) {
    setEditingId(item.id)
    setName(item.name)
    setFormGroup(item.muscleGroup)
    setFormDays(item.trainingDays)
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

  function startRenameDay(day: Weekday) {
    setRenamingDay(day)
    setDayNameDraft(trainingDayNames[day] ?? '')
  }

  function commitRenameDay() {
    if (renamingDay && dayNameDraft.trim()) setTrainingDayName(renamingDay, dayNameDraft.trim())
    setRenamingDay(null)
  }

  // Renaming only applies once a muscle-group context already fixes it — the
  // add-exercise form no longer re-asks for the group when it's already known
  // from tapping the body map. It only shows when there's no such context
  // (e.g. adding straight from the "Por día" tab).
  function renderExerciseForm() {
    return (
      <form onSubmit={handleAddSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
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
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>

        {!selectedGroup && (
          <div className="flex flex-wrap gap-1.5">
            {MUSCLE_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setFormGroup(g.id)}
                className={cn(
                  'rounded-full border border-ink-600 px-2 py-0.5 text-[10px] text-ink-300',
                  formGroup === g.id && 'border-gold-400 bg-gold-500/20 text-gold-400',
                )}
              >
                {g.icon} {g.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => toggleFormDay(d.id)}
              className={cn(
                'rounded-full border border-ink-600 px-2 py-0.5 text-[10px] text-ink-300',
                formDays.includes(d.id) && 'border-emerald-400 bg-emerald-500/20 text-emerald-300',
              )}
            >
              {d.short}
            </button>
          ))}
        </div>
      </form>
    )
  }

  function renderExerciseRow(item: ExerciseItem, opts?: { showGroup?: boolean }) {
    const best = bestLog(item)
    const last = lastLog(item)
    return (
      <div key={item.id} className="rounded-xl border border-ink-700 bg-ink-900 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-50">
            {opts?.showGroup && <span className="mr-1">{muscleGroup(item.muscleGroup).icon}</span>}
            {item.name}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => startEdit(item)} className="text-ink-500 hover:text-gold-400">
              <Pencil size={14} />
            </button>
            <button onClick={() => deleteExerciseItem(item.id)} className="text-ink-500 hover:text-red-400">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {item.trainingDays.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {item.trainingDays.map((d) => (
              <span key={d} className="rounded-full bg-ink-800 px-1.5 py-0.5 text-[9px] text-emerald-300">
                {WEEKDAYS.find((w) => w.id === d)?.short}
              </span>
            ))}
          </div>
        )}

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
  }

  // All logged sets across every exercise, for the personal-records ranking.
  const allLogs = exerciseItems
    .flatMap((item) => item.logs.map((log) => ({ ...log, exerciseName: item.name, exerciseId: item.id })))
    .sort((a, b) => b.weight - a.weight)
  const podium = allLogs.slice(0, 3)
  const rest = allLogs.slice(3)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          onClick={() => setBrowseBy('musculo')}
          className={cn(
            'flex-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
            browseBy === 'musculo' && 'bg-ink-800 text-gold-400',
          )}
        >
          Por músculo
        </button>
        <button
          onClick={() => setBrowseBy('dia')}
          className={cn(
            'flex-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
            browseBy === 'dia' && 'bg-ink-800 text-gold-400',
          )}
        >
          Por día
        </button>
        <button
          onClick={() => setBrowseBy('ranking')}
          className={cn(
            'flex-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
            browseBy === 'ranking' && 'bg-ink-800 text-gold-400',
          )}
        >
          Ranking
        </button>
      </div>

      {recordMessage && (
        <p className="rounded-xl border border-gold-400/50 bg-gold-500/10 p-2 text-center text-xs text-gold-400">
          {recordMessage}
        </p>
      )}

      {browseBy === 'musculo' ? (
        <>
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
            <ExerciseAvatarMap view={view} selected={selectedGroup} counts={counts} onSelect={selectMuscleGroup} />
          </div>

          {!selectedGroup && (
            <p className="text-center text-sm text-ink-400">Toca un grupo muscular en tu personaje para ver o agregar tus ejercicios.</p>
          )}

          {selectedGroup && (
            <div className="flex flex-col gap-3">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-50">
                {muscleGroup(selectedGroup).icon} {muscleGroup(selectedGroup).label}
              </h2>
              {renderExerciseForm()}
              <div className="flex flex-col gap-2">
                {groupItems.length === 0 && (
                  <p className="text-xs text-ink-400">Aún no agregas ejercicios para este grupo.</p>
                )}
                {groupItems.map((item) => renderExerciseRow(item))}
              </div>
            </div>
          )}
        </>
      ) : browseBy === 'dia' ? (
        <>
          <div className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
            <div className="flex flex-wrap justify-center gap-1.5">
              {WEEKDAYS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDay(d.id)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-xl border border-ink-600 px-3 py-2 text-[11px] text-ink-300',
                    selectedDay === d.id && 'border-gold-400 bg-gold-500/20 text-gold-400',
                    d.id === today && selectedDay !== d.id && 'border-emerald-500 text-emerald-300',
                  )}
                >
                  <span className="font-medium">{d.short}</span>
                  <span className="max-w-[64px] truncate text-[9px] text-ink-500">{dayLabel(d.id)}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-[10px] text-ink-500">
              Hoy es {WEEKDAYS.find((d) => d.id === today)?.label} · {dayLabel(today)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {renamingDay === selectedDay ? (
                <div className="flex flex-1 items-center gap-1.5">
                  <Input
                    autoFocus
                    value={dayNameDraft}
                    onChange={(e) => setDayNameDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && commitRenameDay()}
                    placeholder="Ej. Pecho"
                    className="h-8 flex-1 text-sm"
                  />
                  <button onClick={commitRenameDay} className="text-emerald-400 hover:text-emerald-300">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setRenamingDay(null)} className="text-ink-500 hover:text-ink-300">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-sm font-semibold text-ink-50">
                    {WEEKDAYS.find((d) => d.id === selectedDay)?.label} · {dayLabel(selectedDay)}
                  </h2>
                  <button onClick={() => startRenameDay(selectedDay)} className="text-ink-500 hover:text-gold-400">
                    <Pencil size={13} />
                  </button>
                </>
              )}
            </div>
            {editingId && renderExerciseForm()}
            <div className="flex flex-col gap-2">
              {dayItems.length === 0 && (
                <p className="text-xs text-ink-400">
                  Aún no asignas ejercicios a este día. Ve a "Por músculo", agrega o edita un ejercicio y marca este día.
                </p>
              )}
              {dayItems.map((item) => renderExerciseRow(item, { showGroup: true }))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          {allLogs.length === 0 ? (
            <p className="text-center text-sm text-ink-400">Registra tu primer ejercicio para empezar tu ranking de marcas.</p>
          ) : (
            <>
              {/* Podium: your 3 heaviest lifts ever, across every exercise */}
              <div className="flex items-end justify-center gap-3">
                {[1, 0, 2].map((podiumIdx) => {
                  const entry = podium[podiumIdx]
                  if (!entry) return <div key={podiumIdx} className="w-20" />
                  const height = podiumIdx === 0 ? 'h-24' : podiumIdx === 1 ? 'h-16' : 'h-12'
                  return (
                    <div key={entry.id} className="group relative flex w-20 flex-col items-center gap-1">
                      <button
                        onClick={() => deleteExerciseLog(entry.exerciseId, entry.id)}
                        title="Quitar del ranking"
                        className="absolute -top-1 right-1 text-ink-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                      >
                        <XCircle size={14} />
                      </button>
                      <span className="text-2xl">{PODIUM_MEDAL[podiumIdx]}</span>
                      <p className="truncate text-[10px] font-medium text-ink-100">{entry.exerciseName}</p>
                      <p className="font-pixel text-[10px] text-gold-400">{entry.weight}kg</p>
                      <div className={cn('flex w-full items-end justify-center rounded-t-lg bg-ink-800', height)}>
                        <Medal size={16} className="mb-1.5 text-ink-500" />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Full record list, heaviest to lightest */}
              <div className="flex flex-col gap-1.5">
                {rest.map((entry, i) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-lg border border-ink-800 bg-ink-900/60 px-3 py-1.5">
                    <span className="flex items-center gap-2 text-xs text-ink-200">
                      <span className="w-5 text-ink-500">{i + 4}.</span>
                      {entry.exerciseName}
                    </span>
                    <span className="flex items-center gap-2 text-[11px] text-ink-400">
                      <span className="font-pixel text-[10px] text-gold-400">{entry.weight}kg</span>
                      x{entry.reps} · {entry.date}
                      <button
                        onClick={() => deleteExerciseLog(entry.exerciseId, entry.id)}
                        title="Quitar del ranking"
                        className="text-ink-600 hover:text-red-400"
                      >
                        <XCircle size={13} />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
