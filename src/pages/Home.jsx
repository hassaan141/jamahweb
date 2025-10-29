"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchMasjids } from "../services/supabase/api"
import MasjidDropdown from "../components/MasjidDropdown"
import MapView from "../components/MapView"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function Home() {
  const navigate = useNavigate()
  const [masjids, setMasjids] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState({ lat: 49.2827, lng: -123.1207 })
  const [nearestMasjidId, setNearestMasjidId] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const { data, error } = await fetchMasjids()
        if (error) throw error
        setMasjids(data)
      } catch (e) {
        console.error("Failed to load masjids:", e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      // Prefer continuous high-accuracy updates; avoid cached locations
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          })
        },
        () => {
          // Fallback to single read if watch fails
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy })
            },
            undefined,
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
          )
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      )
      return () => {
        try {
          navigator.geolocation.clearWatch(watchId)
        } catch {}
      }
    }
  }, [])

  useEffect(() => {
    if (!masjids?.length) return
    const normalized = (masjids || [])
      .map((m) => ({
        ...m,
        latitude: typeof m.latitude === "string" ? Number.parseFloat(m.latitude) : m.latitude,
        longitude: typeof m.longitude === "string" ? Number.parseFloat(m.longitude) : m.longitude,
      }))
      .filter((m) => Number.isFinite(m.latitude) && Number.isFinite(m.longitude))

    if (userLocation) {
      let best = null
      let bestD = Infinity
      for (const m of normalized) {
        const d = haversine(userLocation.lat, userLocation.lng, m.latitude, m.longitude)
        if (d < bestD) {
          bestD = d
          best = m
        }
      }
      if (best) {
        setNearestMasjidId(best.id)
        // Center map on the user's location (not the masjid)
        setMapCenter({ lat: userLocation.lat, lng: userLocation.lng })
        return
      }
    }

    if (normalized.length) {
      const centerLat = normalized.reduce((s, m) => s + m.latitude, 0) / normalized.length
      const centerLng = normalized.reduce((s, m) => s + m.longitude, 0) / normalized.length
      setMapCenter({ lat: centerLat, lng: centerLng })
    } else {
      setMapCenter({ lat: 49.2827, lng: -123.1207 })
    }
  }, [masjids, userLocation])

  const handleSelect = (m) => {
    if (m?.id) {
      const slug = slugify(m.name || String(m.id))
      navigate(`/masjid/${slug}`)
    }
  }

  function slugify(str) {
    return String(str || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // spaces to dashes
      .replace(/[^a-z0-9\-]/g, '') // remove invalid chars
      .replace(/-+/g, '-')
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <Header title="Awqat" subtitle="Vancouver Prayer Times & Masjid Finder" titleColor="#059669" />

        <main style={styles.main}>
          <div style={styles.verseWrapper}>
            <div style={styles.verseText} dir="rtl">
              وَأَنَّ ٱلْمَسَاجِدَ لِلَّهِ فَلَا تَدْعُوا مَعَ ٱللَّهِ أَحَدًا ١٨
            </div>
            <div style={styles.translationText}>
              "The places of worship are ˹only˺ for Allah, so do not invoke anyone besides Him."
            </div>
            <div style={styles.verseMeta}>Quran 72:18 • Dr. Mustafa Khattab</div>
          </div>
          <div style={styles.card}>
            <MasjidDropdown masjids={masjids} selectedMasjid={null} onSelect={handleSelect} />
            {masjids.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyTitle}>No masjids found</div>
                <div style={styles.emptyText}>Add organizations to get started</div>
              </div>
            )}
          </div>
          <MapView masjids={masjids} center={mapCenter} userLocation={userLocation} highlightMasjidId={nearestMasjidId} />
        </main>
      </div>
      <Footer />
    </div>
  )
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#fafafa",
  },
  container: {
    flex: 1,
  },
  header: {
    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    color: "white",
    padding: "32px 16px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(5, 150, 105, 0.15)",
  },
  headerContent: {
    maxWidth: 800,
    margin: "0 auto",
  },
  title: {
    margin: 0,
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: "8px 0 0",
    fontSize: 15,
    fontWeight: 400,
    opacity: 0.95,
    letterSpacing: "0.01em",
  },
  main: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "40px 16px 64px",
  },
  verseWrapper: {
    padding: "8px 0 18px",
    textAlign: "center",
    color: "#065f46",
    marginBottom: 20,
  },
  verseText: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "0.01em",
  },
  translationText: {
    marginTop: 8,
    fontSize: 15,
    color: "#374151",
    fontStyle: "italic",
  },
  verseMeta: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280",
  },
  card: {
    background: "white",
    borderRadius: 16,
    padding: "32px",
    marginBottom: 32,
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid #f3f4f6",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    gap: 16,
    background: "#fafafa",
  },
  spinner: {
    width: 48,
    height: 48,
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #059669",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#6b7280",
    fontSize: 15,
    fontWeight: 500,
  },
  emptyState: {
    textAlign: "center",
    padding: "24px 16px",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
  },
}

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (max-width: 640px) {
      .header h1 { font-size: 28px !important; }
      .header p { font-size: 14px !important; }
      main[style*="max-width: 800"] { padding: 24px 12px 40px !important; }
      div[style*="padding: 32px"][style*="border-radius: 16px"] { padding: 20px !important; }
      div[style*="font-weight: 700"][style*="letter-spacing: 0.01em"] { font-size: 18px !important; }
      div[style*="font-style: italic"] { font-size: 14px !important; }
    }
  `
  if (!document.head.querySelector("style[data-home-animations]")) {
    styleSheet.setAttribute("data-home-animations", "true")
    document.head.appendChild(styleSheet)
  }
}
