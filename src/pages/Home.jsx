import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMasjids } from '../services/supabase/api'
import MasjidDropdown from '../components/MasjidDropdown'
import MapView from '../components/MapView'

export default function Home() {
  const navigate = useNavigate()
  const [masjids, setMasjids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await fetchMasjids()
        if (error) throw error
        setMasjids(data)
      } catch (e) {
        console.error('Failed to load masjids:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSelect = (m) => {
    if (m?.id) navigate(`/masjid/${m.id}`)
  }

  if (loading) {
    return <div style={styles.center}>Loading…</div>
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}><h1 style={{ margin: 0 }}>📿 Awqat — Prayer Times</h1></header>
      <main style={styles.main}>
  <MasjidDropdown masjids={masjids} selectedMasjid={null} onSelect={handleSelect} />
        {masjids.length === 0 && (
          <div style={styles.emptyCard}>No masjids found. Add organizations in Supabase.</div>
        )}
        <h2 style={{ margin: '16px 0 8px' }}>All Masjids on Map</h2>
        <MapView masjids={masjids} />
      </main>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#F7FAFC' },
  header: { background: '#228f2b', color: 'white', padding: 16 },
  main: { maxWidth: 1040, margin: '0 auto', padding: 16 },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' },
  emptyCard: { background: 'white', border: '1px solid #EDF2F7', borderRadius: 8, padding: 12 }
}
