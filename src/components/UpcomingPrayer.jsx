"use client"

import { useEffect, useMemo, useState } from 'react'
import moment from 'moment-hijri'

export default function UpcomingPrayer({ prayerTimes, baseDate, align = 'center', onDateChange }) {
  // internal second ticker (value intentionally ignored; only triggers re-render)
  const [, forceTick] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => {
      forceTick((t) => t + 1)
      // Auto-refresh prayer times at midnight
      const now = moment()
      if (onDateChange && now.hour() === 0 && now.minute() === 0 && now.second() < 2) {
        onDateChange(now.format('YYYY-MM-DD'))
      }
    }, 1000)
    return () => clearInterval(iv)
  }, [onDateChange])

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

    // Helper: build a moment for today from 24-hour time
    function toMomentFor(prayerName, timeStr, base) {
      const parsed = parseHHMM(timeStr)
      if (!parsed) return null
      const { h, m } = parsed
      // Server provides times in 24-hour format, use directly
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

    // Special case: after Isha and before Fajr next day (typically ~12:00 AM - 4:00 AM)
    const isha = moments.Isha?.at
    const fajr = moments.Fajr?.at
    
    // If we're past midnight and before Fajr time, show "Next: Fajr" with tomorrow's date
    if (isha && fajr && now.isAfter(isha)) {
      // Check if current time is before Fajr (same day comparison)
      const todayFajrTime = now.clone().hour(fajr.hour()).minute(fajr.minute()).second(0)
      
      // If we're after Isha but before Fajr time of day, target tomorrow's Fajr
      if (now.isBefore(todayFajrTime) || now.hour() < 4) {
        const at = fajr.clone()
        // If baseDate is today and we're past midnight, Fajr is today (just a few hours away)
        // If we're before midnight, Fajr is tomorrow
        if (now.date() !== today.date()) {
          // We're viewing tomorrow's times, keep as-is
        } else if (now.hour() >= 0 && now.hour() < 4) {
          // Past midnight but before Fajr - it's today's Fajr
          at.date(now.date())
        } else {
          // Before midnight - target tomorrow's Fajr
          at.add(1, 'day')
        }
        return {
          name: 'Fajr',
          at,
          raw: moments.Fajr.raw,
          isTomorrow: at.date() !== now.date(),
        }
      }
    }

    // Otherwise pick the next prayer in order that is after now
    for (const name of ORDER) {
      const entry = moments[name]
      if (entry && entry.at.isAfter(now)) {
        return { name: entry.name, at: entry.at, raw: entry.raw, isTomorrow: false }
      }
    }

    // If none left today, it's Tomorrow Fajr
    if (fajr) {
      const at = fajr.clone().add(1, 'day')
      return { name: 'Fajr', at, raw: moments.Fajr.raw, isTomorrow: true }
    }

    return null
  }, [prayerTimes, baseDate])

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
  const diffMs = next.at.diff(moment())

  const cardStyle = {
    ...styles.upcomingCard,
    margin: align === 'center' ? '0 auto 12px' : '0 0 12px 0',
  }

  return (
    <div style={cardStyle}>
      <div style={styles.upLeft}>
        <span style={styles.upLead}>Next prayer in</span>
  <span style={styles.upCountdown}>{formatCountdown(diffMs)}</span>
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
