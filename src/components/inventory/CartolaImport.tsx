import { useMemo, useRef, useState } from 'react'
import { Upload, ShieldCheck, TriangleAlert, Check, X, Lock, CreditCard } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { readCartolaPdf, CartolaPasswordError } from '@/lib/finance/cartolaPdf'
import { cartolaSourceRef, type CartolaParse } from '@/lib/finance/cartola'
import { formatClp } from '@/lib/planning/currency'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** Pagos a la tarjeta: mueven plata de verdad, pero no son consumo. Van marcados aparte. */
function isCardPayment(description: string): boolean {
  return /tarjeta\s+cmr/i.test(description)
}

function shortDate(iso: string): string {
  const [, month, day] = iso.split('-')
  return `${Number(day)}/${Number(month)}`
}

/**
 * Carga la cartola del banco y la convierte en movimientos de Finanzas.
 *
 * Dos reglas guían todo lo de abajo: el archivo nunca sale del navegador, y nada
 * se guarda sin que el usuario lo vea antes. Si la cartola no cuadra consigo
 * misma, directamente no se ofrece importar.
 */
export function CartolaImport() {
  const importFinanceEntries = useGameStore((s) => s.importFinanceEntries)
  const financeEntries = useGameStore((s) => s.financeEntries)

  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [needsPassword, setNeedsPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [parse, setParse] = useState<CartolaParse | null>(null)
  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null)

  const alreadyImported = useMemo(
    () => new Set(financeEntries.map((e) => e.sourceRef).filter(Boolean)),
    [financeEntries],
  )

  function reset() {
    setFile(null)
    setPassword('')
    setNeedsPassword(false)
    setPasswordError('')
    setError('')
    setParse(null)
    setExcluded(new Set())
    setResult(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  async function load(target: File, key?: string) {
    setLoading(true)
    setError('')
    setPasswordError('')
    try {
      const parsed = await readCartolaPdf(target, key)
      setParse(parsed)
      setNeedsPassword(false)
      // Lo que ya está en Finanzas parte desmarcado: verlo tachado explica por
      // qué no se vuelve a sumar, en vez de que desaparezca sin más.
      setExcluded(new Set(parsed.rows.map((r) => cartolaSourceRef(parsed.accountTail, r)).filter((ref) => alreadyImported.has(ref))))
    } catch (err) {
      if (err instanceof CartolaPasswordError) {
        setNeedsPassword(true)
        setParse(null)
        if (err.wrongAttempt) setPasswordError('Esa clave no abre el archivo.')
      } else {
        setError('No pudimos leer este PDF. ¿Es la cartola que descargaste del banco?')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return
    setParse(null)
    setResult(null)
    setPassword('')
    setFile(picked)
    void load(picked)
  }

  function toggle(ref: string) {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(ref)) next.delete(ref)
      else next.add(ref)
      return next
    })
  }

  function confirmImport() {
    if (!parse) return
    const selected = parse.rows
      .map((row) => ({ row, ref: cartolaSourceRef(parse.accountTail, row) }))
      .filter(({ ref }) => !excluded.has(ref))
      .map(({ row, ref }) => ({
        type: row.abono > 0 ? ('ingreso' as const) : ('gasto' as const),
        amount: row.abono > 0 ? row.abono : row.cargo,
        currency: 'CLP' as const,
        description: row.description,
        date: row.date,
        sourceRef: ref,
      }))
    setResult(importFinanceEntries(selected))
    setParse(null)
  }

  const selectedRows = parse
    ? parse.rows.filter((r) => !excluded.has(cartolaSourceRef(parse.accountTail, r)))
    : []
  const selectedIn = selectedRows.reduce((sum, r) => sum + r.abono, 0)
  const selectedOut = selectedRows.reduce((sum, r) => sum + r.cargo, 0)
  const cardPayments = selectedRows.filter((r) => isCardPayment(r.description))
  const cardTotal = cardPayments.reduce((sum, r) => sum + r.cargo, 0)

  return (
    <CollapsibleSection title="Cargar cartola del banco" icon={<Upload size={13} />}>
      <div className="flex flex-col gap-3 px-4 pb-4">
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-400">
          <ShieldCheck size={13} className="mt-0.5 shrink-0 text-emerald-400" />
          <span>
            El PDF se lee <strong className="text-ink-200">dentro de tu teléfono</strong>. No se sube a ninguna parte, y
            tu nombre, dirección y número de cuenta no se guardan.
          </span>
        </p>

        <input ref={fileInput} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
        <Button size="sm" variant="ghost" onClick={() => fileInput.current?.click()} disabled={loading}>
          <Upload size={14} /> {loading ? 'Leyendo…' : file ? 'Elegir otro PDF' : 'Elegir PDF de la cartola'}
        </Button>

        {needsPassword && file && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void load(file, password)
            }}
            className="flex flex-col gap-2 rounded-xl border border-gold-400/40 bg-ink-950/60 p-3"
          >
            <p className="flex items-center gap-1.5 text-[11px] text-ink-300">
              <Lock size={12} /> Este PDF está protegido. Suele ser tu RUT sin dígito verificador o el número del cupón.
            </p>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Clave del PDF"
              autoFocus
            />
            {passwordError && <p className="text-[11px] text-rose-400">{passwordError}</p>}
            <Button type="submit" size="sm" disabled={!password || loading}>
              Abrir cartola
            </Button>
          </form>
        )}

        {error && <p className="text-[11px] text-rose-400">{error}</p>}

        {parse && !parse.balanced && (
          <div className="flex flex-col gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
              <TriangleAlert size={13} /> No podemos importar esta cartola
            </p>
            {parse.problems.map((problem) => (
              <p key={problem} className="text-[11px] leading-relaxed text-ink-300">
                {problem}
              </p>
            ))}
            <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
              Preferimos no guardar nada antes que guardar un monto equivocado.
            </p>
          </div>
        )}

        {parse && parse.balanced && (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <ShieldCheck size={13} /> Cartola verificada
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-300">
                Sumamos los {parse.rows.length} movimientos uno por uno y el saldo llegó exacto a{' '}
                {formatClp(parse.saldoFinal ?? 0)}. Los números están bien leídos.
              </p>
              {parse.from && (
                <p className="mt-1 text-[10px] text-ink-500">
                  Cuenta ••••{parse.accountTail} · {shortDate(parse.from)} al {shortDate(parse.to ?? parse.from)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-ink-700 bg-ink-900 p-2.5">
                <p className="text-[10px] uppercase tracking-wide text-ink-500">Entra</p>
                <p className="text-sm font-semibold text-emerald-400">{formatClp(selectedIn)}</p>
              </div>
              <div className="rounded-xl border border-ink-700 bg-ink-900 p-2.5">
                <p className="text-[10px] uppercase tracking-wide text-ink-500">Sale</p>
                <p className="text-sm font-semibold text-rose-400">{formatClp(selectedOut)}</p>
              </div>
            </div>

            {cardPayments.length > 0 && (
              <p className="flex items-start gap-1.5 rounded-xl border border-ink-700 bg-ink-950/60 p-2.5 text-[11px] leading-relaxed text-ink-400">
                <CreditCard size={13} className="mt-0.5 shrink-0 text-gold-400" />
                <span>
                  <strong className="text-ink-200">{formatClp(cardTotal)}</strong> de lo que sale son{' '}
                  {cardPayments.length} pagos a la tarjeta CMR. Es plata que salió de verdad, pero no es consumo del mes
                  — si después cargas el estado CMR, esas compras se contarían aparte. Desmárcalos si prefieres no
                  contarlos dos veces.
                </span>
              </p>
            )}

            <div className="flex flex-col gap-1">
              {parse.rows.map((row) => {
                const ref = cartolaSourceRef(parse.accountTail, row)
                const off = excluded.has(ref)
                const known = alreadyImported.has(ref)
                return (
                  <button
                    key={ref}
                    onClick={() => toggle(ref)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors',
                      off ? 'border-ink-800 bg-ink-950/40 opacity-50' : 'border-ink-700 bg-ink-900',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        off ? 'border-ink-600' : 'border-gold-400 bg-gold-500/20',
                      )}
                    >
                      {off ? <X size={9} className="text-ink-500" /> : <Check size={10} className="text-gold-400" />}
                    </span>
                    <span className="w-9 shrink-0 text-[10px] text-ink-500">{shortDate(row.date)}</span>
                    <span className="min-w-0 flex-1 truncate text-[11px] text-ink-200">
                      {row.description}
                      {known && <span className="ml-1 text-[10px] text-ink-600">· ya está</span>}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 text-[11px] font-medium tabular-nums',
                        row.abono > 0 ? 'text-emerald-400' : 'text-rose-400',
                      )}
                    >
                      {row.abono > 0 ? '+' : '−'}
                      {formatClp(row.abono || row.cargo).slice(1)}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={confirmImport} disabled={selectedRows.length === 0}>
                <Check size={14} /> Importar {selectedRows.length}
              </Button>
              <Button size="sm" variant="ghost" onClick={reset}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
            <p className="text-xs font-semibold text-emerald-300">
              {result.added} movimiento{result.added === 1 ? '' : 's'} en Finanzas
            </p>
            {result.skipped > 0 && (
              <p className="mt-1 text-[11px] text-ink-300">
                {result.skipped} ya estaban de una carga anterior y no se repitieron.
              </p>
            )}
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}
