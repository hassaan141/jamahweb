"use client"

import { useEffect, useState } from "react"
import { useParams, useLocation, Link } from "react-router-dom"
import { fetchDailyPrayerTimes, fetchOrganizationById, fetchMasjids } from "../services/supabase/api"
import PrayerTimes from "../components/PrayerTimes"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function Masjid() {
  const { slug } = useParams()
  const location = useLocation()
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [org, setOrg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // small slug -> id resolution helper
  function slugify(str) {
    return String(str || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-')
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        // Resolve organization by slug only (no id in URL)
        const { data: masjids, error: listError } = await fetchMasjids()
        if (listError) throw listError
        const found = (masjids || []).find((o) => slugify(o.name) === slug)
        if (!found) throw new Error('Masjid not found')
        const orgId = found.id

        const [ptRes, orgRes] = await Promise.all([fetchDailyPrayerTimes(orgId), fetchOrganizationById(orgId)])
        console.log('[Masjid] resolved id =', orgId)
        console.log('[Masjid] prayerTimes result =', ptRes)
        console.log('[Masjid] organization result =', orgRes)
        if (ptRes.error) throw ptRes.error
        if (orgRes.error) throw orgRes.error
        setPrayerTimes(ptRes.data)
        setOrg(orgRes.data)
      } catch (e) {
        console.error('[Masjid] error', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

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
          <div style={styles.errorText}>{String(error?.message || "Please try again later")}</div>
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
          {prayerTimes ? (
            <PrayerTimes prayerTimes={prayerTimes} />
          ) : (
            <div style={styles.emptyCard}>
              <div style={styles.emptyTitle}>No prayer times available</div>
              <div style={styles.emptyText}>Please check back later</div>
            </div>
          )}
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
    padding: "40px 16px 64px",
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
      main[style*="max-width: 800"] { padding: 24px 12px 40px !important; }
      div[style*="padding: 48px 32px"][style*="text-align: center"] { padding: 28px 20px !important; }
    }
  `
  if (!document.head.querySelector("style[data-masjid-styles]")) {
    styleSheet.setAttribute("data-masjid-styles", "true")
    document.head.appendChild(styleSheet)
  }
}
