export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

export interface GeocodeResult {
  address: string
  lat: number
  lng: number
}

/**
 * Every match for a free-text query, best first — the list behind the location
 * search box. Uses the Geocoder rather than Places Autocomplete so it needs no
 * API beyond the core Maps JS SDK the map already loads.
 */
export function searchAddresses(query: string, limit = 5): Promise<GeocodeResult[]> {
  if (typeof google === 'undefined' || !google.maps?.Geocoder) return Promise.resolve([])

  const geocoder = new google.maps.Geocoder()
  return new Promise((resolve) => {
    geocoder.geocode({ address: query }, (results, status) => {
      if (status !== 'OK' || !results?.length) {
        resolve([])
        return
      }
      resolve(
        results.slice(0, limit).map((result) => ({
          address: result.formatted_address,
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng(),
        })),
      )
    })
  })
}

/** Resolves a free-text address to a coordinate via the Maps JS SDK's Geocoder — null if it can't find a best-effort match. */
export function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (typeof google === 'undefined' || !google.maps?.Geocoder) return Promise.resolve(null)

  const geocoder = new google.maps.Geocoder()
  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const [result] = results
        resolve({
          address: result.formatted_address,
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng(),
        })
      } else {
        resolve(null)
      }
    })
  })
}
