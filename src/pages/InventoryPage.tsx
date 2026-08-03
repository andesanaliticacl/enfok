import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, ShoppingCart, Dumbbell, Puzzle, Plus, Pencil, Check, TrendingUp, TrendingDown, Landmark, Home, ChevronRight } from 'lucide-react'
import { INVENTORY_MODULES } from '@/data/inventoryModules'
import { SystemsSection } from '@/components/systems/SystemsSection'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { useGameStore } from '@/store/useGameStore'
import { todayKey, MONTH_LABELS } from '@/lib/calendar'
import { toClp, formatMoney, CURRENCIES } from '@/lib/planning/currency'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FinanceBarChart } from '@/components/inventory/FinanceBarChart'
import { FinanceLineChart, type MonthlyTotal } from '@/components/inventory/FinanceLineChart'
import { CurrencyConverter } from '@/components/inventory/CurrencyConverter'
import { ExerciseSection } from '@/components/inventory/ExerciseSection'
import { GROCERY_CATEGORIES } from '@/data/groceryCategories'
import { checkedGroceryTotal, groceryLineTotal, groceryTotal } from '@/lib/planning/groceryEngine'
import { cn } from '@/lib/utils'
import type { Currency, FinanceEntry, FinanceEntryType, GroceryCategory, InventoryModuleId } from '@/types'

/** Last `count` months (oldest first, current month last), aggregated in one CLP-equivalent — no separate history storage needed. */
function buildMonthlyTotals(entries: FinanceEntry[], count: number, usdToClp: number): MonthlyTotal[] {
  const now = new Date()
  const months: MonthlyTotal[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.push({ key, label: MONTH_LABELS[d.getMonth()].slice(0, 3), ingreso: 0, gasto: 0 })
  }
  const byKey = new Map(months.map((m) => [m.key, m]))
  for (const entry of entries) {
    const month = byKey.get(entry.date.slice(0, 7))
    if (!month) continue
    const amountClp = toClp(entry.amount, entry.currency, usdToClp)
    if (entry.type === 'ingreso') month.ingreso += amountClp
    else month.gasto += amountClp
  }
  return months
}

/** Small pill row to pick CLP or USD for an amount input. */
function CurrencyChips({ value, onChange }: { value: Currency; onChange: (c: Currency) => void }) {
  return (
    <div className="flex gap-1">
      {CURRENCIES.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          className={cn(
            'rounded-full border border-ink-600 px-2 py-1 text-[10px] font-medium text-ink-300',
            value === c.id && 'border-gold-400 bg-gold-500/20 text-gold-400',
          )}
        >
          {c.id}
        </button>
      ))}
    </div>
  )
}

const TAB_ICONS: Record<InventoryModuleId, typeof Wallet> = {
  finanzas: Wallet,
  compras: ShoppingCart,
  ejercicios: Dumbbell,
  sistemas: Puzzle,
}

