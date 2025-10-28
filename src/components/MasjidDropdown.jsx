import React from 'react'

export default function MasjidDropdown({ masjids = [], selectedMasjid, onSelect }) {
  return (
    <div style={{ margin: '12px 0' }}>
      <label style={{ marginRight: 8, fontWeight: 600 }}>Masjid:</label>
      <select
        value={selectedMasjid?.id || ''}
        onChange={(e) => {
          const id = e.target.value
          const m = masjids.find(x => String(x.id) === id)
          onSelect?.(m || null)
        }}
      >
        <option value="">Select a masjid…</option>
        {masjids.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
    </div>
  )
}
