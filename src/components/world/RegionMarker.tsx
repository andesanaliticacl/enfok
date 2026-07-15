import { OverlayView } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'
import type { Region } from '@/types'

interface RegionMarkerProps {
  region: Region
  lat: number
  lng: number
  progress: number
}

export function RegionMarker({ region, lat, lng, progress }: RegionMarkerProps) {
  const navigate = useNavigate()

  return (
    <OverlayView position={{ lat, lng }} mapPaneName={OverlayView.FLOAT_PANE}>
      <button
        onClick={() => navigate(`/region/${region.id}`)}
        className="flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      >
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
