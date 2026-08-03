import { useState } from 'react'
import { Plus, ChevronUp, ChevronDown, Sparkles, RotateCcw, UserRound, UserPlus, Users, Pencil, Target, Zap } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { SYSTEM_TEMPLATES, SYSTEM_COLORS, SYSTEM_ICONS } from '@/data/systemTemplates'
import { SystemFlow, initialsOf } from '@/components/systems/SystemFlow'
import { SystemHealthPanel } from '@/components/systems/SystemHealthPanel'
import { DEPENDENCIES } from '@/lib/systems/autonomy'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { LifeSystem, Person, StepDependency } from '@/types'

export function SystemsSection() {
  const systems = useGameStore((s) => s.systems)
  const addSystem = useGameStore((s) => s.addSystem)

  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(SYSTEM_ICONS[0])
  const [color, setColor] = useState(SYSTEM_COLORS[0])

  function handleCreateBlank() {
    if (!name.trim()) return
    addSystem({ name: name.trim(), icon, color, steps: [], loops: false })
    setName('')
    setIcon(SYSTEM_ICONS[0])
    setColor(SYSTEM_COLORS[0])
    setCreating(false)
  }

  const usedTemplateNames = new Set(systems.map((s) => s.name))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-ink-50">Tus sistemas</h2>
        {/* The whole screen exists to make this question unavoidable */}
        <p className="mt-1 font-pixel text-[10px] leading-relaxed text-gold-400">
          ¿Puede funcionar sin mí?
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-400">
          Un sistema tiene cinco partes: <strong className="text-ink-300">objetivo</strong>,{' '}
          <strong className="text-ink-300">proceso</strong>, <strong className="text-ink-300">responsables</strong>,{' '}
          <strong className="text-ink-300">métricas</strong> y <strong className="text-ink-300">mejora continua</strong>.
          Aquí no ganas por trabajar más, sino por lograr que cada paso dependa menos de ti.
        </p>
      </div>

      {systems.map((system) => (
        <SystemCard key={system.id} system={system} />
      ))}

      {systems.length === 0 && (
        <p className="text-center text-xs text-ink-400">
          Todavía no tienes sistemas. Empieza con una plantilla o crea el tuyo.
        </p>
      )}

      {creating ? (
        <div className="panel-bevel flex flex-col gap-2 rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
          <Input placeholder="Nombre del sistema" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <div className="flex flex-wrap gap-1.5">
            {SYSTEM_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={cn(
                  'h-8 w-8 rounded-lg border border-ink-600 text-base',
                  icon === i && 'border-gold-400 bg-gold-500/20',
                )}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SYSTEM_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
                className={cn('h-7 w-7 rounded-full border-2', color === c ? 'border-ink-50' : 'border-transparent')}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleCreateBlank} disabled={!name.trim()}>
              Crear sistema
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setCreating(true)}>
          <Plus size={15} /> Nuevo sistema
        </Button>
      )}

      <TeamSection />

      <CollapsibleSection title="Plantillas" icon={<Sparkles size={14} />}>
        <div className="flex flex-col gap-2">
          {SYSTEM_TEMPLATES.map((template) => (
            <div key={template.id} className="rounded-xl border border-ink-700 bg-ink-900 p-3">
              <div className="flex items-start gap-2">
                <span className="text-lg">{template.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-ink-50">{template.name}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-ink-500">{template.summary}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={usedTemplateNames.has(template.name)}
                  onClick={() =>
                    addSystem({
                      name: template.name,
                      icon: template.icon,
                      color: template.color,
                      steps: template.steps,
                      loops: template.loops,
                      objective: template.objective,
                      produces: template.produces,
                    })
                  }
                >
                  {usedTemplateNames.has(template.name) ? 'Añadido' : 'Usar'}
                </Button>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-ink-400">{template.steps.join(' → ')}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  )
}

function SystemCard({ system }: { system: LifeSystem }) {
  const updateSystem = useGameStore((s) => s.updateSystem)
  const deleteSystem = useGameStore((s) => s.deleteSystem)
  const addSystemStep = useGameStore((s) => s.addSystemStep)
  const updateSystemStep = useGameStore((s) => s.updateSystemStep)
  const deleteSystemStep = useGameStore((s) => s.deleteSystemStep)
  const moveSystemStep = useGameStore((s) => s.moveSystemStep)

  const people = useGameStore((s) => s.people)
  const addPerson = useGameStore((s) => s.addPerson)
  const updatePerson = useGameStore((s) => s.updatePerson)

  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [stepLabel, setStepLabel] = useState('')
  const [stepNote, setStepNote] = useState('')
  const [stepPersonId, setStepPersonId] = useState<string | undefined>(undefined)
  const [stepRole, setStepRole] = useState('')
  const [stepDependency, setStepDependency] = useState<StepDependency>('mia')
  const [stepAutomated, setStepAutomated] = useState(false)
  const [newPersonName, setNewPersonName] = useState('')
  const [newStep, setNewStep] = useState('')
  const [editingSystem, setEditingSystem] = useState(false)
  const [draftObjective, setDraftObjective] = useState('')
  const [draftProduces, setDraftProduces] = useState('')

  const editingStep = system.steps.find((s) => s.id === editingStepId)
  const ownedCount = system.steps.filter((s) => s.personId).length
  const selectedPerson = people.find((p) => p.id === stepPersonId)

  function startEditStep(stepId: string) {
    const step = system.steps.find((s) => s.id === stepId)
    if (!step) return
    setEditingStepId(stepId)
    setStepLabel(step.label)
    setStepNote(step.note ?? '')
    setStepPersonId(step.personId)
    setStepRole(step.role ?? '')
    setStepDependency(step.dependency)
    setStepAutomated(!!step.automated)
    setNewPersonName('')
  }

  /** Creates the person right here and assigns them — no trip to a separate screen. */
  function handleCreatePerson() {
    if (!newPersonName.trim()) return
    const id = addPerson({ name: newPersonName.trim(), roles: [] })
    setStepPersonId(id)
    setNewPersonName('')
  }

  function saveStep() {
    if (!editingStepId || !stepLabel.trim()) return
    const role = stepRole.trim()
    // A role typed here joins that person's roster, so it's reusable next time.
    if (selectedPerson && role && !selectedPerson.roles.includes(role)) {
      updatePerson(selectedPerson.id, { name: selectedPerson.name, roles: [...selectedPerson.roles, role] })
    }
    updateSystemStep(system.id, editingStepId, {
      label: stepLabel.trim(),
      note: stepNote.trim() || undefined,
      personId: stepPersonId,
      role: role || undefined,
      dependency: stepDependency,
      automated: stepAutomated,
    })
    setEditingStepId(null)
  }

  function startEditSystem() {
    setEditingSystem(true)
    setDraftObjective(system.objective ?? '')
    setDraftProduces(system.produces.join(', '))
  }

  function saveSystemMeta() {
    updateSystem(system.id, {
      name: system.name,
      icon: system.icon,
      color: system.color,
      loops: system.loops,
      objective: draftObjective.trim() || undefined,
      produces: draftProduces.split(',').map((p) => p.trim()).filter(Boolean).slice(0, 4),
    })
    setEditingSystem(false)
  }

  function handleAddStep(e: React.FormEvent) {
    e.preventDefault()
    if (!newStep.trim()) return
    addSystemStep(system.id, newStep.trim())
    setNewStep('')
  }

  return (
    <div
      className="panel-bevel rounded-2xl border bg-ink-900/85 p-4"
      style={{ borderColor: `${system.color}55` }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">{system.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-50">{system.name}</p>
          <p className="text-[10px] text-ink-500">
            {system.steps.length} paso(s)
            {system.steps.length > 0 && ` · ${ownedCount}/${system.steps.length} con encargado`}
          </p>
        </div>
        <button
          onClick={() => updateSystem(system.id, { ...system, loops: !system.loops })}
          title={system.loops ? 'El sistema se retroalimenta' : 'Marcar como ciclo'}
          className={cn(
            'flex items-center gap-1 rounded-full border px-2 py-1 text-[10px]',
            system.loops ? 'border-gold-400 text-gold-400' : 'border-ink-600 text-ink-400',
          )}
        >
          <RotateCcw size={11} /> Ciclo
        </button>
        <button onClick={startEditSystem} title="Objetivo y activos" className="text-ink-500 hover:text-gold-400">
          <Target size={14} />
        </button>
        <ConfirmDeleteButton onConfirm={() => deleteSystem(system.id)} title="Eliminar sistema" />
      </div>

      {editingSystem ? (
        <div className="mb-3 flex flex-col gap-2 rounded-xl border border-gold-400/50 bg-ink-950/60 p-3">
          <p className="text-[10px] uppercase tracking-wide text-gold-400">¿Qué persigue este sistema?</p>
          <Input
            placeholder="Ej: Publicar cada semana sin depender de mí"
            value={draftObjective}
            onChange={(e) => setDraftObjective(e.target.value)}
          />
          <Input
            placeholder="Produce: Confianza, Clientes, Dinero (máx. 4)"
            value={draftProduces}
            onChange={(e) => setDraftProduces(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveSystemMeta}>
              Guardar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingSystem(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <SystemHealthPanel system={system} />
        </div>
      )}

      <div className="overflow-x-auto">
        <SystemFlow system={system} activeStepId={editingStepId} onStepClick={startEditStep} />
      </div>

      {editingStep && (
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-gold-400/50 bg-ink-950/60 p-3">
          <p className="text-[10px] uppercase tracking-wide text-gold-400">Editando paso</p>
          <Input placeholder="Nombre del paso" value={stepLabel} onChange={(e) => setStepLabel(e.target.value)} />
          <Input placeholder="Detalle (opcional)" value={stepNote} onChange={(e) => setStepNote(e.target.value)} />

          {/* The question the whole screen exists to answer, asked per step */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] uppercase tracking-wide text-ink-400">¿Cuánto depende de ti?</p>
            <div className="flex flex-wrap gap-1.5">
              {DEPENDENCIES.map((dep) => (
                <button
                  key={dep.key}
                  type="button"
                  onClick={() => setStepDependency(dep.key)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border border-ink-600 px-2 py-1 text-[10px] text-ink-300',
                    stepDependency === dep.key && 'bg-ink-800 text-ink-50',
                  )}
                  style={stepDependency === dep.key ? { borderColor: dep.color } : undefined}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dep.color }} />
                  {dep.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStepAutomated((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 self-start rounded-full border border-ink-600 px-2 py-1 text-[10px] text-ink-300',
                stepAutomated && 'border-gold-400 bg-gold-500/20 text-gold-400',
              )}
            >
              <Zap size={11} /> Lo hace una herramienta, no una persona
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] uppercase tracking-wide text-ink-400">Encargado</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setStepPersonId(undefined)}
                className={cn(
                  'rounded-full border border-ink-600 px-2 py-1 text-[10px] text-ink-300',
                  !stepPersonId && 'border-gold-400 bg-gold-500/20 text-gold-400',
                )}
              >
                Sin asignar
              </button>
              {people.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setStepPersonId(person.id)}
                  className={cn(
                    'rounded-full border border-ink-600 px-2 py-1 text-[10px] text-ink-300',
                    stepPersonId === person.id && 'border-gold-400 bg-gold-500/20 text-gold-400',
                  )}
                >
                  {person.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nueva persona..."
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleCreatePerson()
                  }
                }}
                className="flex-1"
              />
              <Button type="button" size="icon" variant="outline" onClick={handleCreatePerson} disabled={!newPersonName.trim()}>
                <UserPlus size={15} />
              </Button>
            </div>
          </div>

          {selectedPerson && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] uppercase tracking-wide text-ink-400">
                Rol de {selectedPerson.name} en este paso
              </p>
              {selectedPerson.roles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedPerson.roles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setStepRole(role)}
                      className={cn(
                        'rounded-full border border-ink-600 px-2 py-1 text-[10px] text-ink-300',
                        stepRole === role && 'border-gold-400 bg-gold-500/20 text-gold-400',
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
              <Input
                placeholder="Rol (se guarda para reutilizarlo)"
                value={stepRole}
                onChange={(e) => setStepRole(e.target.value)}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={saveStep} disabled={!stepLabel.trim()}>
              Guardar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingStepId(null)}>
              Cancelar
            </Button>
            <span className="ml-auto flex items-center gap-1">
              <button
                onClick={() => moveSystemStep(system.id, editingStep.id, -1)}
                title="Mover antes"
                className="rounded-lg border border-ink-600 p-1.5 text-ink-300 hover:text-gold-400"
              >
                <ChevronUp size={13} />
              </button>
              <button
                onClick={() => moveSystemStep(system.id, editingStep.id, 1)}
                title="Mover después"
                className="rounded-lg border border-ink-600 p-1.5 text-ink-300 hover:text-gold-400"
              >
                <ChevronDown size={13} />
              </button>
              <ConfirmDeleteButton
                onConfirm={() => {
                  deleteSystemStep(system.id, editingStep.id)
                  setEditingStepId(null)
                }}
                title="Eliminar paso"
              />
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleAddStep} className="mt-3 flex gap-2">
        <Input placeholder="Agregar paso..." value={newStep} onChange={(e) => setNewStep(e.target.value)} className="flex-1" />
        <Button type="submit" size="icon" disabled={!newStep.trim()}>
          <Plus size={16} />
        </Button>
      </form>

      {system.steps.length > 0 && ownedCount < system.steps.length && (
        <p className="mt-2 flex items-center gap-1 text-[10px] text-ink-500">
          <UserRound size={11} /> Toca un paso para asignarle encargado y rol.
        </p>
      )}
    </div>
  )
}

/** The roster behind every system: who exists and which roles they can play. */
function TeamSection() {
  const people = useGameStore((s) => s.people)
  const systems = useGameStore((s) => s.systems)
  const addPerson = useGameStore((s) => s.addPerson)
  const updatePerson = useGameStore((s) => s.updatePerson)
  const deletePerson = useGameStore((s) => s.deletePerson)

  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftRoles, setDraftRoles] = useState('')

  /** How many steps across every system this person is responsible for. */
  function stepCount(personId: string) {
    return systems.reduce((total, s) => total + s.steps.filter((step) => step.personId === personId).length, 0)
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addPerson({ name: name.trim(), roles: [] })
    setName('')
  }

  function startEdit(person: Person) {
    setEditingId(person.id)
    setDraftName(person.name)
    setDraftRoles(person.roles.join(', '))
  }

  function saveEdit() {
    if (!editingId || !draftName.trim()) return
    updatePerson(editingId, {
      name: draftName.trim(),
      // Comma-separated is the fastest way to type "Editor, Comercial" on a phone.
      roles: draftRoles.split(',').map((r) => r.trim()).filter(Boolean),
    })
    setEditingId(null)
  }

  return (
    <CollapsibleSection
      title="Equipo"
      icon={<Users size={14} />}
      badge={<span className="text-[10px] text-ink-500">{people.length}</span>}
    >
      <div className="flex flex-col gap-2">
        <p className="text-[11px] leading-relaxed text-ink-400">
          Las personas se comparten entre todos tus sistemas. Cada una puede tener varios roles y cumplir uno distinto
          en cada paso.
        </p>

        {people.length === 0 && (
          <p className="text-center text-[11px] text-ink-500">Todavía no agregas a nadie a tu equipo.</p>
        )}

        {people.map((person) =>
          editingId === person.id ? (
            <div key={person.id} className="flex flex-col gap-2 rounded-xl border border-gold-400/50 bg-ink-950/60 p-3">
              <Input placeholder="Nombre" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
              <Input
                placeholder="Roles separados por coma (Editor, Comercial)"
                value={draftRoles}
                onChange={(e) => setDraftRoles(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdit} disabled={!draftName.trim()}>
                  Guardar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div key={person.id} className="flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-900 p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-700 text-[9px] font-bold text-ink-100">
                {initialsOf(person.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink-50">{person.name}</p>
                <p className="truncate text-[10px] text-ink-500">
                  {person.roles.length > 0 ? person.roles.join(' · ') : 'Sin roles todavía'}
                  {stepCount(person.id) > 0 && ` — ${stepCount(person.id)} paso(s)`}
                </p>
              </div>
              <button onClick={() => startEdit(person)} className="text-ink-500 hover:text-gold-400">
                <Pencil size={13} />
              </button>
              <ConfirmDeleteButton onConfirm={() => deletePerson(person.id)} title="Quitar del equipo" />
            </div>
          ),
        )}

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input placeholder="Nombre de la persona" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
          <Button type="submit" size="icon" disabled={!name.trim()}>
            <UserPlus size={16} />
          </Button>
        </form>
      </div>
    </CollapsibleSection>
  )
}
