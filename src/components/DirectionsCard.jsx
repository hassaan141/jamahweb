"use client"

export default function DirectionsCard({ org }) {
  if (!org) return null

  const name = org.name || 'Destination'
  const lat = typeof org.latitude === 'number' ? org.latitude : parseFloat(org.latitude)
  const lng = typeof org.longitude === 'number' ? org.longitude : parseFloat(org.longitude)
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
  const addressParts = [org.address, org.city, org.province_state, org.country].filter(Boolean)
  const address = addressParts.join(', ')

  function openMaps() {
    try {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window).MSStream
      const label = encodeURIComponent(name)
      const coords = hasCoords ? `${lat},${lng}` : null
      const q = address ? encodeURIComponent(address) : null

      // Platform-specific URLs
      const apple = hasCoords
        ? `https://maps.apple.com/?daddr=${coords}&q=${label}`
        : q
          ? `https://maps.apple.com/?q=${q}`
          : null

      // Prefer address for Google Maps; fallback to coords
      const google = q
        ? `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`
        : coords
          ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}&travelmode=driving`
          : null

      const url = isIOS ? apple : google
      if (url) window.open(url, isIOS ? '_self' : '_blank')
    } catch (e) {
      // no-op
    }
  }

  return (
    <div style={styles.card} className="directions-card">
      <div style={styles.row} className="directions-row">
        <div style={styles.info} className="directions-info">
          <div style={styles.title}>{name}</div>
          {address ? <div style={styles.subtitle}>{address}</div> : null}
          {hasCoords ? (
            <div style={styles.coords}>Lat: {lat.toFixed(5)} • Lng: {lng.toFixed(5)}</div>
          ) : null}
        </div>
        <button type="button" onClick={openMaps} style={styles.button} className="directions-btn">
          Open in Maps
        </button>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    maxWidth: 550,
    margin: '12px auto 0',
    padding: 16,
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  info: { display: 'flex', flexDirection: 'column' },
  title: { fontSize: 16, fontWeight: 700, color: '#065f46' },
  subtitle: { fontSize: 14, color: '#4b5563', marginTop: 4 },
  coords: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  button: {
    background: '#059669',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 999,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
  },
}

if (typeof document !== 'undefined') {
  const responsive = document.createElement('style')
  responsive.textContent = `
    @media (max-width: 640px) {
      .directions-row { flex-direction: column !important; align-items: stretch !important; }
      .directions-btn { width: 100% !important; padding: 12px 16px !important; }
      div[style*="Lat:"] { display: none !important; }
      .directions-card { width: 100% !important; margin: 12px 0 0 0 !important; }
    }
    .directions-btn:hover {
      filter: brightness(0.95);
      transform: translateY(-1px);
    }
  `
  if (!document.head.querySelector('style[data-directions-card-responsive]')) {
    responsive.setAttribute('data-directions-card-responsive', 'true')
    document.head.appendChild(responsive)
  }
}
