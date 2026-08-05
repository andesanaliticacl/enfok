import { useState } from 'react'
import { Plus, Pencil, CalendarCheck, ArrowRight } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { todayKey, diffDays } from '@/lib/calendar'
import { LEAD_TYPES, LEAD_STATES, leadType, leadState, LEAD_STALE_DAYS } from '@/data/leads'
import { formatMoney } from '@/lib/planning/currency'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Lead, LeadState, LeadType } from '@/types'

function emptyForm() {
  return {
    name: '',
    company: '',
    type: 'empresa' as LeadType,
    state: 'nuevo' as LeadState,
    value: '',
    lastContact: todayKey(),
    nextAction: '',
  }
}

/** "hoy", "ayer", "hace 5 días" — más útil que una fecha para saber si se está enfriando. */
function sinceLabel(date: string, today: string): { text: string; stale: boolean } {
  const days = diffDays(date, today)
  if (days <= 0) return { text: 'hoy', stale: false }
  if (days === 1) return { text: 'ayer', stale: false }
  return { text: `hace ${days} días`, stale: days >= LEAD_STALE_DAYS }
}

/**
 * Un mini CRM: siete campos, tarjetas y un botón para marcar que ya contactaste.
 * Lo único que agrega sobre una lista es memoria — te dice cuáles se están
 * enfriando, que es exactamente lo que se te olvida sin ayuda.
 */
export function LeadsSection() {
  const leads = useGameStore((s) => s.leads)
  const addLead = useGameStore((s) => s.addLead)
  const updateLead = useGameStore((s) => s.updateLead)
  const deleteLead = useGameStore((s) => s.deleteLead)
  const touchLead = useGameStore((s) => s.touchLead)

  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [filter, setFilter] = useState<LeadState | 'abiertos' | 'todos'>('abiertos')

  const today = todayKey()

  const openStates = LEAD_STATES.filter((s) => !s.closed).map((s) => s.id)
  const visible = leads.filter((l) => {
    if (filter === 'todos') return true
    if (filter === 'abiertos') return openStates.includes(l.state)
    return l.state === filter
  })

  const needAttention = leads.filter(
    (l) => openStates.includes(l.state) && sinceLabel(l.lastContact, today).stale,
  ).length

  function startCreate() {
    setForm(emptyForm())
    setEditingId(null)
    setCreating(true)
  }

  function startEdit(lead: Lead) {
    setForm({
      name: lead.name,
      company: lead.company ?? '',
      type: lead.type,
      state: lead.state,
      value: lead.value ? String(lead.value) : '',
      lastContact: lead.lastContact,
      nextAction: lead.nextAction ?? '',
    })
    setEditingId(lead.id)
    setCreating(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    const input = {
      name: form.name.trim(),
      company: form.company.trim() || undefined,
      type: form.type,
      state: form.state,
      value: form.value ? Math.max(0, Number(form.value)) : undefined,
      lastContact: form.lastContact || today,
      nextAction: form.nextAction.trim() || undefined,
    }
    if (editingId) updateLead(editingId, input)
    else addLead(input)
    setCreating(false)
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-ink-50">Oportunidades</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
          Un lead no es una venta: es algo que podría serlo si no se te olvida. Anótalo y define la siguiente acción.
        </p>
      </div>

      {/* The one number that matters here: how many are going cold */}
      {needAttention > 0 && (
        <p className="rounded-xl border border-gold-500/40 bg-gold-500/10 px-3 py-2 text-[11px] text-gold-400">
          {needAttention} sin contacto hace más de {LEAD_STALE_DAYS} días.
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {(['abiertos', 'todos'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full border border-ink-600 px-2.5 py-1 text-[10px] text-ink-300',
              filter === f && 'border-gold-400 bg-gold-500/20 text-gold-400',
            )}
          >
            {f === 'abiertos' ? 'Activos' : 'Todos'}
          </button>
        ))}
        {LEAD_STATES.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={cn(
              'rounded-full border border-ink-600 px-2.5 py-1 text-[10px] text-ink-300',
              filter === s.id && 'border-gold-400 bg-gold-500/20 text-gold-400',
            )}
          >
            {s.dot} {s.label}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-center text-xs text-ink-400">
          {leads.length === 0 ? 'Todavía no anotas ninguna oportunidad.' : 'Nada en este estado.'}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {visible.map((lead) => {
          const type = leadType(lead.type)
          const state = leadState(lead.state)
          const since = sinceLabel(lead.lastContact, today)
          return (
            <div
              key={lead.id}
              className="panel-bevel rounded-2xl border bg-ink-900 p-3"
              style={{ borderColor: `${state.color}55` }}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg leading-none">{type.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-50">{lead.name}</p>
                  <p className="truncate text-[10px] text-ink-500">
                    {lead.company ? `${lead.company} · ` : ''}
                    {type.label}
                  </p>
                </div>
                <button onClick={() => startEdit(lead)} className="text-ink-500 hover:text-gold-400">
                  <Pencil size={13} />
                </button>
                <ConfirmDeleteButton onConfirm={() => deleteLead(lead.id)} title="Eliminar oportunidad" />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
                <span className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${state.color}22`, color: state.color }}>
                  {state.dot} {state.label}
                </span>
                {/* Only render a value when there is one — no "undefined" rows */}
                {lead.value !== undefined && (
                  <span className="text-ink-300">{formatMoney(lead.value, 'CLP')}</span>
                )}
                <span className={cn(since.stale ? 'text-gold-400' : 'text-ink-500')}>Contacto {since.text}</span>
              </div>

              {lead.nextAction && (
                <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug text-ink-200">
                  <ArrowRight size={11} className="mt-0.5 shrink-0 text-ink-500" />
                  {lead.nextAction}
                </p>
              )}

              {!state.closed && since.text !== 'hoy' && (
                <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => touchLead(lead.id)}>
                  <CalendarCheck size={13} /> Contacté hoy
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {creating ? (
        <form onSubmit={handleSubmit} className="panel-bevel flex flex-col gap-2 rounded-2xl border border-gold-400/50 bg-ink-900/85 p-4">
          <Input
            placeholder="Nombre del contacto o proyecto"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoFocus
          />
          <Input
            placeholder="Empresa (opcional)"
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
          />

          <div className="flex flex-wrap gap-1.5">
            {LEAD_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t.id }))}
                className={cn(
                  'rounded-full border border-ink-600 px-2 py-1 text-[10px] text-ink-300',
                  form.type === t.id && 'border-gold-400 bg-gold-500/20 text-gold-400',
                )}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="text-[10px] text-ink-400">
              Estado
              <Select
                className="mt-0.5"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value as LeadState }))}
              >
                {LEAD_STATES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.dot} {s.label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="text-[10px] text-ink-400">
              Valor estimado (opcional)
              <Input
                type="number"
                min="0"
                placeholder="$"
                className="mt-0.5"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              />
            </label>
          </div>

          <label className="text-[10px] text-ink-400">
            Último contacto
            <Input
              type="date"
              className="mt-0.5"
              value={form.lastContact}
              onChange={(e) => setForm((f) => ({ ...f, lastContact: e.target.value }))}
            />
          </label>

          <Input
            placeholder="Próxima acción (ej. enviar propuesta)"
            value={form.nextAction}
            onChange={(e) => setForm((f) => ({ ...f, nextAction: e.target.value }))}
          />

          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1" disabled={!form.name.trim()}>
              {editingId ? 'Guardar cambios' : 'Agregar oportunidad'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={startCreate}>
          <Plus size={15} /> Nueva oportunidad
        </Button>
      )}
    </div>
  )
}
