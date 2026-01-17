"use client"
import { useEffect, useState, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { fetchDailyPrayerTimes, fetchOrganizationById, fetchMasjids } from "../services/supabase/api"
import { clearPrayerTimeCache } from "../services/supabase/cache"
import PrayerTimesHorizontal from "../components/PrayerTimesHorizontal"
import moment from "moment-hijri"

// Helper to get today's date string (YYYY-MM-DD) for comparison
function getTodayString() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function MasjidHorizontal() {
    const { slug } = useParams()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [orgId, setOrgId] = useState(null)
    const [org, setOrg] = useState(null)
    const [prayerTimes, setPrayerTimes] = useState(null)
    const [loading, setLoading] = useState(true)
    const [tick, setTick] = useState(0)
    // Track today's date as state so it updates daily
    const [todayStr, setTodayStr] = useState(getTodayString)

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

    // Derive selectedDate from todayStr state (updates when todayStr changes)
    const selectedDate = useMemo(() => {
        const [y, m, d] = todayStr.split('-').map(Number)
        return new Date(y, m - 1, d)
    }, [todayStr])

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

    // Auto-refresh prayer times at 1:00 AM (after GitLab action updates DB ~12:35 AM)
    useEffect(() => {
        function msUntil1AM() {
            const now = new Date()
            const target = new Date(now)
            target.setHours(1, 0, 0, 0) // 1:00 AM

            // If we've already passed 1:00 AM today, target tomorrow's 1:00 AM
            if (now >= target) {
                target.setDate(target.getDate() + 1)
            }

            return target.getTime() - now.getTime()
        }

        function scheduleRefresh() {
            const delay = msUntil1AM()
            return setTimeout(() => {
                // Clear cache to force fresh data from database
                clearPrayerTimeCache()
                // Update date state - this triggers re-fetch via dependency
                setTodayStr(getTodayString())
                // Schedule next day's refresh
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

        // Sequence: Adhan → Iqamah → next Adhan → next Iqamah...
        // Sunrise has no iqamah
        const TIMES = [
            { name: "Fajr", type: "Adhan", field: "fajr_azan" },
            { name: "Fajr", type: "Iqamah", field: "fajr_iqamah" },
            { name: "Sunrise", type: null, field: "sunrise" },
            { name: "Dhuhr", type: "Adhan", field: "dhuhr_azan" },
            { name: "Dhuhr", type: "Iqamah", field: "dhuhr_iqamah" },
            { name: "Asr", type: "Adhan", field: "asr_azan" },
            { name: "Asr", type: "Iqamah", field: "asr_iqamah" },
            { name: "Maghrib", type: "Adhan", field: "maghrib_azan" },
            { name: "Maghrib", type: "Iqamah", field: "maghrib_iqamah" },
            { name: "Isha", type: "Adhan", field: "isha_azan" },
            { name: "Isha", type: "Iqamah", field: "isha_iqamah" },
        ]

        const now = moment()

        // Find the first time that is still in the future
        for (const { name, type, field } of TIMES) {
            const raw = prayerTimes[field]
            const prayerTime = toMomentFor(raw)
            if (!prayerTime || !prayerTime.isValid()) continue

            if (prayerTime.isAfter(now)) {
                const label = type ? `${name} ${type}` : name
                return { name, type, label, at: prayerTime, raw }
            }
        }

        // All times have passed - return tomorrow's Fajr Adhan
        const fajrRaw = prayerTimes.fajr_azan
        const tomorrowFajr = toMomentFor(fajrRaw)
        if (tomorrowFajr && tomorrowFajr.isValid()) {
            tomorrowFajr.add(1, "day")
            return { name: "Fajr", type: "Adhan", label: "Fajr Adhan", at: tomorrowFajr, raw: fajrRaw }
        }

        return null
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Get Hijri date
    const hijriDate = moment().format('iD iMMMM iYYYY')

    if (loading) {
        return (
            <div style={styles.loadingScreen}>
                <div style={styles.loadingContent}>
                    <div style={styles.loadingSpinner}></div>
                    <p style={styles.loadingText}>Loading Prayer Times...</p>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.pageWrapper}>
            {/* Decorative background pattern */}
            <div style={styles.bgPattern} />

            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <div style={styles.headerLeft}>
                        {/* Mosque icon */}
                        <div style={styles.logoContainer}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 3L2 12h3v9h14v-9h3L12 3z" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 7a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                        </div>
                        <div>
                            <h1 style={styles.brandName}>{org?.name}</h1>
                            <p style={styles.brandAddress}>{org?.address}</p>
                        </div>
                    </div>
                    <div style={styles.clockContainer}>
                        <div style={styles.time}>
                            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            <span style={styles.seconds}>
                                :{String(currentTime.getSeconds()).padStart(2, '0')}
                            </span>
                        </div>
                        <div style={styles.dateContainer}>
                            <div style={styles.gregorianDate}>
                                {currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                            </div>
                            <div style={styles.hijriDate}>{hijriDate} AH</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={styles.mainContent}>
                {/* Next Prayer Banner */}
                {nextPrayer && (
                    <div style={styles.nextPrayerBanner}>
                        <div style={styles.bannerGlow} />
                        <div style={styles.nextPrayerContent}>
                            <div style={styles.nextPrayerLeft}>
                                <div style={styles.nextPrayerIcon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </div>
                                <div style={styles.nextPrayerInfo}>
                                    <span style={styles.nextPrayerLabel}>NEXT PRAYER</span>
                                    <span style={styles.nextPrayerName}>{nextPrayer.label}</span>
                                </div>
                            </div>
                            <div style={styles.countdownSection}>
                                <div style={styles.countdownBox}>
                                    <span style={styles.countdownLabel}>TIME REMAINING</span>
                                    <span style={styles.countdownValue}>{formatCountdown(diffMs)}</span>
                                </div>
                                <div style={styles.atTimeBox}>
                                    <span style={styles.atTimeLabel}>AT</span>
                                    <span style={styles.atTimeValue}>{nextPrayer.at.format("h:mm A")}</span>
                                </div>
                            </div>
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
                <div style={styles.footerLeft}>
                    <span style={styles.footerBadge}>TV DISPLAY</span>
                    <span style={styles.footerText}>Auto-updates daily at 1:00 AM</span>
                </div>
                <Link to={`/masjid/${slug}`} style={styles.backBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Exit TV Mode
                </Link>
            </footer>
        </div>
    )
}

const styles = {
    pageWrapper: {
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 30%, #f8fafc 100%)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
    },

    bgPattern: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(22, 163, 74, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(22, 163, 74, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(22, 163, 74, 0.02) 0%, transparent 70%)
        `,
        pointerEvents: "none",
    },

    loadingScreen: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)",
    },
    loadingContent: {
        textAlign: "center",
    },
    loadingSpinner: {
        width: "56px",
        height: "56px",
        border: "4px solid #dcfce7",
        borderTopColor: "#16a34a",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        margin: "0 auto",
    },
    loadingText: {
        marginTop: "20px",
        fontSize: "18px",
        color: "#166534",
        fontWeight: "600",
        letterSpacing: "0.02em",
    },

    header: {
        background: "linear-gradient(135deg, #166534 0%, #15803d 50%, #16a34a 100%)",
        padding: "0",
        color: "white",
        position: "relative",
        boxShadow: "0 4px 20px rgba(22, 101, 52, 0.25)",
    },
    headerContent: {
        padding: "28px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
    },
    logoContainer: {
        width: "64px",
        height: "64px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.2)",
    },
    brandName: {
        fontSize: "32px",
        margin: 0,
        fontWeight: "800",
        letterSpacing: "-0.02em",
        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    brandAddress: {
        fontSize: "15px",
        margin: "6px 0 0",
        opacity: 0.9,
        fontWeight: "500",
    },
    clockContainer: {
        textAlign: "right",
    },
    time: {
        fontSize: "64px",
        fontWeight: "800",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.02em",
        textShadow: "0 2px 8px rgba(0,0,0,0.15)",
    },
    seconds: {
        fontSize: "32px",
        fontWeight: "600",
        opacity: 0.7,
    },
    dateContainer: {
        marginTop: "8px",
    },
    gregorianDate: {
        fontSize: "15px",
        opacity: 0.95,
        fontWeight: "500",
    },
    hijriDate: {
        fontSize: "14px",
        opacity: 0.8,
        marginTop: "2px",
        fontStyle: "italic",
    },

    mainContent: {
        flex: 1,
        padding: "40px 48px",
        display: "flex",
        flexDirection: "column",
        gap: "36px",
        position: "relative",
        zIndex: 1,
    },

    nextPrayerBanner: {
        background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
        borderRadius: "24px",
        padding: "0",
        boxShadow: "0 4px 24px rgba(22, 163, 74, 0.12), 0 1px 3px rgba(0,0,0,0.04)",
        border: "1px solid rgba(22, 163, 74, 0.15)",
        position: "relative",
        overflow: "hidden",
    },
    bannerGlow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: "linear-gradient(90deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)",
    },
    nextPrayerContent: {
        padding: "28px 36px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    nextPrayerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
    },
    nextPrayerIcon: {
        width: "52px",
        height: "52px",
        borderRadius: "14px",
        background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#166534",
    },
    nextPrayerInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    nextPrayerLabel: {
        fontSize: "12px",
        fontWeight: "700",
        color: "#16a34a",
        letterSpacing: "0.1em",
    },
    nextPrayerName: {
        fontSize: "28px",
        fontWeight: "800",
        color: "#166534",
        letterSpacing: "-0.01em",
    },
    countdownSection: {
        display: "flex",
        alignItems: "center",
        gap: "24px",
    },
    countdownBox: {
        background: "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
        padding: "16px 28px",
        borderRadius: "16px",
        textAlign: "center",
        boxShadow: "0 4px 16px rgba(22, 101, 52, 0.25)",
    },
    countdownLabel: {
        display: "block",
        fontSize: "10px",
        fontWeight: "700",
        color: "rgba(255,255,255,0.8)",
        letterSpacing: "0.12em",
        marginBottom: "4px",
    },
    countdownValue: {
        fontSize: "36px",
        fontWeight: "800",
        color: "white",
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.02em",
        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    atTimeBox: {
        textAlign: "center",
    },
    atTimeLabel: {
        display: "block",
        fontSize: "10px",
        fontWeight: "700",
        color: "#9ca3af",
        letterSpacing: "0.12em",
        marginBottom: "4px",
    },
    atTimeValue: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#374151",
        fontVariantNumeric: "tabular-nums",
    },

    prayerSection: {
        flex: 1,
        display: "flex",
        alignItems: "center",
    },

    footer: {
        padding: "18px 48px",
        background: "white",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        zIndex: 1,
    },
    footerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    footerBadge: {
        background: "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
        color: "white",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "0.1em",
        padding: "6px 12px",
        borderRadius: "6px",
    },
    footerText: {
        fontSize: "13px",
        color: "#6b7280",
    },
    backBtn: {
        fontSize: "14px",
        color: "#6b7280",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 18px",
        borderRadius: "10px",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        transition: "all 0.2s ease",
        fontWeight: "600",
    },
}

if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style")
    styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    a[style*="backBtn"]:hover {
      background: #f3f4f6 !important;
      border-color: #d1d5db !important;
      color: #374151 !important;
    }
  `
    if (!document.head.querySelector("style[data-masjid-horizontal-styles]")) {
        styleSheet.setAttribute("data-masjid-horizontal-styles", "true")
        document.head.appendChild(styleSheet)
    }
}


