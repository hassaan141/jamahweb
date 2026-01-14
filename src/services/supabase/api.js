import { supabase } from './client'
import { getCached, setCache } from './cache'

// Prefer fetching only Masjids for the dropdown
export async function fetchMasjids() {
  const cacheKey = 'masjids_bc'
  
  // Check cache first (1 hour TTL)
  const cached = getCached(cacheKey, 3600)
  if (cached) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[supabase] fetchMasjids -> from cache', { count: cached.length })
    }
    return { data: cached, error: null }
  }
  
  // Fetch from  supabase
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, address, city, province_state, latitude, longitude, type, is_active')
    .eq('is_active', true)
    .in('type', ['masjid', 'msa'])
    .or('province_state.eq.British Columbia,province_state.eq.BC')
    .order('name', { ascending: true })
  
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[supabase] fetchMasjids -> from database', { count: data?.length || 0, error })
  }
  
  // Cache successful responses
  if (data && !error) {
    setCache(cacheKey, data)
  }
  
  return { data: data || [], error }
}

export async function fetchDailyPrayerTimes(organizationId, forDate) {
  // Normalize date to YYYY-MM-DD string (local timezone) if provided
  function toYMD(d) {
    if (!d) return null
    const dt = (d instanceof Date) ? d : new Date(d)
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const ymd = toYMD(forDate)
  const cacheKey = `prayer_${organizationId}_${ymd}`
  
  // Check cache first (1 hour TTL)
  const cached = getCached(cacheKey, 3600)
  if (cached) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[fetchDailyPrayerTimes] from cache', { organizationId, date: ymd })
    }
    return { data: cached, error: null }
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[fetchDailyPrayerTimes] start', { organizationId, forDate })
  }

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (process.env.NODE_ENV !== 'production') {
      if (sessionError) {
        // eslint-disable-next-line no-console
        console.error('[fetchDailyPrayerTimes] getSession error', sessionError)
      } else {
        // eslint-disable-next-line no-console
        console.log('[fetchDailyPrayerTimes] session', {
          hasSession: !!sessionData?.session,
          userId: sessionData?.session?.user?.id || null,
        })
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[fetchDailyPrayerTimes] getSession threw', e)
    }
  }

  // Fetch specific day row for this masjid
  const { data, error } = await supabase
    .from('daily_prayer_times')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('prayer_date', ymd)
    .maybeSingle()

  if (error && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[fetchDailyPrayerTimes] query error', { organizationId, error })
  }

  // Count visible rows for this date to detect RLS effects
  try {
    const { count, error: countError } = await supabase
      .from('daily_prayer_times')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('prayer_date', ymd)
    if (process.env.NODE_ENV !== 'production') {
      if (countError) {
        // eslint-disable-next-line no-console
        console.error('[fetchDailyPrayerTimes] count error', countError)
      } else {
        // eslint-disable-next-line no-console
        console.log('[fetchDailyPrayerTimes] count', { organizationId, date: ymd, count })
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[fetchDailyPrayerTimes] count threw', e)
    }
  }

  const row = Array.isArray(data) ? (data[0] || null) : data || null
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[fetchDailyPrayerTimes] result', {
      organizationId,
      date: ymd,
      returnedArrayLength: Array.isArray(data) ? data.length : (data ? 1 : 0),
      hasRow: !!row,
    })
  }

  // Cache successful responses
  if (row && !error) {
    setCache(cacheKey, row)
  }

  return { data: row, error: error || null }
}

export async function fetchOrganizationById(id) {
  const cacheKey = `org_${id}`
  
  // Check cache first (1 hour TTL)
  const cached = getCached(cacheKey, 3600)
  if (cached) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[fetchOrganizationById] from cache', { id })
    }
    return { data: cached, error: null }
  }
  
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    if (error) {
      console.error('[fetchOrganizationById]', { id, error })
    } else {
      console.log('[fetchOrganizationById] from database', { id, found: !!data })
    }
  }
  
  // Cache successful responses
  if (data && !error) {
    setCache(cacheKey, data)
  }
  
  return { data: data || null, error }
}
