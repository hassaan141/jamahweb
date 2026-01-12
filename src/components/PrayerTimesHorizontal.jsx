"use client"
import moment from "moment-hijri"

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
      {prayers.map((prayer) => (
        <div
          key={prayer.key}
          style={{
            ...styles.prayerCard,
            ...(prayer.isNext ? styles.prayerCardActive : {}),
          }}
        >
          {/* Prayer Name */}
          <div
            style={{
              ...styles.prayerTitle,
              ...(prayer.isNext ? styles.prayerTitleActive : {}),
            }}
          >
            {prayer.name}
          </div>

          {/* Times */}
          <div style={styles.timesContainer}>
            <div style={styles.timeRow}>
              <span style={styles.timeLabel}>ADHAN</span>
              <span
                style={{
                  ...styles.timeValue,
                  ...(prayer.isNext ? styles.timeValueActive : {}),
                }}
              >
                {prayer.adhan}
              </span>
            </div>

            {prayer.showIqamah && prayer.iqamah && (
              <div style={styles.timeRow}>
                <span style={styles.timeLabel}>IQAMAH</span>
                <span
                  style={{
                    ...styles.timeValue,
                    ...(prayer.isNext ? styles.timeValueActive : {}),
                  }}
                >
                  {prayer.iqamah}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  gridContainer: {
    display: "flex",
    gap: "16px",
    width: "100%",
  },

  prayerCard: {
    flex: 1,
    background: "white",
    borderRadius: "16px",
    padding: "24px 16px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e5e7eb",
  },

  prayerCardActive: {
    background: "#f0fdf4",
    borderColor: "#166534",
    borderWidth: "2px",
    boxShadow: "0 4px 16px rgba(22,101,52,0.12)",
  },

  prayerTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#166534",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "20px",
  },

  prayerTitleActive: {
    color: "#14532d",
  },

  timesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  timeRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },

  timeLabel: {
    fontSize: "10px",
    color: "#9ca3af",
    fontWeight: "600",
    letterSpacing: "0.08em",
  },

  timeValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1f2937",
    fontVariantNumeric: "tabular-nums",
  },

  timeValueActive: {
    color: "#166534",
  },
}
