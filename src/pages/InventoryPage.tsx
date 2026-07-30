import { useState } from 'react'
import { Wallet, ShoppingCart, Dumbbell, Plus, Trash2, Pencil, TrendingUp, TrendingDown, Landmark } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { todayKey } from '@/lib/calendar'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FinanceBarChart } from '@/components/inventory/FinanceBarChart'
import { cn } from '@/lib/utils'
import type { FinanceEntryType } from '@/types'

type Tab = 'finanzas' | 'supermercado' | 'ejercicios'

const TABS: { id: Tab; label: string; icon: typeof Wallet }[] = [
  { id: 'finanzas', label: 'Finanzas', icon: Wallet },
  { id: 'supermercado', label: 'Supermercado', icon: ShoppingCart },
  { id: 'ejercicios', label: 'Ejercicios', icon: Dumbbell },
]

export function InventoryPage() {
  const [tab, setTab] = useState<Tab>('finanzas')

  return (
    <PageContainer>
      <h1 className="mb-4 font-pixel text-lg text-gold-400">Inventario</h1>

      <div className="mb-6 flex gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
              tab === id && 'bg-ink-800 text-gold-400',
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'finanzas' && <FinanceSection />}
      {tab === 'supermercado' && <GrocerySection />}
      {tab === 'ejercicios' && <ExerciseSection />}
    </PageContainer>
  )
}

