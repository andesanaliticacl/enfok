export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

export interface GeocodeResult {
  address: string
  lat: number
  lng: number
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
