import { OverlayView } from '@react-google-maps/api'
import type { Goal } from '@/types'

interface GoalMarkerProps {
  goal: Goal
  progress: number
  onClick: (goal: Goal) => void
}

export function GoalMarker({ goal, progress, onClick }: GoalMarkerProps) {
  if (!goal.location) return null

  return (
    <OverlayView position={{ lat: goal.location.lat, lng: goal.location.lng }} mapPaneName={OverlayView.FLOAT_PANE}>
      <button onClick={() => onClick(goal)} className="flex -translate-x-1/2 -translate-y-full flex-col items-center gap-0.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 bg-ink-900 text-base shadow"
          style={{ borderColor: goal.color }}
        >
          {goal.icon}
        </div>
        <div className="h-1 w-8 overflow-hidden rounded-full bg-ink-800">
          <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: goal.color }} />
        </div>
        <span className="rounded bg-ink-950/80 px-1 py-0.5 text-[9px] text-ink-200">{goal.name}</span>
      </button>
    </OverlayView>
  )
}
