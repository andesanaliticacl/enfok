import { OverlayView } from '@react-google-maps/api'
import { placeIcon } from '@/data/placeCategories'
import type { Place } from '@/types'

interface PlaceMarkerProps {
  place: Place
  onClick: (place: Place) => void
}

export function PlaceMarker({ place, onClick }: PlaceMarkerProps) {
  return (
    <OverlayView position={{ lat: place.lat, lng: place.lng }} mapPaneName={OverlayView.FLOAT_PANE}>
      <button
        onClick={() => onClick(place)}
        className="flex -translate-x-1/2 -translate-y-full flex-col items-center gap-0.5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-600 bg-ink-900 text-sm shadow">
          {placeIcon(place.category)}
        </div>
        <span className="rounded bg-ink-950/80 px-1 py-0.5 text-[9px] text-ink-200">{place.name}</span>
      </button>
    </OverlayView>
  )
}