function FinanceSection() {
  const financeEntries = useGameStore((s) => s.financeEntries)
  const addFinanceEntry = useGameStore((s) => s.addFinanceEntry)
  const updateFinanceEntry = useGameStore((s) => s.updateFinanceEntry)
  const deleteFinanceEntry = useGameStore((s) => s.deleteFinanceEntry)
  const incomeSources = useGameStore((s) => s.incomeSources)
  const addIncomeSource = useGameStore((s) => s.addIncomeSource)
  const updateIncomeSource = useGameStore((s) => s.updateIncomeSource)
  const deleteIncomeSource = useGameStore((s) => s.deleteIncomeSource)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [type, setType] = useState<FinanceEntryType>('gasto')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const [sourceEditingId, setSourceEditingId] = useState<string | null>(null)
  const [sourceName, setSourceName] = useState('')
  const [sourceAmount, setSourceAmount] = useState('')

  const fixedIncome = incomeSources.reduce((sum, s) => sum + s.amount, 0)
  const entriesIncome = financeEntries.filter((e) => e.type === 'ingreso').reduce((sum, e) => sum + e.amount, 0)
  const entriesExpense = financeEntries.filter((e) => e.type === 'gasto').reduce((sum, e) => sum + e.amount, 0)
  const totalIncome = fixedIncome + entriesIncome
  const balance = totalIncome - entriesExpense

  function resetEntryForm() {
    setEditingId(null)
    setType('gasto')
    setAmount('')
    setDescription('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!description.trim() || !parsed || parsed <= 0) return
    if (editingId) {
      updateFinanceEntry(editingId, { type, amount: parsed, description: description.trim(), date: todayKey() })
    } else {
      addFinanceEntry({ type, amount: parsed, description: description.trim(), date: todayKey() })
    }
    resetEntryForm()
  }

  function startEditEntry(entry: (typeof financeEntries)[number]) {
    setEditingId(entry.id)
    setType(entry.type)
    setAmount(String(entry.amount))
    setDescription(entry.description)
  }

  function resetSourceForm() {
    setSourceEditingId(null)
    setSourceName('')
    setSourceAmount('')
  }

  function handleSourceSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(sourceAmount)
    if (!sourceName.trim() || !parsed || parsed <= 0) return
    if (sourceEditingId) {
      updateIncomeSource(sourceEditingId, { name: sourceName.trim(), amount: parsed })
    } else {
      addIncomeSource({ name: sourceName.trim(), amount: parsed })
    }
    resetSourceForm()
  }

  function startEditSource(source: (typeof incomeSources)[number]) {
    setSourceEditingId(source.id)
    setSourceName(source.name)
    setSourceAmount(String(source.amount))
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-ink-400">Balance</p>
          <p className={cn('text-2xl font-semibold', balance >= 0 ? 'text-gold-400 text-glow-gold' : 'text-red-400')}>
            ${balance.toLocaleString('es-CL')}
          </p>
          <p className="text-[10px] text-ink-500">Incluye tus ingresos fijos + movimientos registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <FinanceBarChart income={totalIncome} expense={entriesExpense} />
        </CardContent>
      </Card>

      {/* Recurring income: salary + any other fixed monthly source, counted every month without re-entering it */}
      <section className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-400">
            <Landmark size={14} /> Ingresos fijos
          </h2>
          <span className="text-xs font-medium text-emerald-400">${fixedIncome.toLocaleString('es-CL')}/mes</span>
        </div>

        <form onSubmit={handleSourceSubmit} className="mb-3 flex gap-2">
          <Input
            placeholder="Sueldo, arriendo, etc."
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="Monto"
            value={sourceAmount}
            onChange={(e) => setSourceAmount(e.target.value)}
            className="w-28"
          />
          <Button type="submit" size="icon">
            <Plus size={16} />
          </Button>
          {sourceEditingId && (
            <Button type="button" variant="ghost" size="sm" onClick={resetSourceForm}>
              Cancelar
            </Button>
          )}
        </form>

        <div className="flex flex-col gap-2">
          {incomeSources.length === 0 && (
            <p className="text-xs text-ink-400">Agrega tu sueldo u otras fuentes fijas mensuales.</p>
          )}
          {incomeSources.map((source) => (
            <div
              key={source.id}
              className={cn(
                'flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900 p-3',
                sourceEditingId === source.id && 'border-gold-400',
              )}
            >
              <span className="text-sm text-ink-50">{source.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-emerald-400">${source.amount.toLocaleString('es-CL')}</span>
                <button onClick={() => startEditSource(source)} className="text-ink-500 hover:text-gold-400">
                  <Pencil size={14} />
                </button>
                <button onClick={() => deleteIncomeSource(source.id)} className="text-ink-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="panel-bevel flex flex-col gap-2 rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('gasto')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-ink-600 py-2 text-xs font-medium',
              type === 'gasto' ? 'border-red-500 bg-red-950/30 text-red-300' : 'text-ink-400',
            )}
          >
            <TrendingDown size={14} /> Gasto
          </button>
          <button
            type="button"
            onClick={() => setType('ingreso')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-ink-600 py-2 text-xs font-medium',
              type === 'ingreso' ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300' : 'text-ink-400',
            )}
          >
            <TrendingUp size={14} /> Ingreso
          </button>
        </div>
        <Input
          type="number"
          min="0"
          step="1"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Input placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="flex-1">
            <Plus size={14} /> {editingId ? 'Guardar cambios' : 'Agregar'}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" size="sm" onClick={resetEntryForm}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-2">
        {financeEntries.length === 0 && <p className="text-sm text-ink-400">Aún no registras movimientos.</p>}
        {financeEntries.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              'flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900 p-3',
              editingId === entry.id && 'border-gold-400',
            )}
          >
            <div className="flex items-center gap-2">
              {entry.type === 'ingreso' ? (
                <TrendingUp size={16} className="text-emerald-400" />
              ) : (
                <TrendingDown size={16} className="text-red-400" />
              )}
              <div>
                <p className="text-sm text-ink-50">{entry.description}</p>
                <p className="text-[10px] text-ink-500">{entry.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn('text-sm font-medium', entry.type === 'ingreso' ? 'text-emerald-400' : 'text-red-400')}>
                {entry.type === 'ingreso' ? '+' : '-'}${entry.amount.toLocaleString('es-CL')}
              </span>
              <button onClick={() => startEditEntry(entry)} className="text-ink-500 hover:text-gold-400">
                <Pencil size={14} />
              </button>
              <button onClick={() => deleteFinanceEntry(entry.id)} className="text-ink-500 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GrocerySection() {
  const groceryItems = useGameStore((s) => s.groceryItems)
  const addGroceryItem = useGameStore((s) => s.addGroceryItem)
  const toggleGroceryItem = useGameStore((s) => s.toggleGroceryItem)
  const deleteGroceryItem = useGameStore((s) => s.deleteGroceryItem)

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addGroceryItem({ name: name.trim(), quantity: quantity.trim() || undefined })
    setName('')
    setQuantity('')
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="panel-bevel flex gap-2 rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
        <Input placeholder="Producto" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
        <Input
          placeholder="Cant."
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-20"
        />
        <Button type="submit" size="icon">
          <Plus size={16} />
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {groceryItems.length === 0 && <p className="text-sm text-ink-400">Tu lista de supermercado está vacía.</p>}
        {groceryItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900 p-3"
          >
            <button onClick={() => toggleGroceryItem(item.id)} className="flex flex-1 items-center gap-2 text-left">
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink-600',
                  item.checked && 'border-gold-400 bg-gold-500/20 text-gold-400',
                )}
              >
                {item.checked && '✓'}
              </span>
              <span className={cn('text-sm text-ink-50', item.checked && 'text-ink-500 line-through')}>
                {item.name} {item.quantity && <span className="text-ink-500">· {item.quantity}</span>}
              </span>
            </button>
            <button onClick={() => deleteGroceryItem(item.id)} className="text-ink-500 hover:text-red-400">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExerciseSection() {
  const exerciseItems = useGameStore((s) => s.exerciseItems)
  const addExerciseItem = useGameStore((s) => s.addExerciseItem)
  const toggleExerciseItem = useGameStore((s) => s.toggleExerciseItem)
  const deleteExerciseItem = useGameStore((s) => s.deleteExerciseItem)

  const [name, setName] = useState('')
  const [sets, setSets] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addExerciseItem({ name: name.trim(), sets: sets.trim() || undefined })
    setName('')
    setSets('')
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="panel-bevel flex gap-2 rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
        <Input placeholder="Ejercicio" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
        <Input placeholder="Series x reps" value={sets} onChange={(e) => setSets(e.target.value)} className="w-28" />
        <Button type="submit" size="icon">
          <Plus size={16} />
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {exerciseItems.length === 0 && <p className="text-sm text-ink-400">Aún no agregas ejercicios a tu rutina.</p>}
        {exerciseItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900 p-3"
          >
            <button onClick={() => toggleExerciseItem(item.id)} className="flex flex-1 items-center gap-2 text-left">
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink-600',
                  item.done && 'border-gold-400 bg-gold-500/20 text-gold-400',
                )}
              >
                {item.done && '✓'}
              </span>
              <span className={cn('text-sm text-ink-50', item.done && 'text-ink-500 line-through')}>
                {item.name} {item.sets && <span className="text-ink-500">· {item.sets}</span>}
              </span>
            </button>
            <button onClick={() => deleteExerciseItem(item.id)} className="text-ink-500 hover:text-red-400">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
