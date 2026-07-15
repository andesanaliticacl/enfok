import type { Region } from '@/types'

export interface LatLng {
  lat: number
  lng: number
}

export const DEFAULT_WORLD_CENTER: LatLng = { lat: -33.4489, lng: -70.6693 }

/** Arranges regions in a ring around the center — abstract life-areas don't have real coordinates, so we lay them out like villages on a world map. */
export function layoutRegions(regions: Region[], center: LatLng, radiusDegrees = 0.01): (Region & LatLng)[] {
  return regions.map((region, i) => {
    const angle = (i / regions.length) * Math.PI * 2 - Math.PI / 2
    return {
      ...region,
      lat: center.lat + Math.sin(angle) * radiusDegrees,
      lng: center.lng + Math.cos(angle) * radiusDegrees * 1.3, // longitude degrees are narrower visually, stretch to look circular
    }
  })
}
