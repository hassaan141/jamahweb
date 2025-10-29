import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Default icon fix for Leaflet in bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

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

export default function MapView({ masjids = [], center, userLocation, highlightMasjidId }) {
  const normalized = (masjids || []).map((m) => ({
    ...m,
    latitude: typeof m.latitude === "string" ? Number.parseFloat(m.latitude) : m.latitude,
    longitude: typeof m.longitude === "string" ? Number.parseFloat(m.longitude) : m.longitude,
  }))
  const valid = normalized.filter((m) => Number.isFinite(m.latitude) && Number.isFinite(m.longitude))

  if (process.env.NODE_ENV !== "production") {
    const invalid = normalized.filter((m) => !Number.isFinite(m.latitude) || !Number.isFinite(m.longitude))
    if (invalid.length) {
      // eslint-disable-next-line no-console
      console.warn(
        "Filtered masjids without valid coordinates:",
        invalid.map((m) => ({ id: m.id, name: m.name, latitude: m.latitude, longitude: m.longitude })),
      )
    }
  }

  if (valid.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyText}>No locations to display</div>
      </div>
    )
  }

  const fallbackLat = valid.reduce((s, m) => s + m.latitude, 0) / valid.length
  const fallbackLng = valid.reduce((s, m) => s + m.longitude, 0) / valid.length
  const centerLat = center?.lat ?? fallbackLat
  const centerLng = center?.lng ?? fallbackLng

  return (
    <div style={styles.container}>
      <MapContainer center={[centerLat, centerLng]} zoom={13} style={styles.map} scrollWheelZoom>
        <Recenter center={[centerLat, centerLng]} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <div>
                <strong>Your location</strong>
              </div>
            </Popup>
          </Marker>
        )}
        {valid.map((m) => {
          const slug = String(m.name || m.id)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
            .replace(/-+/g, '-')
          const href = `/masjid/${slug}`
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

function Recenter({ center }) {
  const map = useMap()
  if (center && Array.isArray(center) && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
    map.setView(center)
  }
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