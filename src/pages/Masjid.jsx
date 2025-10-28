import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchDailyPrayerTimes, fetchOrganizationById } from '../services/supabase/api'
import PrayerTimes from '../components/PrayerTimes'

export default function Masjid() {
  const { id } = useParams()
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [org, setOrg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const [ptRes, orgRes] = await Promise.all([
          fetchDailyPrayerTimes(id),
          fetchOrganizationById(id),
        ])
        console.log('[Masjid] params.id =', id)
        console.log('[Masjid] prayerTimes result =', ptRes)
        console.log('[Masjid] organization result =', orgRes)
        if (ptRes.error) throw ptRes.error
        if (orgRes.error) throw orgRes.error
        setPrayerTimes(ptRes.data)
        setOrg(orgRes.data)
      } catch (e) {
        console.error('[Masjid] error', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <div style={styles.center}>Loading…</div>
  if (error) return <div style={styles.center}>Failed to load prayer times. {String(error?.message || '')}</div>

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>{org?.name || 'Masjid'} • {org?.city || ''}</h1>
        <Link to="/" style={styles.back}>← Back</Link>
      </header>
      <main style={styles.main}>
        {prayerTimes ? (
          <PrayerTimes prayerTimes={prayerTimes} />
        ) : (
          <div style={styles.empty}>No prayer times available.</div>
        )}
      </main>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#F7FAFC' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#228f2b', color: 'white', padding: 16 },
  main: { maxWidth: 1040, margin: '0 auto', padding: 16 },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' },
  empty: { background: 'white', border: '1px solid #EDF2F7', borderRadius: 8, padding: 12 },
  pre: { background: 'white', border: '1px solid #EDF2F7', borderRadius: 8, padding: 12, overflowX: 'auto' },
  back: { color: 'white', textDecoration: 'none' },
}
