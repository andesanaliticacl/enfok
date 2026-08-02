import { OverlayView } from '@react-google-maps/api'
import type { Region } from '@/types'

interface RegionMarkerProps {
  region: Region
  lat: number
  lng: number
  progress: number
  /** Pending missions in this region — shown as a badge so the map surfaces "you have stuff to do here". */
  pending: number
  onClick: (region: Region) => void
}

export function RegionMarker({ region, lat, lng, progress, pending, onClick }: RegionMarkerProps) {
  return (
    <OverlayView position={{ lat, lng }} mapPaneName={OverlayView.FLOAT_PANE}>
      <button
        onClick={() => onClick(region)}
        className="relative flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      >
        {pending > 0 && (
          <span className="absolute -right-1 -top-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 font-pixel text-[8px] text-ink-950">
            {pending}
          </span>
        )}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl shadow-lg"
          style={{ borderColor: region.color, backgroundColor: 'color-mix(in srgb, #0b0d12 80%, transparent)' }}
        >
          {region.emoji}
        </div>
        <div className="h-1 w-10 overflow-hidden rounded-full bg-ink-800">
          <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: region.color }} />
        </div>
        <span className="rounded bg-ink-950/80 px-1.5 py-0.5 text-[10px] font-medium text-ink-50">{region.name}</span>
      </button>
    </OverlayView>
  )
}
