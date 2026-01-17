import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect, useRef } from "react"
import hardcodedData from "../data/data.json"

// Default icon fix for Leaflet in bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

// Apply icon fix immediately
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Masjid icon (green mosque)
const masjidIcon = new L.Icon({
  iconUrl: "/mosque.png",
  iconSize: [32, 41],
  iconAnchor: [16, 41],
  popupAnchor: [0, -41],
})

// Default center: Downtown Vancouver, BC - ALWAYS use this as fallback
const VANCOUVER_CENTER = { lat: 49.246353856458896, lng: -123.06389031962716 }
const DEFAULT_ZOOM = 13 // Zoom 13 is roughly a 10km radius view

export default function MapView({ masjids = [], userLocation, highlightMasjidId }) {
  const normalized = (masjids || []).map((m) => ({
    ...m,
    latitude: typeof m.latitude === "string" ? Number.parseFloat(m.latitude) : m.latitude,
    longitude: typeof m.longitude === "string" ? Number.parseFloat(m.longitude) : m.longitude,
  }))

  const combined = [...normalized, ...hardcodedData]
  const valid = combined.filter((m) => Number.isFinite(m.latitude) && Number.isFinite(m.longitude))

  return (
    <div style={styles.container} className="map-wrap">
      <MapContainer
        center={[VANCOUVER_CENTER.lat, VANCOUVER_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        style={styles.map}
        scrollWheelZoom
      >
        <MapController userLocation={userLocation} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* User Location Pin */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} zIndexOffset={1000}>
            <Popup>
              <div><strong>Your location</strong></div>
            </Popup>
          </Marker>
        )}

        {/* Masjid Markers */}
        {valid.map((m) => {
          const slug = String(m.name || m.id).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
          const href = m.externalUrl ? m.externalUrl : `/masjid/${slug}`

          return (
            <Marker key={m.id} position={[m.latitude, m.longitude]} icon={masjidIcon}>
              <Popup>
                <div>
                  <strong>{m.name}</strong>
                  <div>{m.address}</div>
                  <div style={{ marginTop: 8 }}>
                    <a href={href} style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>
                      View prayer times
                    </a>
                  </div>
                  {highlightMasjidId === m.id && (
                    <div style={{ marginTop: 6, color: "#059669", fontWeight: 600 }}>Nearest to you</div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

function MapController({ userLocation }) {
  const map = useMap()
  const userInteracted = useRef(false)
  const hasMovedToUser = useRef(false)

  useEffect(() => {
    // Handler to detect when user manually drags the map
    const handleDrag = () => {
      userInteracted.current = true
    }

    map.on('dragstart', handleDrag)

    return () => {
      map.off('dragstart', handleDrag)
    }
  }, [map])

  useEffect(() => {
    // Only fly to user location if:
    // 1. User location is available
    // 2. User hasn't manually dragged the map
    // 3. We haven't already moved to user (prevents continuous flying)
    if (userLocation && !userInteracted.current && !hasMovedToUser.current) {
      map.flyTo([userLocation.lat, userLocation.lng], DEFAULT_ZOOM)
      hasMovedToUser.current = true
    }
    // If no user location, map stays at Vancouver (its initial center)
  }, [userLocation, map])

  return null
}

const styles = {
  container: {
    width: "100%",
    maxWidth: 800,
    margin: "0 auto",
    height: "min(56vh, 450px)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid #f3f4f6",
    background: "white",
    zIndex: 0, // Ensure map is below overlays
  },
  map: {
    width: "100%",
    height: "100%",
  },
  empty: {
    width: "100%",
    height: "min(45vh, 300px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "white",
    border: "1px solid #f3f4f6",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: 500,
  },
}

if (typeof document !== 'undefined') {
  const responsive = document.createElement('style')
  responsive.textContent = `
    @media (max-width: 640px) {
      .map-wrap { height: min(52vh, 360px) !important; border-radius: 12px !important; }
    }
  `
  if (!document.head.querySelector('style[data-mapview-responsive]')) {
    responsive.setAttribute('data-mapview-responsive', 'true')
    document.head.appendChild(responsive)
  }
}