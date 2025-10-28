import React from 'react'

export default function PrayerTimes({ prayerTimes }) {
  if (!prayerTimes) return null
  const entries = Object.entries(prayerTimes).filter(([k]) => !['id','organization_id','created_at','updated_at'].includes(k))
  return (
    <div style={styles.card}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Prayer Times</div>
      <div style={styles.grid}>
        {entries.map(([k,v]) => (
          <div key={k} style={styles.row}>
            <div style={styles.key}>{labelize(k)}</div>
            <div>{String(v)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function labelize(key){
  return key.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())
}

const styles = {
  card: { background: 'white', border: '1px solid #EDF2F7', borderRadius: 8, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  row: { display: 'contents' },
  key: { color: '#4A5568' }
}
