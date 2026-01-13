export async function fetchMasjids() {
  const res = await fetch('/api/masjids')
  if (!res.ok) {
    return { data: [], error: new Error('Failed to fetch masjids') }
  }
  const data = await res.json()
  return { data, error: null }
}

export async function fetchDailyPrayerTimes(organizationId, forDate) {
  function toYMD(d) {
    if (!d) return null
    const dt = (d instanceof Date) ? d : new Date(d)
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const ymd = toYMD(forDate)
  const res = await fetch(`/api/prayer-times?orgId=${organizationId}&date=${ymd}`)
  if (!res.ok) {
    return { data: null, error: new Error('Failed to fetch prayer times') }
  }
  const row = await res.json()
  return { data: row, error: null }
}

export async function fetchOrganizationById(id) {
  const res = await fetch(`/api/organization?id=${id}`)
  if (!res.ok) {
    return { data: null, error: new Error('Failed to fetch organization') }
  }
  const data = await res.json()
  return { data, error: null }
}
