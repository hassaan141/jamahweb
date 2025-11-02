"use client"

import { useEffect, useMemo, useState } from 'react'
import moment from 'moment-hijri'

export default function UpcomingPrayer({ prayerTimes }) {
  const [tick, setTick] = useState(0) // changes every minute

  useEffect(() => {
    // update every second for second-level countdown
    const iv = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  const next = useMemo(() => {
    if (!prayerTimes) return null

    const keys = [
      { name: 'Fajr', azanKey: 'fajr_azan' },
      { name: 'Sunrise', azanKey: 'sunrise' },
      { name: 'Dhuhr', azanKey: 'dhuhr_azan' },
      { name: 'Asr', azanKey: 'asr_azan' },
      { name: 'Maghrib', azanKey: 'maghrib_azan' },
      { name: 'Isha', azanKey: 'isha_azan' },
    ]

    const formats = ['HH:mm', 'H:mm', 'h:mm A', 'hh:mm A']
    const today = moment()
    const list = keys
      .map(({ name, azanKey }) => {
        const t = prayerTimes[azanKey]
        const s = (t == null ? '' : String(t)).trim()
        if (!s || s === '-') return null
        const m = moment(s, formats, false)
        if (!m.isValid()) return null
        m.year(today.year()).month(today.month()).date(today.date())
        return { name, m, raw: t }
      })
      .filter(Boolean)

    const now = moment()
    let found = list.find((p) => p.m.isAfter(now))
    if (!found && list.length) {
      const first = list[0]
      found = { ...first, m: first.m.clone().add(1, 'day') }
    }
    if (!found) return null

    const diffMs = found.m.diff(now)
    return { name: found.name, at: found.m, raw: found.raw, diffMs }
  }, [prayerTimes, tick])

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

  return (
    <div style={styles.upcomingCard}>
      <div style={styles.upLeft}>
        <span style={styles.upLead}>Next prayer in</span>
        <span style={styles.upCountdown}>{formatCountdown(next.diffMs)}</span>
      </div>
      <div style={styles.upRight}>
        <span style={styles.upName}>{next.name}</span>
        <span style={styles.dot}>•</span>
        <span style={styles.upTime}>{next.at.format('HH:mm')}</span>
      </div>
    </div>
  )
}

const styles = {
  upcomingCard: {
    maxWidth: 400,
    margin: '0 auto 12px',
    padding: '12px 16px',
    borderRadius: 16,
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(5,150,105,0.06)',
  },
  upLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  upLead: { fontSize: 16, fontWeight: 700, color: '#065f46', letterSpacing: '0.02em' },
  upRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginLeft: 'auto',
  },
  upName: { fontSize: 16, fontWeight: 800, color: '#065f46' },
  upTime: { fontSize: 16, fontWeight: 700, color: '#064e3b' },
  upCountdown: {
    background: 'transparent',
    color: '#065f46',
    padding: 0,
    borderRadius: 0,
    fontWeight: 800,
    fontSize: 18,
    fontVariantNumeric: 'tabular-nums',
  },
  dot: { color: '#059669', opacity: 0.8 },
}
