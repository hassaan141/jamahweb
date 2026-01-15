"use client"
import { useEffect, useState, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { fetchDailyPrayerTimes, fetchOrganizationById, fetchMasjids } from "../services/supabase/api"
import PrayerTimesHorizontal from "../components/PrayerTimesHorizontal"
import moment from "moment-hijri"

export default function MasjidHorizontal() {
    const { slug } = useParams()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [orgId, setOrgId] = useState(null)
    const [org, setOrg] = useState(null)
    const [prayerTimes, setPrayerTimes] = useState(null)
    const [loading, setLoading] = useState(true)
    const [tick, setTick] = useState(0)

    // Clock timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Countdown ticker
    useEffect(() => {
        const iv = setInterval(() => setTick((t) => t + 1), 1000)
        return () => clearInterval(iv)
    }, [])

    // Always fetch today's prayer times for TV display
    const selectedDate = useMemo(() => new Date(), [])

    // Resolve org by slug
    useEffect(() => {
        let active = true
            ; (async () => {
                try {
                    const { data: masjids, error: listError } = await fetchMasjids()
                    if (listError) throw listError
                    const slugify = (str) => String(str || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
                    const found = (masjids || []).find((o) => slugify(o.name) === slug)
                    if (!found) throw new Error('Masjid not found')
                    if (!active) return
                    setOrgId(found.id)
                } catch (e) {
                    console.error('[MasjidHorizontal] error', e)
                }
            })()
        return () => { active = false }
    }, [slug])

    // Fetch organization details
    useEffect(() => {
        if (!orgId) return
        let active = true
            ; (async () => {
                try {
                    const orgRes = await fetchOrganizationById(orgId)
                    if (orgRes.error) throw orgRes.error
                    if (!active) return
                    setOrg(orgRes.data)
                } catch (e) {
                    console.error('[MasjidHorizontal] org fetch error', e)
                }
            })()
        return () => { active = false }
    }, [orgId])

    // Fetch prayer times
    useEffect(() => {
        if (!orgId) return
        let active = true
            ; (async () => {
                try {
                    const ptRes = await fetchDailyPrayerTimes(orgId, selectedDate)
                    if (ptRes.error) throw ptRes.error
                    if (!active) return
                    setPrayerTimes(ptRes.data)
                } catch (e) {
                    console.error('[MasjidHorizontal] prayer fetch error', e)
                } finally {
                    if (active) setLoading(false)
                }
            })()
        return () => { active = false }
    }, [orgId, selectedDate])

    // Auto-refresh prayer times at midnight
    useEffect(() => {
        function msUntilMidnight() {
            const now = new Date()
            const target = new Date(now)
            target.setHours(24, 0, 10, 0) // 12:00:10 AM next day
            return target.getTime() - now.getTime()
        }

        function scheduleRefresh() {
            const delay = msUntilMidnight()
            return setTimeout(() => {
                // Force re-fetch by clearing prayer times
                setPrayerTimes(null)
                setLoading(true)
                // Schedule next refresh
                scheduleRefresh()
            }, delay)
        }

        const timeoutId = scheduleRefresh()
        return () => clearTimeout(timeoutId)
    }, [])

    const nextPrayer = useMemo(() => {
        if (!prayerTimes) return null

        function parseHHMM(str) {
            const s = (str == null ? "" : String(str)).trim()
            if (!s || s === "-") return null
            const match = s.match(/(\d{1,2}):(\d{2})/)
            if (!match) return null
            return { h: Number.parseInt(match[1], 10), m: Number.parseInt(match[2], 10) }
        }

        // Helper: build a moment for today with given time
        function toMomentFor(timeStr) {
            const parsed = parseHHMM(timeStr)
            if (!parsed) return null
            return moment().startOf('day').hour(parsed.h).minute(parsed.m).second(0)
        }

        const PRAYERS = [
            { name: "Fajr", field: "fajr_azan" },
            { name: "Sunrise", field: "sunrise" },
            { name: "Dhuhr", field: "dhuhr_azan" },
            { name: "Asr", field: "asr_azan" },
            { name: "Maghrib", field: "maghrib_azan" },
            { name: "Isha", field: "isha_azan" },
        ]

        const now = moment()

        // Find the first prayer that is still in the future
        for (const { name, field } of PRAYERS) {
            const raw = prayerTimes[field]
            const prayerTime = toMomentFor(raw)
            if (!prayerTime || !prayerTime.isValid()) continue

            // Prayer must be in the future to be "next"
            if (prayerTime.isAfter(now)) {
                return { name, at: prayerTime, raw }
            }
        }

        // All prayers have passed - return tomorrow's Fajr
        const fajrRaw = prayerTimes.fajr_azan
        const tomorrowFajr = toMomentFor(fajrRaw)
        if (tomorrowFajr && tomorrowFajr.isValid()) {
            tomorrowFajr.add(1, "day")
            return { name: "Fajr", at: tomorrowFajr, raw: fajrRaw }
        }

        return null
    }, [prayerTimes, tick])  // tick MUST be here to recalculate every second!

    function formatCountdown(diffMs) {
        const totalSeconds = Math.floor(diffMs / 1000)
        // Ensure we never show negative values
        if (totalSeconds <= 0) {
            return "00h 00m 00s"
        }
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        const pad = (n) => String(n).padStart(2, "0")
        return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
    }

    const diffMs = nextPrayer ? nextPrayer.at.diff(moment()) : 0

    if (loading) {
        return (
            <div style={styles.loadingScreen}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Loading Prayer Times...</p>
            </div>
        )
    }

    return (
        <div style={styles.pageWrapper}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <div>
                        <h1 style={styles.brandName}>{org?.name}</h1>
                        <p style={styles.brandAddress}>{org?.address}</p>
                    </div>
                </div>
                <div style={styles.clockContainer}>
                    <div style={styles.time}>{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    <div style={styles.date}>
                        {currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={styles.mainContent}>
                {/* Next Prayer Banner - Integrated */}
                {nextPrayer && (
                    <div style={styles.nextPrayerBanner}>
                        <div style={styles.nextPrayerLeft}>
                            <span style={styles.nextPrayerLabel}>Next Prayer</span>
                            <span style={styles.nextPrayerName}>{nextPrayer.name}</span>
                            <span style={styles.nextPrayerTime}>{nextPrayer.at.format("h:mm A")}</span>
                        </div>
                        <div style={styles.countdownContainer}>
                            <span style={styles.countdownLabel}>Time Remaining</span>
                            <span style={styles.countdownValue}>{formatCountdown(diffMs)}</span>
                        </div>
                    </div>
                )}

                {/* Prayer Times Grid */}
                <div style={styles.prayerSection}>
                    <PrayerTimesHorizontal prayerTimes={prayerTimes} nextPrayerName={nextPrayer?.name} />
                </div>
            </main>

            {/* Footer */}
            <footer style={styles.footer}>
                <span style={styles.footerText}>TV Display Mode</span>
                <Link to={`/masjid/${slug}`} style={styles.backBtn}>
                    Exit TV Mode
                </Link>
            </footer>
        </div>
    )
}

const styles = {
    pageWrapper: {
        minHeight: "100vh",
        background: "#f8faf9",
        display: "flex",
        flexDirection: "column",
    },

    loadingScreen: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8faf9",
    },
    loadingSpinner: {
        width: "48px",
        height: "48px",
        border: "4px solid #e2e8f0",
        borderTopColor: "#166534",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },
    loadingText: {
        marginTop: "16px",
        fontSize: "18px",
        color: "#64748b",
        fontWeight: "500",
    },

    header: {
        background: "#166534",
        padding: "28px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    brandName: {
        fontSize: "28px",
        margin: 0,
        fontWeight: "700",
    },
    brandAddress: {
        fontSize: "14px",
        margin: "4px 0 0",
        opacity: 0.85,
    },
    clockContainer: {
        textAlign: "right",
    },
    time: {
        fontSize: "48px",
        fontWeight: "700",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
    },
    date: {
        fontSize: "14px",
        opacity: 0.85,
        marginTop: "4px",
    },

    mainContent: {
        flex: 1,
        padding: "32px 48px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
    },

    nextPrayerBanner: {
        background: "white",
        borderRadius: "16px",
        padding: "24px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: "1px solid #e5e7eb",
    },
    nextPrayerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "24px",
    },
    nextPrayerLabel: {
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase",
        color: "#6b7280",
        letterSpacing: "0.05em",
    },
    nextPrayerName: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#166534",
    },
    nextPrayerTime: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#374151",
    },
    countdownContainer: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: "#f0fdf4",
        padding: "12px 24px",
        borderRadius: "12px",
        border: "1px solid #bbf7d0",
    },
    countdownLabel: {
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase",
        color: "#166534",
        letterSpacing: "0.05em",
    },
    countdownValue: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#166534",
        fontVariantNumeric: "tabular-nums",
    },

    prayerSection: {
        flex: 1,
        display: "flex",
        alignItems: "center",
    },

    footer: {
        padding: "16px 48px",
        background: "white",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerText: {
        fontSize: "13px",
        color: "#9ca3af",
    },
    backBtn: {
        fontSize: "13px",
        color: "#6b7280",
        textDecoration: "none",
    },
}

if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style")
    styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
    if (!document.head.querySelector("style[data-masjid-horizontal-styles]")) {
        styleSheet.setAttribute("data-masjid-horizontal-styles", "true")
        document.head.appendChild(styleSheet)
    }
}


