import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'
import { MapPin, Plus, LocateFixed } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { useAvatarStore } from '@/store/useAvatarStore'
import { regionProgress, goalProgress } from '@/lib/planning/goalEngine'
import { layoutRegions, DEFAULT_WORLD_CENTER, type LatLng } from '@/lib/world/layout'
import { GOOGLE_MAPS_API_KEY } from '@/lib/world/geocode'
import { WORLD_MAP_STYLE } from '@/data/mapStyle'
import { RegionMarker } from '@/components/world/RegionMarker'
import { PlaceMarker } from '@/components/world/PlaceMarker'
import { PlaceFormDialog } from '@/components/world/PlaceFormDialog'
import { MissionMarker } from '@/components/world/MissionMarker'
import { GoalMarker } from '@/components/world/GoalMarker'
import { AvatarSprite } from '@/components/avatar/AvatarSprite'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Goal, Mission, Place, PlaceCategory, Region } from '@/types'

export function MapPage() {
  const navigate = useNavigate()
  const regions = useGameStore((s) => s.regions)
  const goals = useGameStore((s) => s.goals)
  const missions = useGameStore((s) => s.missions)
  const places = useGameStore((s) => s.places)
  const addPlace = useGameStore((s) => s.addPlace)
  const deletePlace = useGameStore((s) => s.deletePlace)
  const completeMission = useGameStore((s) => s.completeMission)
  const profile = useGameStore((s) => s.profile)
  const avatar = useAvatarStore((s) => s.avatar)
  const worldAnchor = useGameStore((s) => s.worldAnchor)
  const setWorldAnchor = useGameStore((s) => s.setWorldAnchor)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY ?? '',
  })

  // `center` only drives what part of the map the camera is looking at — the
  // regions are laid out around `worldAnchor` instead, a fixed point set once
  // from the first real location fix, so panning/recentering (e.g. "Dónde
  // estoy") never reshuffles where the regions are.
  const [center, setCenter] = useState<LatLng>(worldAnchor ?? DEFAULT_WORLD_CENTER)
  const [addingPlace, setAddingPlace] = useState(false)
  const [pendingLocation, setPendingLocation] = useState<LatLng | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState<string | null>(null)

  useEffect(() => {
    if (worldAnchor || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setWorldAnchor(here)
        setCenter(here)
      },
      () => {},
      { timeout: 5000 },
    )
    // Only ever runs to establish the anchor once — re-running on every
    // worldAnchor change would defeat the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleLocateMe() {
    if (!navigator.geolocation) {
      setLocateError('Tu navegador no soporta geolocalización.')
      return
    }
    setLocating(true)
    setLocateError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setLocateError('No pudimos obtener tu ubicación. Revisá los permisos del navegador.')
        setLocating(false)
      },
      { timeout: 8000, enableHighAccuracy: true },
    )
  }

  const regionMarkers = useMemo(
    () => layoutRegions(regions, worldAnchor ?? DEFAULT_WORLD_CENTER),
    [regions, worldAnchor],
  )
  const missionsWithLocation = useMemo(() => missions.filter((m) => m.location), [missions])
  const goalsWithLocation = useMemo(() => goals.filter((g) => g.location), [goals])

  function handleMapClick(e: google.maps.MapMouseEvent) {
    if (!addingPlace || !e.latLng) return
    setPendingLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    setAddingPlace(false)
  }

  function handleCreatePlace(name: string, category: PlaceCategory) {
    if (!pendingLocation) return
    addPlace(name, category, pendingLocation.lat, pendingLocation.lng)
    setPendingLocation(null)
  }

  return (
    <div className="flex h-[calc(100dvh-136px)] w-full flex-col">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={() => navigate('/perfil')}
          className="pointer-events-auto flex items-center gap-3 text-left"
        >
          <AvatarSprite config={avatar} size={48} className="rounded-xl bg-ink-800" />
          <div className="rounded-xl bg-ink-950/80 px-3 py-1.5">
            <h1 className="font-pixel text-xs text-gold-400">Questly</h1>
            <p className="mt-0.5 text-[10px] text-ink-400">Nivel {profile.level} · {profile.xp} XP</p>
          </div>
        </button>
      </header>

      <div className="relative flex-1">
        {!GOOGLE_MAPS_API_KEY ? (
          <FallbackWorld regions={regions} goals={goals} missions={missions} />
        ) : !isLoaded ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-400">Cargando el mundo...</div>
        ) : (
          <GoogleMap
            mapContainerClassName="h-full w-full"
            center={center}
            zoom={15}
            onClick={handleMapClick}
            options={{
              styles: WORLD_MAP_STYLE,
              disableDefaultUI: true,
              zoomControl: true,
              zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
              gestureHandling: 'greedy',
            }}
          >
            {regionMarkers.map((region) => (
              <RegionMarker
                key={region.id}
                region={region}
                lat={region.lat}
                lng={region.lng}
                progress={regionProgress(region.id, goals, missions)}
              />
            ))}

            {places.map((place) => (
              <PlaceMarker key={place.id} place={place} onClick={setSelectedPlace} />
            ))}

            {missionsWithLocation.map((mission) => (
              <MissionMarker key={mission.id} mission={mission} onClick={setSelectedMission} />
            ))}

            {goalsWithLocation.map((goal) => (
              <GoalMarker key={goal.id} goal={goal} progress={goalProgress(goal, missions)} onClick={setSelectedGoal} />
            ))}
          </GoogleMap>
        )}

        {GOOGLE_MAPS_API_KEY && isLoaded && (
          <>
            <button
              onClick={() => setAddingPlace((v) => !v)}
              className={cn(
                'absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full border border-ink-600 bg-ink-900 shadow-lg',
                addingPlace && 'border-gold-400 text-gold-400',
              )}
            >
              {addingPlace ? <MapPin size={20} /> : <Plus size={20} />}
            </button>

            <button
              onClick={handleLocateMe}
              disabled={locating}
              title="Dónde estoy"
              className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full border border-ink-600 bg-ink-900 shadow-lg disabled:opacity-50"
            >
              <LocateFixed size={20} className={cn(locating && 'animate-pulse')} />
            </button>
          </>
        )}

        {addingPlace && (
          <p className="absolute inset-x-0 top-16 z-10 mx-auto w-fit rounded-full bg-ink-950/90 px-3 py-1.5 text-[11px] text-gold-400">
            Toca el mapa para marcar tu lugar
          </p>
        )}

        {locateError && (
          <p className="absolute inset-x-0 top-16 z-10 mx-auto w-fit rounded-full bg-ink-950/90 px-3 py-1.5 text-[11px] text-red-400">
            {locateError}
          </p>
        )}
      </div>

      <PlaceFormDialog open={!!pendingLocation} onClose={() => setPendingLocation(null)} onSubmit={handleCreatePlace} />

      {selectedPlace && (
        <div className="absolute inset-x-4 bottom-20 z-20 flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900 p-3">
          <span className="text-sm text-ink-50">{selectedPlace.name}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-red-800 text-red-300"
              onClick={() => {
                deletePlace(selectedPlace.id)
                setSelectedPlace(null)
              }}
            >
              Eliminar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedPlace(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {selectedMission && (
        <div className="absolute inset-x-4 bottom-20 z-20 flex items-center justify-between gap-2 rounded-xl border border-ink-700 bg-ink-900 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-ink-50">{selectedMission.title}</p>
            <p className="truncate text-[10px] text-ink-400">{selectedMission.location?.address}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            {selectedMission.status !== 'completada' && (
              <Button
                size="sm"
                onClick={() => {
                  completeMission(selectedMission.id)
                  setSelectedMission(null)
                }}
              >
                Completar
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSelectedMission(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {selectedGoal && (
        <div className="absolute inset-x-4 bottom-20 z-20 flex items-center justify-between gap-2 rounded-xl border border-ink-700 bg-ink-900 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-ink-50">
              {selectedGoal.icon} {selectedGoal.name}
            </p>
            <p className="truncate text-[10px] text-ink-400">{selectedGoal.location?.address}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              onClick={() => {
                navigate('/misiones')
                setSelectedGoal(null)
              }}
            >
              Ver misiones
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedGoal(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function FallbackWorld({ regions, goals, missions }: { regions: Region[]; goals: Goal[]; missions: Mission[] }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 pt-4">
      <p className="mb-4 text-xs text-ink-400">
        Configura VITE_GOOGLE_MAPS_API_KEY para ver el mundo real. Mientras tanto, aquí están tus regiones:
      </p>
      <div className="flex flex-col gap-3">
        {regions.map((region) => (
          <div key={region.id} className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3">
            <span className="text-xl">{region.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-50">{region.name}</p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${regionProgress(region.id, goals, missions)}%`,
                    backgroundColor: region.color,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
