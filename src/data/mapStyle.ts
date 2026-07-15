/** Dark, minimal Google Maps style — strips away the "Google Maps" feel (POI clutter, labels, icons) so the map reads as a game world backdrop. */
export const WORLD_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#12151c' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7284' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b0d12' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1b1f2a' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#262b3a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1420' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#12151c' }] },
]
