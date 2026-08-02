import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { DEFAULT_USD_TO_CLP, formatMoney } from '@/lib/planning/currency'
import { Input } from '@/components/ui/input'
import type { Currency } from '@/types'

/** Small CLP⇄USD converter plus the editable rate everything else in Finanzas converts by. */
export function CurrencyConverter() {
  const usdToClp = useGameStore((s) => s.usdToClp)
  const setUsdToClp = useGameStore((s) => s.setUsdToClp)

  const [from, setFrom] = useState<Currency>('USD')
  const [amount, setAmount] = useState('1')
  const [rateDraft, setRateDraft] = useState(String(usdToClp))

  const parsed = Number(amount) || 0
  const to: Currency = from === 'USD' ? 'CLP' : 'USD'
  const converted = from === 'USD' ? parsed * usdToClp : parsed / usdToClp

  function commitRate() {
    const rate = Number(rateDraft)
    setUsdToClp(rate > 0 ? rate : DEFAULT_USD_TO_CLP)
  }

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900/60 p-3">
      <p className="mb-2 text-[10px] uppercase tracking-wide text-ink-400">Convertidor</p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-24"
        />
        <span className="text-xs text-ink-400">{from}</span>
        <button
          onClick={() => setFrom(to)}
          title="Invertir dirección"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-ink-600 text-ink-300 hover:text-gold-400"
        >
          <ArrowLeftRight size={13} />
        </button>
        <span className="text-xs text-ink-400">{to}</span>
        <span className="ml-auto text-sm font-semibold text-gold-400">{formatMoney(converted, to)}</span>
      </div>

      <div className="mt-2.5 flex items-center gap-2 border-t border-ink-800 pt-2.5">
        <span className="text-[10px] text-ink-500">Tasa 1 USD =</span>
        <Input
          type="number"
          min="1"
          step="1"
          value={rateDraft}
          onChange={(e) => setRateDraft(e.target.value)}
          onBlur={commitRate}
          className="h-7 w-20 px-2 py-0 text-xs"
        />
        <span className="text-[10px] text-ink-500">CLP</span>
      </div>
    </div>
  )
}
