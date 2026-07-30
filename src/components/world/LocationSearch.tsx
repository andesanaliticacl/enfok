import { useEffect, useRef, useState } from 'react'
import { Search, MapPin, X, Loader2 } from 'lucide-react'
import { GOOGLE_MAPS_API_KEY, searchAddresses, type GeocodeResult } from '@/lib/world/geocode'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const DEBOUNCE_MS = 400
const MIN_QUERY_LENGTH = 3

interface LocationSearchProps {
  /** Called with the place the user picked from the results list. */
  onSelect: (result: GeocodeResult) => void
  placeholder?: string
  /** False while the Maps SDK is still loading — the geocoder isn't available yet. */
  mapsLoaded?: boolean
  className?: string
  autoFocus?: boolean
}

/**
 * Type-ahead place finder: searches as you type (debounced) and lists every
 * match so you can pick the right one, instead of silently taking the first hit.
 */
export function LocationSearch({
  onSelect,
  placeholder = 'Buscar dirección o lugar...',
  mapsLoaded = true,
  className,
  autoFocus,
}: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  // Only the newest query may write results — a slow earlier search must not
  // overwrite what the user is looking at now.
  const requestRef = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()
    if (!mapsLoaded || trimmed.length < MIN_QUERY_LENGTH) {
      setResults([])
      setSearched(false)
      return
    }

    setSearching(true)
    const requestId = ++requestRef.current
    const timer = setTimeout(async () => {
      const found = await searchAddresses(trimmed)
      if (requestRef.current !== requestId) return
      setResults(found)
      setSearched(true)
      setSearching(false)
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query, mapsLoaded])

  function handleSelect(result: GeocodeResult) {
    onSelect(result)
    setQuery('')
    setResults([])
    setSearched(false)
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return <p className="text-[11px] text-ink-500">Configura VITE_GOOGLE_MAPS_API_KEY para buscar ubicaciones.</p>
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <Input
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searching ? (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-ink-400" />
        ) : (
          query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-50"
            >
              <X size={14} />
            </button>
          )
        )}
      </div>

      {searched && results.length === 0 && !searching && (
        <p className="mt-1.5 text-[11px] text-ink-500">Sin resultados. Probá con más detalle (calle, comuna, ciudad).</p>
      )}

      {results.length > 0 && (
        <ul className="panel-bevel absolute z-30 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-ink-700 bg-ink-900 shadow-2xl">
          {results.map((result) => (
            <li key={`${result.lat},${result.lng}`}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="flex w-full items-start gap-2 border-b border-ink-800 px-3 py-2.5 text-left last:border-b-0 hover:bg-ink-800"
              >
                <MapPin size={13} className="mt-0.5 shrink-0 text-gold-400" />
                <span className="text-[11px] leading-snug text-ink-100">{result.address}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
