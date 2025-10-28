import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Default icon fix for Leaflet in bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export default function MapView({ masjids = [] }) {
  const normalized = (masjids || [])
    .map(m => ({
      ...m,
      latitude: typeof m.latitude === 'string' ? parseFloat(m.latitude) : m.latitude,
      longitude: typeof m.longitude === 'string' ? parseFloat(m.longitude) : m.longitude,
    }))
  const valid = normalized.filter(m => Number.isFinite(m.latitude) && Number.isFinite(m.longitude))

  if (process.env.NODE_ENV !== 'production') {
    const invalid = normalized.filter(m => !Number.isFinite(m.latitude) || !Number.isFinite(m.longitude))
    if (invalid.length) {
      // eslint-disable-next-line no-console
      console.warn('Filtered masjids without valid coordinates:', invalid.map(m => ({ id: m.id, name: m.name, latitude: m.latitude, longitude: m.longitude })))
    }
  }

  if (valid.length === 0) {
    return (
      <div style={styles.empty}>No map data</div>
    )
  }

  const centerLat = valid.reduce((s, m) => s + m.latitude, 0) / valid.length
  const centerLng = valid.reduce((s, m) => s + m.longitude, 0) / valid.length

  return (
    <div style={styles.container}>
      <MapContainer center={[centerLat, centerLng]} zoom={12} style={styles.map} scrollWheelZoom>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {valid.map(m => (
          <Marker key={m.id} position={[m.latitude, m.longitude]}>
            <Popup>
              <div>
                <strong>{m.name}</strong>
                <div>{m.address}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

const styles = {
  container: { width: '100%', height: 500, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: 20 },
  map: { width: '100%', height: '100%' },
  empty: { width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 8 }
}
