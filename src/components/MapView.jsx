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

// 1. Define your fallback center here (e.g., London, NY, or your specific city)
// This fulfills the "center in lat long I provide" requirement.
const DEFAULT_CENTER = { lat: 51.505, lng: -0.09 } // Change these to your default coordinates
const DEFAULT_ZOOM = 13 // Zoom 13 is roughly a 10km radius view

export default function MapView({ masjids = [], center, userLocation, highlightMasjidId }) {
  const normalized = (masjids || []).map((m) => ({
    ...m,
    latitude: typeof m.latitude === "string" ? Number.parseFloat(m.latitude) : m.latitude,
    longitude: typeof m.longitude === "string" ? Number.parseFloat(m.longitude) : m.longitude,
  }))

  const combined = [...normalized, ...hardcodedData]
  const valid = combined.filter((m) => Number.isFinite(m.latitude) && Number.isFinite(m.longitude))

  // 2. Determine the Map Center priority: User > Provided Prop > Hardcoded Default
  const mapCenterLat = userLocation?.lat ?? center?.lat ?? DEFAULT_CENTER.lat
  const mapCenterLng = userLocation?.lng ?? center?.lng ?? DEFAULT_CENTER.lng
  
  // If we are using the fallback (no user location), we ensure the zoom is set to the 10km radius level
  const zoomLevel = DEFAULT_ZOOM

  return (
    <div style={styles.container} className="map-wrap">
      <MapContainer 
        center={[mapCenterLat, mapCenterLng]} 
        zoom={zoomLevel} 
        style={styles.map} 
        scrollWheelZoom
      >
        <MapController 
          center={{ lat: mapCenterLat, lng: mapCenterLng }} 
          userLocation={userLocation} 
          zoom={zoomLevel}
        />
        
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

function MapController({ center, userLocation, zoom }) {
  const map = useMap()
  const userInteracted = useRef(false)

  useEffect(() => {
    // Handler to detect when user manually drags the map
    const handleDrag = () => {
      userInteracted.current = true
    }
    
    // which would break the centering logic unnecessarily.
    map.on('dragstart', handleDrag)

    // Cleanup listener on unmount
    return () => {
      map.off('dragstart', handleDrag)
    }
  }, [map])

  useEffect(() => {
    if (userLocation) {
      // If user hasn't dragged away, keep the map centered on them
      if (!userInteracted.current) {
        map.flyTo([userLocation.lat, userLocation.lng], zoom)
      }
    } else {
      // Fallback center (instant jump)
      map.setView([center.lat, center.lng], zoom)
    }
  }, [userLocation, center, zoom, map])

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