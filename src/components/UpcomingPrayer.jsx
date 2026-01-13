import { useEffect, useMemo, useState } from "react"
import moment from "moment"

export default function UpcomingPrayer({ prayers }) {
  const [now, setNow] = useState(moment())

  // tick every second (drives countdown)
  useEffect(() => {
    const id = setInterval(() => {
      setNow(moment())
    }, 1000)

    return () => clearInterval(id)
  }, [])

  // determine next prayer (absolute datetime, always future)
  const nextPrayer = useMemo(() => {
    if (!prayers || prayers.length === 0) return null

    // prayers must already have .at as moment()
    for (const p of prayers) {
      if (p.at.isAfter(now)) {
        return { ...p, isTomorrow: false }
      }
    }

    // none left today → tomorrow's Fajr
    const fajrTomorrow = prayers[0].at.clone().add(1, "day")
    return {
      ...prayers[0],
      at: fajrTomorrow,
      isTomorrow: true,
    }
  }, [prayers, now])

  // countdown (never negative)
  const remaining = useMemo(() => {
    if (!nextPrayer) return null

    const diffMs = Math.max(nextPrayer.at.diff(now), 0)

    const hours = Math.floor(diffMs / 3_600_000)
    const minutes = Math.floor((diffMs % 3_600_000) / 60_000)
    const seconds = Math.floor((diffMs % 60_000) / 1000)

    return { hours, minutes, seconds }
  }, [nextPrayer, now])

  if (!nextPrayer || !remaining) return null

  return (
    <div style={styles.container}>
      <div style={styles.label}>Next prayer</div>

      <div style={styles.name}>
        {nextPrayer.name}
        {nextPrayer.isTomorrow && (
          <span style={styles.tomorrow}>(tomorrow)</span>
        )}
      </div>

      <div style={styles.time}>
        {nextPrayer.at.format("h:mm A")}
      </div>

      <div style={styles.countdown}>
        {pad(remaining.hours)}:
        {pad(remaining.minutes)}:
        {pad(remaining.seconds)}
      </div>
    </div>
  )
}

function pad(n) {
  return String(n).padStart(2, "0")
}

const styles = {
  container: {
    padding: 16,
    borderRadius: 12,
    background: "#f8fafc",
    textAlign: "center",
  },
  label: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 700,
  },
  tomorrow: {
    marginLeft: 6,
    fontSize: 13,
    opacity: 0.7,
  },
  time: {
    fontSize: 14,
    marginTop: 4,
    color: "#475569",
  },
  countdown: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 1,
  },
}
