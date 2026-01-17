"use client"
import moment from "moment-hijri"

// Prayer icons (simple SVG paths)
const prayerIcons = {
  fajr: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  sunrise: "M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m12.728 0l-1.414 1.414M7.05 16.95l-1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z",
  dhuhr: "M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657L5.636 5.636m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z",
  asr: "M12 3v1m0 16v1m9-9h-1M4 12H3M17.657 6.343l.707-.707M5.636 18.364l.707-.707m0-12.021l-.707-.707m12.728 12.728l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z",
  maghrib: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  isha: "M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z",
}

export default function PrayerTimesHorizontal({ prayerTimes, nextPrayerName = null }) {
  if (!prayerTimes) return null

  function parseHHMM(str) {
    const s = (str == null ? "" : String(str)).trim()
    if (!s || s === "-") return null
    const match = s.match(/(\d{1,2}):(\d{2})/)
    if (!match) return null
    return { h: Number.parseInt(match[1], 10), m: Number.parseInt(match[2], 10) }
  }

  function formatTime(timeStr) {
    const parsed = parseHHMM(timeStr)
    if (!parsed) return "-"
    return moment().hour(parsed.h).minute(parsed.m).format("h:mm A")
  }

  const prayerKeys = [
    { key: "fajr", name: "Fajr", azanKey: "fajr_azan", iqamahKey: "fajr_iqamah" },
    { key: "sunrise", name: "Sunrise", azanKey: "sunrise", iqamahKey: null, showIqamah: false },
    { key: "dhuhr", name: "Dhuhr", azanKey: "dhuhr_azan", iqamahKey: "dhuhr_iqamah" },
    { key: "asr", name: "Asr", azanKey: "asr_azan", iqamahKey: "asr_iqamah" },
    { key: "maghrib", name: "Maghrib", azanKey: "maghrib_azan", iqamahKey: "maghrib_iqamah" },
    { key: "isha", name: "Isha", azanKey: "isha_azan", iqamahKey: "isha_iqamah" },
  ]

  const prayers = prayerKeys
    .map(({ key, name, azanKey, iqamahKey, showIqamah = true }) => {
      const azan = prayerTimes[azanKey]
      const iqamah = showIqamah ? prayerTimes[iqamahKey] : null
      const isNext = nextPrayerName === name

      return {
        key,
        name,
        adhan: formatTime(azan),
        iqamah: showIqamah ? formatTime(iqamah) : null,
        showIqamah,
        isNext,
      }
    })
    .filter((p) => p.adhan !== "-")

  return (
    <div style={styles.gridContainer}>
      {prayers.map((prayer, index) => (
        <div
          key={prayer.key}
          style={{
            ...styles.prayerCard,
            ...(prayer.isNext ? styles.prayerCardActive : {}),
            animationDelay: `${index * 0.1}s`,
          }}
        >
          {/* Decorative top accent */}
          <div style={{
            ...styles.topAccent,
            ...(prayer.isNext ? styles.topAccentActive : {}),
          }} />

          {/* Icon */}
          <div style={{
            ...styles.iconContainer,
            ...(prayer.isNext ? styles.iconContainerActive : {}),
          }}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={prayerIcons[prayer.key]} />
            </svg>
          </div>

          {/* Prayer Name */}
          <div style={{
            ...styles.prayerTitle,
            ...(prayer.isNext ? styles.prayerTitleActive : {}),
          }}>
            {prayer.name}
          </div>

          {/* Divider */}
          <div style={{
            ...styles.divider,
            ...(prayer.isNext ? styles.dividerActive : {}),
          }} />

          {/* Times */}
          <div style={styles.timesContainer}>
            <div style={styles.timeRow}>
              <span style={{
                ...styles.timeLabel,
                ...(prayer.isNext ? styles.timeLabelActive : {}),
              }}>ADHAN</span>
              <span style={{
                ...styles.timeValue,
                ...(prayer.isNext ? styles.timeValueActive : {}),
              }}>
                {prayer.adhan}
              </span>
            </div>

            {prayer.showIqamah && prayer.iqamah && (
              <div style={styles.timeRow}>
                <span style={{
                  ...styles.timeLabel,
                  ...(prayer.isNext ? styles.timeLabelActive : {}),
                }}>IQAMAH</span>
                <span style={{
                  ...styles.timeValue,
                  ...(prayer.isNext ? styles.timeValueActive : {}),
                }}>
                  {prayer.iqamah}
                </span>
              </div>
            )}
          </div>

          {/* Next prayer indicator */}
          {prayer.isNext && (
            <div style={styles.nextBadge}>
              <span style={styles.pulsingDot} />
              NEXT
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const styles = {
  gridContainer: {
    display: "flex",
    gap: "20px",
    width: "100%",
  },

  prayerCard: {
    flex: 1,
    background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
    borderRadius: "24px",
    padding: "32px 20px 28px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
    border: "1px solid rgba(0,0,0,0.06)",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s ease",
  },

  prayerCardActive: {
    background: "linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)",
    borderColor: "#16a34a",
    borderWidth: "2px",
    boxShadow: "0 8px 32px rgba(22,163,74,0.2), 0 2px 8px rgba(22,163,74,0.1)",
    transform: "scale(1.02)",
  },

  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #d1d5db 0%, #e5e7eb 50%, #d1d5db 100%)",
    borderRadius: "24px 24px 0 0",
  },

  topAccentActive: {
    background: "linear-gradient(90deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)",
  },

  iconContainer: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    color: "#6b7280",
  },

  iconContainerActive: {
    background: "linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)",
    color: "#166534",
  },

  prayerTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "16px",
  },

  prayerTitleActive: {
    color: "#166534",
  },

  divider: {
    width: "40px",
    height: "2px",
    background: "#e5e7eb",
    margin: "0 auto 20px",
    borderRadius: "1px",
  },

  dividerActive: {
    background: "linear-gradient(90deg, #16a34a, #22c55e)",
    width: "60px",
  },

  timesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  timeRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },

  timeLabel: {
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: "700",
    letterSpacing: "0.12em",
  },

  timeLabelActive: {
    color: "#16a34a",
  },

  timeValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.02em",
  },

  timeValueActive: {
    color: "#166534",
    fontSize: "30px",
  },

  nextBadge: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
    color: "white",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    padding: "6px 10px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 2px 8px rgba(22,101,52,0.3)",
  },

  pulsingDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#4ade80",
    animation: "pulse 2s infinite",
  },
}

// Inject keyframes
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }
  `
  if (!document.head.querySelector("style[data-prayer-horizontal-styles]")) {
    styleSheet.setAttribute("data-prayer-horizontal-styles", "true")
    document.head.appendChild(styleSheet)
  }
}
