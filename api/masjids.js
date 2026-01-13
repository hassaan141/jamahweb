import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  const { data, error } = await supabase
    .from('organizations')
    .select(
      'id, name, address, city, province_state, latitude, longitude, type, is_active'
    )
    .eq('is_active', true)
    .eq('type', 'masjid')
    .or('province_state.eq.British Columbia,province_state.eq.BC')
    .order('name', { ascending: true })
    .limit(500)

  if (error) {
    return new Response('Failed to fetch masjids', { status: 500 })
  }

  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 's-maxage=300, stale-while-revalidate',
    },
  })
}