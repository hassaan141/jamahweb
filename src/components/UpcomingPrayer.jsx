"use client"

import { useEffect, useMemo, useState } from 'react'
import moment from 'moment-hijri'

export default function UpcomingPrayer({ prayerTimes, align = 'center', onDateChange }) {
  // Tick counter - MUST be in useMemo deps to trigger recalculation every second
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => {
      setTick((t) => t + 1)
      // Auto-refresh prayer times at 1:00 AM (after GitLab action updates DB ~12:35 AM)
      const now = moment()
      if (onDateChange && now.hour() === 1 && now.minute() === 0 && now.second() < 2) {
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
      const h = parseInt(match[1], 10)
      const m = parseInt(match[2], 10)
      if (Number.isNaN(h) || Number.isNaN(m)) return null
      return { h, m }
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
      { name: 'Fajr', type: 'Adhan', field: 'fajr_azan' },
      { name: 'Fajr', type: 'Iqamah', field: 'fajr_iqamah' },
      { name: 'Sunrise', type: null, field: 'sunrise' },
      { name: 'Dhuhr', type: 'Adhan', field: 'dhuhr_azan' },
      { name: 'Dhuhr', type: 'Iqamah', field: 'dhuhr_iqamah' },
      { name: 'Asr', type: 'Adhan', field: 'asr_azan' },
      { name: 'Asr', type: 'Iqamah', field: 'asr_iqamah' },
      { name: 'Maghrib', type: 'Adhan', field: 'maghrib_azan' },
      { name: 'Maghrib', type: 'Iqamah', field: 'maghrib_iqamah' },
      { name: 'Isha', type: 'Adhan', field: 'isha_azan' },
      { name: 'Isha', type: 'Iqamah', field: 'isha_iqamah' },
    ]

    const now = moment()

    // Find the first time that is still in the future
    for (const { name, type, field } of TIMES) {
      const raw = prayerTimes[field]
      const prayerTime = toMomentFor(raw)
      if (!prayerTime || !prayerTime.isValid()) continue

      if (prayerTime.isAfter(now)) {
        const label = type ? `${name} ${type}` : name
        return { name, type, label, at: prayerTime, raw, isTomorrow: false }
      }
    }

    // All times have passed - return tomorrow's Fajr Adhan
    const fajrRaw = prayerTimes.fajr_azan
    const tomorrowFajr = toMomentFor(fajrRaw)
    if (tomorrowFajr && tomorrowFajr.isValid()) {
      tomorrowFajr.add(1, 'day')
      return { name: 'Fajr', type: 'Adhan', label: 'Fajr Adhan', at: tomorrowFajr, raw: fajrRaw, isTomorrow: true }
    }

    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayerTimes, tick])  // tick MUST be here to recalculate every second!

  function formatCountdown(diffMs) {
    const totalSeconds = Math.floor(diffMs / 1000)
    // Ensure we never show negative values
    if (totalSeconds <= 0) {
      return '00h 00m 00s'
    }
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
        <span style={styles.upLead}>{next.label} in</span>
        <span style={styles.upCountdown}>{formatCountdown(diffMs)}</span>
      </div>
      <div style={styles.upRight}>
        <span style={styles.upTime}>{next.at.format('h:mm A')}</span>
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
