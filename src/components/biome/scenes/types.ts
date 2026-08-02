export interface SceneProps {
  /** Resolved time of day — every scene renders a dramatically different day and night. */
  daylight: boolean
  /** Stable seed so particle fields don't reshuffle on re-render. */
  seedKey: string
}

/** Every scene draws into this 16:9 box and is sliced to fill its container. */
export const SCENE_W = 160
export const SCENE_H = 90
