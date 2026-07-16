import { OverlayView } from '@react-google-maps/api'
import { cn } from '@/lib/utils'
import type { Mission } from '@/types'

interface MissionMarkerProps {
  mission: Mission
  onClick: (mission: Mission) => void
}

export function MissionMarker({ mission, onClick }: MissionMarkerProps) {
  if (!mission.location) return null
  const done = mission.status === 'completada'

  return (
    <OverlayView position={{ lat: mission.location.lat, lng: mission.location.lng }} mapPaneName={OverlayView.FLOAT_PANE}>
      <button
        onClick={() => onClick(mission)}
        className={cn('flex -translate-x-1/2 -translate-y-full flex-col items-center gap-0.5', done && 'opacity-50')}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-600 bg-ink-900 text-sm shadow">
          {done ? '✅' : '🎯'}
        </div>
        <span className="rounded bg-ink-950/80 px-1 py-0.5 text-[9px] text-ink-200">{mission.title}</span>
      </button>
    </OverlayView>
  )
}
