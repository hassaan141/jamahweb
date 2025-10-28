import { supabase } from './client'

// Prefer fetching only Masjids for the dropdown
export async function fetchMasjids() {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, address, city, latitude, longitude, type, is_active')
    .eq('is_active', true)
    .eq('type', 'masjid')
    .order('name', { ascending: true })
  // Simple logs (always on)
  console.log('[fetchMasjids]', { count: data?.length || 0, error })
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[supabase] fetchMasjids ->', { count: data?.length || 0, error })
  }
  return { data: data || [], error }
}

export async function fetchDailyPrayerTimes(organizationId) {
  console.log('[fetchDailyPrayerTimes] start', { organizationId })

  // Log auth/session to see if we're anon (RLS often blocks anon)
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('[fetchDailyPrayerTimes] getSession error', sessionError)
    } else {
      console.log('[fetchDailyPrayerTimes] session', {
        hasSession: !!sessionData?.session,
        userId: sessionData?.session?.user?.id || null,
      })
    }
  } catch (e) {
    console.error('[fetchDailyPrayerTimes] getSession threw', e)
  }

  // Fetch latest row for this masjid (no date filter)
  const { data, error } = await supabase
    .from('daily_prayer_times')
    .select('*')
    .eq('organization_id', organizationId)
    .order('prayer_date', { ascending: false })
    .limit(1)

  if (error) {
    console.error('[fetchDailyPrayerTimes] query error', { organizationId, error })
  }

  // Count visible rows to detect RLS effects
  try {
    const { count, error: countError } = await supabase
      .from('daily_prayer_times')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
    if (countError) {
      console.error('[fetchDailyPrayerTimes] count error', countError)
    } else {
      console.log('[fetchDailyPrayerTimes] count', { organizationId, count })
    }
  } catch (e) {
    console.error('[fetchDailyPrayerTimes] count threw', e)
  }

  const row = Array.isArray(data) ? (data[0] || null) : null
  console.log('[fetchDailyPrayerTimes] result', {
    organizationId,
    returnedArrayLength: Array.isArray(data) ? data.length : null,
    hasRow: !!row,
    row,
  })

  return { data: row, error: error || null }
}

export async function fetchOrganizationById(id) {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, address, city, latitude, longitude')
    .eq('id', id)
    .maybeSingle()
  // Simple logs (always on)
  if (error) {
    console.error('[fetchOrganizationById]', { id, error })
  } else {
    console.log('[fetchOrganizationById]', { id, found: !!data, data })
  }
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[supabase] fetchOrganizationById ->', { id, found: !!data, error, data })
  }
  return { data: data || null, error }
}
