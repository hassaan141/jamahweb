"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { fetchDailyPrayerTimes, fetchOrganizationById, fetchMasjids } from "../services/supabase/api"
import PrayerTimes from "../components/PrayerTimes"
import DateBar from "../components/DateBar"
import UpcomingPrayer from "../components/UpcomingPrayer"
import DateToggle from "../components/DateToggle"
import Header from "../components/Header"
import Footer from "../components/Footer"
import DirectionsCard from "../components/DirectionsCard"
import LinksCard from "../components/LinksCard"

export default function Masjid() {
  const { slug } = useParams()
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [dayChoice, setDayChoice] = useState('today') // 'today' | 'tomorrow'
  const [org, setOrg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orgId, setOrgId] = useState(null)
  const [prayerLoading, setPrayerLoading] = useState(false)
  const [error, setError] = useState(null)

  // small slug -> id resolution helper
  function slugify(str) {
    return String(str || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
  }

  // Helper to produce YYYY-MM-DD (local)
  function toYMD(date) {
    const d = (date instanceof Date) ? date : new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  const today = new Date()
  const tomorrow = new Date(Date.now() + 24*60*60*1000)
  const selectedDate = dayChoice === 'today' ? today : tomorrow

  

  // Initial load: resolve org by slug and fetch org details
  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      try {
        const { data: masjids, error: listError } = await fetchMasjids()
        if (listError) throw listError
        const found = (masjids || []).find((o) => slugify(o.name) === slug)
        if (!found) throw new Error('Masjid not found')
        const id = found.id
        const orgRes = await fetchOrganizationById(id)
        if (orgRes.error) throw orgRes.error
        if (!active) return
        setOrgId(id)
        setOrg(orgRes.data)
      } catch (e) {
        console.error('[Masjid] error', e)
        if (!active) return
        setError(e)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [slug])

  // Fetch prayer times whenever the selected day or org id changes
  useEffect(() => {
    if (!orgId) return
    let active = true
    ;(async () => {
      setPrayerLoading(true)
      try {
        const ptRes = await fetchDailyPrayerTimes(orgId, selectedDate)
        if (ptRes.error) throw ptRes.error
        if (!active) return
        setPrayerTimes(ptRes.data)
      } catch (e) {
        console.error('[Masjid] prayer fetch error', e)
        if (!active) return
        setPrayerTimes(null)
      } finally {
        if (active) setPrayerLoading(false)
      }
    })()
    return () => { active = false }
  }, [orgId, dayChoice])

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={styles.loadingText}>Loading prayer times...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <div style={styles.errorTitle}>Unable to load prayer times</div>
          <div style={styles.errorText}>Please try again later</div>
          <Link to="/" style={styles.errorButton}>
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <Header 
          title={org?.name || "Masjid"} 
          subtitle={
            org?.address 
              ? `${org.address}, ${org.city || ''}${org.province_state ? `, ${org.province_state}` : ''}${org.country ? `, ${org.country}` : ''}`.replace(/^,+|,+$|,\s*,/g, ',').trim()
              : org?.city || ""} 
          showBack 
          backTo="/" 
        />

        <main style={styles.main}>
          <DateBar />
          {/* Desktop layout: upcoming + toggle side by side */}
          <div style={layoutStyles.upRow}>
            <div style={layoutStyles.toggleWrap}>
              <DateToggle value={dayChoice} onChange={setDayChoice} />
            </div>
            <div style={layoutStyles.upcomingWrap}>
              {prayerLoading ? (
                <div style={placeholderStyles.upcoming} aria-busy="true" aria-live="polite">Loading…</div>
              ) : (
                prayerTimes && <UpcomingPrayer prayerTimes={prayerTimes} baseDate={selectedDate} align="left" />
              )}
            </div>
          </div>
          {prayerTimes ? (
            prayerLoading ? (
              <div style={placeholderStyles.table} aria-busy="true" aria-live="polite">Loading…</div>
            ) : (
              <PrayerTimes prayerTimes={prayerTimes} />
            )
          ) : (
            <div style={styles.emptyCard}>
              <div style={styles.emptyTitle}>No prayer times available</div>
              <div style={styles.emptyText}>Please check back later</div>
            </div>
          )}
          {org ? <DirectionsCard org={org} /> : null}
          {org ? <LinksCard org={org} /> : null}
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
    overflowX: "hidden",
  },
  container: {
    flex: 1,
    overflowX: "hidden",
  },
  header: {
    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    color: "white",
    padding: "24px 16px 32px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(5, 150, 105, 0.15)",
  },
  headerContent: {
    maxWidth: 800,
    margin: "0 auto",
    position: "relative",
  },
  backLink: {
    color: "white",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.15)",
    transition: "all 0.2s ease",
    marginBottom: 16,
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  backArrow: {
    fontSize: 16,
  },
  title: {
    margin: "12px 0 0",
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: "8px 0 0",
    fontSize: 15,
    fontWeight: 400,
    opacity: 0.95,
  },
  main: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "12px 12px 48px",
    overflowX: "hidden",
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
  errorContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: 16,
    background: "#fafafa",
  },
  errorCard: {
    background: "white",
    borderRadius: 16,
    padding: "40px 32px",
    textAlign: "center",
    maxWidth: 400,
    width: "100%",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    border: "1px solid #fee2e2",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#dc2626",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
    lineHeight: 1.6,
  },
  errorButton: {
    display: "inline-block",
    padding: "12px 24px",
    background: "#059669",
    color: "white",
    textDecoration: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(5, 150, 105, 0.2)",
  },
  emptyCard: {
    background: "white",
    border: "1px solid #f3f4f6",
    borderRadius: 16,
    padding: "48px 32px",
    textAlign: "center",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
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

// Layout styles for top row (upcoming + toggle)
const layoutStyles = {
  upRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'stretch',
    justifyContent: 'center',
    marginBottom: 4,
  },
  upcomingWrap: { display: 'flex', flex: '0 1 auto', alignItems: 'stretch' },
  toggleWrap: { display: 'flex', alignItems: 'center', flex: '0 0 auto' },
}

// Inline placeholders while only the prayer area is loading
const placeholderStyles = {
  upcoming: {
    maxWidth: 400,
    padding: '12px 16px',
    borderRadius: 16,
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    fontWeight: 700,
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(5,150,105,0.06)'
  },
  table: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    maxWidth: 600,
    margin: '0 auto',
    padding: '24px',
    textAlign: 'center',
    color: '#9ca3af',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
  }
}

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    a[style*="backLink"]:hover {
      background: rgba(255, 255, 255, 0.25) !important;
    }
    a[style*="errorButton"]:hover {
      background: #047857 !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3) !important;
    }
    @media (max-width: 640px) {
      .header h1 { font-size: 24px !important; }
      main[style*="max-width: 800"] { padding: 16px 10px 32px !important; }
      div[style*="padding: 48px 32px"][style*="text-align: center"] { padding: 24px 18px !important; }
      /* Stack upcoming and toggle full width */
      div[style*="flex-wrap: wrap"][style*="gap: 8px"] { flex-direction: column !important; }
      div[style*="flex-wrap: wrap"][style*="gap: 8px"] > div { width: 100% !important; }
    }
  `
  if (!document.head.querySelector("style[data-masjid-styles]")) {
    styleSheet.setAttribute("data-masjid-styles", "true")
    document.head.appendChild(styleSheet)
  }
}
