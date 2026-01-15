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

    // Helper: build a moment for a specific date from 24-hour time
    function toMomentFor(timeStr, base) {
      const parsed = parseHHMM(timeStr)
      if (!parsed) return null
      const { h, m } = parsed
      const t = (base || moment()).clone()
      t.hour(h).minute(m).second(0).millisecond(0)
      return t
    }

    const PRAYERS = [
      { name: 'Fajr', azanField: 'fajr_azan', iqamahField: 'fajr_iqamah' },
      { name: 'Sunrise', azanField: 'sunrise', iqamahField: null },
      { name: 'Dhuhr', azanField: 'dhuhr_azan', iqamahField: 'dhuhr_iqamah' },
      { name: 'Asr', azanField: 'asr_azan', iqamahField: 'asr_iqamah' },
      { name: 'Maghrib', azanField: 'maghrib_azan', iqamahField: 'maghrib_iqamah' },
      { name: 'Isha', azanField: 'isha_azan', iqamahField: 'isha_iqamah' },
    ]

    const now = moment()
    const today = baseDate ? moment(baseDate) : now.clone()
    const prayerDataDate = today.format('YYYY-MM-DD')
    const currentDate = now.format('YYYY-MM-DD')

    // Build list of all upcoming times (both Adhan and Iqamah)
    const allTimes = []

    for (const prayer of PRAYERS) {
      // Add Adhan time
      const azanTime = toMomentFor(prayerTimes[prayer.azanField], today)
      if (azanTime && azanTime.isValid()) {
        allTimes.push({
          name: prayer.name,
          type: 'Adhan',
          at: azanTime,
          raw: prayerTimes[prayer.azanField]
        })
      }

      // Add Iqamah time (if exists and not Sunrise)
      if (prayer.iqamahField) {
        const iqamahTime = toMomentFor(prayerTimes[prayer.iqamahField], today)
        if (iqamahTime && iqamahTime.isValid()) {
          allTimes.push({
            name: prayer.name,
            type: 'Iqamah',
            at: iqamahTime,
            raw: prayerTimes[prayer.iqamahField]
          })
        }
      }
    }

    // Find the next time that is still in the future (with 5 second buffer)
    for (const time of allTimes) {
      if (time.at.diff(now) > 5000) {
        return time
      }
    }

    // All times have passed - show tomorrow's Fajr Adhan
    // BUT: if we're past midnight (12:00-12:10 AM) with old data, show today's Fajr
    const fajrAdhan = allTimes.find(t => t.name === 'Fajr' && t.type === 'Adhan')
    if (fajrAdhan) {
      // If prayer data is from yesterday (happens between 12:00-12:10 AM before refresh)
      if (prayerDataDate < currentDate) {
        // We're past midnight with old data - add 1 day to get today's Fajr
        const todayFajr = fajrAdhan.at.clone().add(1, 'day')
        return { ...fajrAdhan, at: todayFajr }
      }

      // Check if we're in early morning before Fajr (12:00-12:15 AM or 0-3 AM with Fajr at 4+ AM)
      const isEarlyMorning = now.hour() === 0 && now.minute() < 15
      const isBeforeFajr = now.hour() >= 0 && now.hour() <= 3 && fajrAdhan.at.hour() >= 4

      if (isEarlyMorning || isBeforeFajr) {
        // We're in early morning hours, show today's Fajr
        return fajrAdhan
      }

      // Otherwise, target tomorrow's Fajr Adhan
      const tomorrowFajr = fajrAdhan.at.clone().add(1, 'day')
      return { ...fajrAdhan, at: tomorrowFajr }
    }

    return null
  }, [prayerTimes, baseDate])

  function formatCountdown(diffMs) {
    // If countdown is very low, show minimal time
    if (!diffMs || diffMs <= 1000) return '00h 00m 00s'
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
        <span style={styles.upLead}>Next {next.type.toLowerCase()} in</span>
        <span style={styles.upCountdown}>{formatCountdown(diffMs)}</span>
      </div>
      <div style={styles.upRight}>
        <span style={styles.upName}>{next.name} {next.type}</span>
        <span style={styles.dot}>•</span>
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
