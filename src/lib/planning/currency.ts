import type { Currency } from '@/types'

export const DEFAULT_USD_TO_CLP = 950

export const CURRENCIES: { id: Currency; label: string; symbol: string }[] = [
  { id: 'CLP', label: 'Peso chileno', symbol: '$' },
  { id: 'USD', label: 'Dólar', symbol: 'US$' },
]

/** Converts any supported amount to its CLP-equivalent, so totals/balances are always one comparable sum. */
export function toClp(amount: number, currency: Currency, usdToClp: number): number {
  return currency === 'USD' ? amount * usdToClp : amount
}

/** Converts a CLP amount into the given currency — the inverse of toClp. */
export function fromClp(amountClp: number, currency: Currency, usdToClp: number): number {
  return currency === 'USD' ? amountClp / usdToClp : amountClp
}

export function formatMoney(amount: number, currency: Currency): string {
  const symbol = currency === 'USD' ? 'US$' : '$'
  const rounded = currency === 'USD' ? Math.round(amount * 100) / 100 : Math.round(amount)
  return `${symbol}${rounded.toLocaleString('es-CL')}`
}

export function formatClp(amount: number): string {
  return `$${Math.round(amount).toLocaleString('es-CL')}`
}
