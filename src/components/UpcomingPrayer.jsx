"use client"

import { useEffect, useMemo, useState } from 'react'
import moment from 'moment-hijri'

export default function UpcomingPrayer({ prayerTimes, baseDate, align = 'center' }) {
  const [tick, setTick] = useState(0) // tick every second for live countdown

  useEffect(() => {
    // update every second for second-level countdown
    const iv = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  const next = useMemo(() => {
    if (!prayerTimes) return null

    // Helper: parse "HH:MM" from any string (ignores AM/PM text if present)
    function parseHHMM(str) {
      const s = (str == null ? '' : String(str)).trim()
      if (!s || s === '-') return null
      const match = s.match(/(\d{1,2}):(\d{2})/)
      if (!match) return null
      let h = parseInt(match[1], 10)
      const m = parseInt(match[2], 10)
      if (Number.isNaN(h) || Number.isNaN(m)) return null
      return { h, m }
    }

    // Helper: build a moment for today with AM/PM inference rules
    function toMomentFor(prayerName, timeStr, base) {
      const parsed = parseHHMM(timeStr)
      if (!parsed) return null
      const { m } = parsed
      let { h } = parsed
      // AM/PM inference
      if (['Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(prayerName)) {
        // Force PM for these prayers
        if (h < 12) h += 12
      } else if (prayerName === 'Fajr') {
        // Fajr: 12:xx means midnight
        if (h === 12) h = 0
      }
      const t = (base || moment()).clone()
      t.hour(h).minute(m).second(0).millisecond(0)
      return t
    }

    const FIELD_BY_NAME = {
      Fajr: 'fajr_azan',
      Sunrise: 'sunrise',
      Dhuhr: 'dhuhr_azan',
      Asr: 'asr_azan',
      Maghrib: 'maghrib_azan',
      Isha: 'isha_azan',
    }

    const ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    const now = moment()
  const today = baseDate ? moment(baseDate) : now.clone()

    // Build today's moments per rule
    const moments = {}
    for (const name of ORDER) {
      const field = FIELD_BY_NAME[name]
      const raw = prayerTimes[field]
      const m = toMomentFor(name, raw, today)
      if (m && m.isValid()) moments[name] = { name, at: m, raw }
    }

    // Special case: after Isha and before ~4am, target Tomorrow Fajr
    const isha = moments.Isha?.at
    const fajr = moments.Fajr?.at
    const tomorrow4am = now.clone().startOf('day').add(1, 'day').hour(4).minute(0).second(0)
    if (isha && fajr && now.isAfter(isha) && now.isBefore(tomorrow4am)) {
      const at = fajr.clone().add(1, 'day')
      return {
        name: 'Fajr',
        at,
        raw: moments.Fajr.raw,
        diffMs: at.diff(now),
        isTomorrow: true,
      }
    }

    // Otherwise pick the next prayer in order that is after now
    for (const name of ORDER) {
      const entry = moments[name]
      if (entry && entry.at.isAfter(now)) {
        return {
          name: entry.name,
          at: entry.at,
          raw: entry.raw,
          diffMs: entry.at.diff(now),
          isTomorrow: false,
        }
      }
    }

    // If none left today, it's Tomorrow Fajr
    if (fajr) {
      const at = fajr.clone().add(1, 'day')
      return {
        name: 'Fajr',
        at,
        raw: moments.Fajr.raw,
        diffMs: at.diff(now),
        isTomorrow: true,
      }
    }

    return null
  }, [prayerTimes, tick, baseDate])

  function formatCountdown(diffMs) {
    if (!diffMs || diffMs <= 0) return '00h 00m 00s'
    const totalSeconds = Math.floor(diffMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
  }

  if (!next) return null

  const cardStyle = {
    ...styles.upcomingCard,
    margin: align === 'center' ? '0 auto 12px' : '0 0 12px 0',
  }

  return (
    <div style={cardStyle}>
      <div style={styles.upLeft}>
        <span style={styles.upLead}>Next prayer in</span>
        <span style={styles.upCountdown}>{formatCountdown(next.diffMs)}</span>
      </div>
      <div style={styles.upRight}>
        <span style={styles.upName}>{next.name}</span>
        <span style={styles.dot}>•</span>
        <span style={styles.upTime}>{next.at.format('h:mm A')}</span>
  {/* Removed explicit (tomorrow) label per request */}
      </div>
    </div>
  )
}

const styles = {
  upcomingCard: {
    maxWidth: 460,
    margin: '0 auto 10px',
    padding: '10px 14px',
    borderRadius: 16,
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    columnGap: 12,
    boxShadow: '0 2px 8px rgba(5,150,105,0.06)',
  },
  upLeft: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 },
  upLead: { fontSize: 14, fontWeight: 700, color: '#065f46', letterSpacing: '0.01em' },
  upRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
  },
  upName: { fontSize: 15, fontWeight: 700, color: '#065f46' },
  upTime: { fontSize: 15, fontWeight: 700, color: '#064e3b', display: 'inline-block', whiteSpace: 'nowrap' },
  upCountdown: {
    background: 'transparent',
    color: '#065f46',
    padding: 0,
    borderRadius: 0,
    fontWeight: 800,
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
  },
  dot: { color: '#059669', opacity: 0.75 },
  // upTomorrow removed (no longer displayed)
}