export function InventoryPage() {
  const navigate = useNavigate()
  const enabledModules = useGameStore((s) => s.enabledModules)

  // Only the modules you added get a tab — the rest live in the profile until claimed.
  const tabs = INVENTORY_MODULES.filter((m) => enabledModules.includes(m.id))
  const [tab, setTab] = useState<InventoryModuleId>('finanzas')
  const activeTab = tabs.some((t) => t.id === tab) ? tab : (tabs[0]?.id ?? 'finanzas')

  return (
    <PageContainer>
      <h1 className="mb-4 font-pixel text-lg text-gold-400">Inventario</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(({ id, label }) => {
          const Icon = TAB_ICONS[id]
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
                activeTab === id && 'bg-ink-800 text-gold-400',
              )}
            >
              <Icon size={14} /> {label}
            </button>
          )
        })}
        {/* Nothing left to add means no dead-end button — the shortcut disappears once your inventory is complete */}
        {tabs.length < INVENTORY_MODULES.length && (
          <button
            onClick={() => navigate('/perfil')}
            title="Añadir módulos desde tu perfil"
            className="flex items-center gap-1 rounded-full border border-dashed border-ink-600 px-3 py-1.5 text-xs text-ink-400 hover:border-gold-400 hover:text-gold-400"
          >
            <Plus size={13} /> Añadir
          </button>
        )}
      </div>

      {activeTab === 'finanzas' && <FinanceSection />}
      {activeTab === 'compras' && <GrocerySection />}
      {activeTab === 'ejercicios' && <ExerciseSection />}
      {activeTab === 'sistemas' && <SystemsSection />}
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
  const fixedExpenses = useGameStore((s) => s.fixedExpenses)
  const addFixedExpense = useGameStore((s) => s.addFixedExpense)
  const updateFixedExpense = useGameStore((s) => s.updateFixedExpense)
  const deleteFixedExpense = useGameStore((s) => s.deleteFixedExpense)
  const usdToClp = useGameStore((s) => s.usdToClp)

  const [view, setView] = useState<'resumen' | 'tendencia'>('resumen')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [type, setType] = useState<FinanceEntryType>('gasto')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('CLP')
  const [description, setDescription] = useState('')

  const [sourceEditingId, setSourceEditingId] = useState<string | null>(null)
  const [sourceName, setSourceName] = useState('')
  const [sourceAmount, setSourceAmount] = useState('')
  const [sourceCurrency, setSourceCurrency] = useState<Currency>('CLP')

  const [expenseEditingId, setExpenseEditingId] = useState<string | null>(null)
  const [expenseName, setExpenseName] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCurrency, setExpenseCurrency] = useState<Currency>('CLP')

  // Every total below is a CLP-equivalent sum — so a peso and a dollar always add up correctly.
  const fixedIncome = incomeSources.reduce((sum, s) => sum + toClp(s.amount, s.currency, usdToClp), 0)
  const fixedExpensesTotal = fixedExpenses.reduce((sum, e) => sum + toClp(e.amount, e.currency, usdToClp), 0)
  const entriesIncome = financeEntries
    .filter((e) => e.type === 'ingreso')
    .reduce((sum, e) => sum + toClp(e.amount, e.currency, usdToClp), 0)
  const entriesExpense = financeEntries
    .filter((e) => e.type === 'gasto')
    .reduce((sum, e) => sum + toClp(e.amount, e.currency, usdToClp), 0)
  const totalIncome = fixedIncome + entriesIncome
  const totalExpense = fixedExpensesTotal + entriesExpense
  const balance = totalIncome - totalExpense

  function resetEntryForm() {
    setEditingId(null)
    setType('gasto')
    setAmount('')
    setCurrency('CLP')
    setDescription('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!description.trim() || !parsed || parsed <= 0) return
    if (editingId) {
      updateFinanceEntry(editingId, { type, amount: parsed, currency, description: description.trim(), date: todayKey() })
    } else {
      addFinanceEntry({ type, amount: parsed, currency, description: description.trim(), date: todayKey() })
    }
    resetEntryForm()
  }

  function startEditEntry(entry: (typeof financeEntries)[number]) {
    setEditingId(entry.id)
    setType(entry.type)
    setAmount(String(entry.amount))
    setCurrency(entry.currency)
    setDescription(entry.description)
  }

  function resetSourceForm() {
    setSourceEditingId(null)
    setSourceName('')
    setSourceAmount('')
    setSourceCurrency('CLP')
  }

  function handleSourceSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(sourceAmount)
    if (!sourceName.trim() || !parsed || parsed <= 0) return
    if (sourceEditingId) {
      updateIncomeSource(sourceEditingId, { name: sourceName.trim(), amount: parsed, currency: sourceCurrency })
    } else {
      addIncomeSource({ name: sourceName.trim(), amount: parsed, currency: sourceCurrency })
    }
    resetSourceForm()
  }

  function startEditSource(source: (typeof incomeSources)[number]) {
    setSourceEditingId(source.id)
    setSourceName(source.name)
    setSourceAmount(String(source.amount))
    setSourceCurrency(source.currency)
  }

  function resetExpenseForm() {
    setExpenseEditingId(null)
    setExpenseName('')
    setExpenseAmount('')
    setExpenseCurrency('CLP')
  }

  function handleExpenseSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(expenseAmount)
    if (!expenseName.trim() || !parsed || parsed <= 0) return
    if (expenseEditingId) {
      updateFixedExpense(expenseEditingId, { name: expenseName.trim(), amount: parsed, currency: expenseCurrency })
    } else {
      addFixedExpense({ name: expenseName.trim(), amount: parsed, currency: expenseCurrency })
    }
    resetExpenseForm()
  }

  function startEditExpense(expense: (typeof fixedExpenses)[number]) {
    setExpenseEditingId(expense.id)
    setExpenseName(expense.name)
    setExpenseAmount(String(expense.amount))
    setExpenseCurrency(expense.currency)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-ink-400">Balance (equivalente en CLP)</p>
          <p className={cn('text-2xl font-semibold', balance >= 0 ? 'text-gold-400 text-glow-gold' : 'text-red-400')}>
            ${Math.round(balance).toLocaleString('es-CL')}
          </p>
          <p className="text-[10px] text-ink-500">Suma ingresos y gastos fijos + movimientos, en pesos o dólares por igual</p>
        </CardContent>
      </Card>

      <CurrencyConverter />

      <div className="flex gap-2">
        <button
          onClick={() => setView('resumen')}
          className={cn(
            'flex-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
            view === 'resumen' && 'bg-ink-800 text-gold-400',
          )}
        >
          Resumen
        </button>
        <button
          onClick={() => setView('tendencia')}
          className={cn(
            'flex-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
            view === 'tendencia' && 'bg-ink-800 text-gold-400',
          )}
        >
          Tendencia mensual
        </button>
      </div>

      {view === 'tendencia' ? (
        <Card>
          <CardContent className="p-4">
            <FinanceLineChart months={buildMonthlyTotals(financeEntries, 6, usdToClp)} />
            <p className="mt-3 text-[10px] text-ink-500">
              Últimos 6 meses, según la fecha de cada movimiento registrado (equivalente en CLP).
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <FinanceBarChart
              fixedIncome={fixedIncome}
              spontaneousIncome={entriesIncome}
              fixedExpense={fixedExpensesTotal}
              spontaneousExpense={entriesExpense}
            />
          </CardContent>
        </Card>
      )}

      {/* Recurring income: salary + any other fixed monthly source, counted every month without re-entering it */}
      <section className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-400">
            <Landmark size={14} /> Ingresos fijos
          </h2>
          <span className="text-xs font-medium text-emerald-400">${Math.round(fixedIncome).toLocaleString('es-CL')}/mes</span>
        </div>

        <form onSubmit={handleSourceSubmit} className="mb-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="Sueldo, freelance, etc."
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
              className="w-24"
            />
            <Button type="submit" size="icon">
              <Plus size={16} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <CurrencyChips value={sourceCurrency} onChange={setSourceCurrency} />
            {sourceEditingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetSourceForm}>
                Cancelar
              </Button>
            )}
          </div>
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
                <span className="text-right text-sm font-medium text-emerald-400">
                  {formatMoney(source.amount, source.currency)}
                  {source.currency === 'USD' && (
                    <span className="block text-[9px] font-normal text-ink-500">
                      ≈ ${Math.round(toClp(source.amount, 'USD', usdToClp)).toLocaleString('es-CL')}
                    </span>
                  )}
                </span>
                <button onClick={() => startEditSource(source)} className="text-ink-500 hover:text-gold-400">
                  <Pencil size={14} />
                </button>
                <ConfirmDeleteButton onConfirm={() => deleteIncomeSource(source.id)} title="Eliminar ingreso fijo" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recurring bills: luz, agua, arriendo, gastos comunes — counted every month without re-entering them */}
      <section className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-400">
            <Home size={14} /> Gastos fijos
          </h2>
          <span className="text-xs font-medium text-red-400">${Math.round(fixedExpensesTotal).toLocaleString('es-CL')}/mes</span>
        </div>

        <form onSubmit={handleExpenseSubmit} className="mb-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="Luz, agua, arriendo, gastos comunes..."
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              min="0"
              step="1"
              placeholder="Monto"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              className="w-24"
            />
            <Button type="submit" size="icon">
              <Plus size={16} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <CurrencyChips value={expenseCurrency} onChange={setExpenseCurrency} />
            {expenseEditingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetExpenseForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>

        <div className="flex flex-col gap-2">
          {fixedExpenses.length === 0 && (
            <p className="text-xs text-ink-400">Agrega luz, agua, arriendo o gastos comunes del edificio.</p>
          )}
          {fixedExpenses.map((expense) => (
            <div
              key={expense.id}
              className={cn(
                'flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900 p-3',
                expenseEditingId === expense.id && 'border-gold-400',
              )}
            >
              <span className="text-sm text-ink-50">{expense.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-right text-sm font-medium text-red-400">
                  {formatMoney(expense.amount, expense.currency)}
                  {expense.currency === 'USD' && (
                    <span className="block text-[9px] font-normal text-ink-500">
                      ≈ ${Math.round(toClp(expense.amount, 'USD', usdToClp)).toLocaleString('es-CL')}
                    </span>
                  )}
                </span>
                <button onClick={() => startEditExpense(expense)} className="text-ink-500 hover:text-gold-400">
                  <Pencil size={14} />
                </button>
                <ConfirmDeleteButton onConfirm={() => deleteFixedExpense(expense.id)} title="Eliminar gasto fijo" />
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
        <div className="flex gap-2">
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1"
          />
          <CurrencyChips value={currency} onChange={setCurrency} />
        </div>
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
              <span className={cn('text-right text-sm font-medium', entry.type === 'ingreso' ? 'text-emerald-400' : 'text-red-400')}>
                {entry.type === 'ingreso' ? '+' : '-'}{formatMoney(entry.amount, entry.currency)}
                {entry.currency === 'USD' && (
                  <span className="block text-[9px] font-normal text-ink-500">
                    ≈ ${Math.round(toClp(entry.amount, 'USD', usdToClp)).toLocaleString('es-CL')}
                  </span>
                )}
              </span>
              <button onClick={() => startEditEntry(entry)} className="text-ink-500 hover:text-gold-400">
                <Pencil size={14} />
              </button>
              <ConfirmDeleteButton onConfirm={() => deleteFinanceEntry(entry.id)} title="Eliminar movimiento" />
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
  const updateGroceryItem = useGameStore((s) => s.updateGroceryItem)
  const toggleGroceryItem = useGameStore((s) => s.toggleGroceryItem)
  const deleteGroceryItem = useGameStore((s) => s.deleteGroceryItem)
  const logGroceryPurchase = useGameStore((s) => s.logGroceryPurchase)
  const resetGroceryBasket = useGameStore((s) => s.resetGroceryBasket)
  const groceryPurchaseEntryId = useGameStore((s) => s.groceryPurchaseEntryId)
  const financeEntries = useGameStore((s) => s.financeEntries)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<GroceryCategory>('otros')
  const [loggedMessage, setLoggedMessage] = useState<string | null>(null)
  // Categories start closed — an empty set means nothing is expanded yet.
  const [expandedCategories, setExpandedCategories] = useState<Set<GroceryCategory>>(new Set())

  function toggleCategory(id: GroceryCategory) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const checkedTotal = checkedGroceryTotal(groceryItems)
  const basketTotal = groceryTotal(groceryItems)
  const grouped = GROCERY_CATEGORIES.map((cat) => ({
    ...cat,
    items: groceryItems.filter((i) => i.category === cat.id),
  })).filter((g) => g.items.length > 0)

  // Treat the basket as sent only while its Finanzas entry actually exists —
  // deleting the expense there frees the basket to be sent again.
  const sentEntry = groceryPurchaseEntryId
    ? financeEntries.find((e) => e.id === groceryPurchaseEntryId)
    : undefined
  const pendingChanges = !!sentEntry && sentEntry.amount !== checkedTotal

  function resetForm() {
    setEditingId(null)
    setName('')
    setQuantity('1')
    setPrice('')
    setCategory('otros')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const input = {
      name: name.trim(),
      quantity: Math.max(1, Math.round(Number(quantity) || 1)),
      category,
      price: price ? Number(price) : undefined,
    }
    if (editingId) updateGroceryItem(editingId, input)
    else addGroceryItem(input)
    resetForm()
  }

  function startEdit(item: (typeof groceryItems)[number]) {
    setEditingId(item.id)
    setName(item.name)
    setQuantity(String(item.quantity))
    setPrice(item.price ? String(item.price) : '')
    setCategory(item.category)
  }

  function handleLogPurchase() {
    const amount = logGroceryPurchase()
    if (amount <= 0) return
    setLoggedMessage(
      sentEntry
        ? `Actualizado a $${amount.toLocaleString('es-CL')} en Finanzas.`
        : `Se registró $${amount.toLocaleString('es-CL')} en Finanzas.`,
    )
    setTimeout(() => setLoggedMessage(null), 4000)
  }

  function handleNewBasket() {
    resetGroceryBasket()
    setLoggedMessage(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-ink-50">Supermercado</h2>

      {/* The basket's running cost: what the whole list would cost vs. what you've actually picked up */}
      <Card>
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-ink-400">Canasta completa</p>
            <p className="text-sm font-semibold text-ink-50">${basketTotal.toLocaleString('es-CL')}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-ink-400">Marcado</p>
            <p className="text-lg font-semibold text-gold-400 text-glow-gold">
              ${checkedTotal.toLocaleString('es-CL')}
            </p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="panel-bevel flex flex-col gap-2 rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
        <Input placeholder="Producto" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-2">
          <label className="flex-1 text-[10px] text-ink-400">
            Cantidad
            <Input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-0.5"
            />
          </label>
          <label className="flex-1 text-[10px] text-ink-400">
            Precio por unidad
            <Input
              type="number"
              min="0"
              step="1"
              placeholder="$ c/u"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-0.5"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GROCERY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                'rounded-full border border-ink-600 px-2.5 py-1 text-[11px] text-ink-300',
                category === cat.id && 'border-gold-400 bg-gold-500/20 text-gold-400',
              )}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="flex-1">
            <Plus size={14} /> {editingId ? 'Guardar cambios' : 'Agregar'}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-2">
        {groceryItems.length === 0 && <p className="text-sm text-ink-400">Tu lista de compras del mes está vacía.</p>}
        {grouped.map((group) => {
          const isOpen = expandedCategories.has(group.id)
          const groupTotal = group.items.reduce((sum, item) => sum + groceryLineTotal(item), 0)
          const checkedCount = group.items.filter((i) => i.checked).length
          return (
            <div key={group.id} className="rounded-xl border border-ink-800 bg-ink-900/40">
              <button
                onClick={() => toggleCategory(group.id)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
              >
                <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-300">
                  <ChevronRight size={13} className={cn('shrink-0 text-ink-500 transition-transform', isOpen && 'rotate-90')} />
                  {group.icon} {group.label}
                  <span className="rounded-full bg-ink-800 px-1.5 py-0.5 text-[9px] normal-case text-ink-400">
                    {checkedCount}/{group.items.length}
                  </span>
                </span>
                <span className="text-[10px] text-ink-500">${groupTotal.toLocaleString('es-CL')}</span>
              </button>

              {isOpen && (
                <div className="flex flex-col gap-2 px-3 pb-3">
                  {group.items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900 p-3',
                  editingId === item.id && 'border-gold-400',
                )}
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
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-sm text-ink-50', item.checked && 'text-ink-500 line-through')}>
                      {item.name}
                    </span>
                    {/* Spelling out "4 × $1.200 = $4.800" is what makes the unit price unambiguous */}
                    <span className="block text-[10px] text-ink-500">
                      {item.quantity} un.
                      {item.price !== undefined && (
                        <>
                          {' × '}${item.price.toLocaleString('es-CL')} c/u
                          <span className="text-gold-400"> = ${groceryLineTotal(item).toLocaleString('es-CL')}</span>
                        </>
                      )}
                    </span>
                  </span>
                </button>
                <button onClick={() => startEdit(item)} className="text-ink-500 hover:text-gold-400">
                  <Pencil size={14} />
                </button>
                    <ConfirmDeleteButton onConfirm={() => deleteGroceryItem(item.id)} title="Eliminar producto" className="ml-3" />
                  </div>
                ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sending charges Finanzas once; editing afterwards updates that same expense instead of stacking new ones */}
      {(checkedTotal > 0 || sentEntry) && (
        <div className="flex flex-col gap-2">
          {sentEntry && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-3">
              <Check size={15} className="shrink-0 text-emerald-400" />
              <p className="flex-1 text-[11px] text-emerald-300">
                Enviado a Finanzas: ${sentEntry.amount.toLocaleString('es-CL')}
                {pendingChanges && (
                  <span className="block text-gold-400">
                    Tu canasta ahora suma ${checkedTotal.toLocaleString('es-CL')} — actualízala.
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {(!sentEntry || pendingChanges) && (
              <Button onClick={handleLogPurchase} disabled={checkedTotal <= 0} className="flex-1">
                <Check size={16} />{' '}
                {sentEntry
                  ? `Actualizar a $${checkedTotal.toLocaleString('es-CL')}`
                  : `Enviar canasta a Finanzas ($${checkedTotal.toLocaleString('es-CL')})`}
              </Button>
            )}
            {sentEntry && (
              <Button variant="outline" onClick={handleNewBasket} className={cn(!pendingChanges && 'flex-1')}>
                Nueva canasta
              </Button>
            )}
          </div>

          {loggedMessage && <p className="text-center text-[11px] text-emerald-400">{loggedMessage}</p>}
        </div>
      )}
    </div>
  )
}

