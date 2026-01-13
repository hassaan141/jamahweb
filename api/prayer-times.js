import { kv } from '@vercel/kv'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export const config = { runtime: 'edge' }

export default async function handler(req) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get('orgId')
  const date = searchParams.get('date')

  if (!orgId || !date) return new Response('Missing orgId/date', { status: 400 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const key = `rl:prayers:${ip}:${orgId}`
  const count = (await kv.incr(key)) ?? 1
  if (count === 1) await kv.expire(key, 60)
  if (count > 120) return new Response('Rate limit exceeded', { status: 429 })

  const { data, error } = await supabase
    .from('daily_prayer_times')
    .select('organization_id, prayer_date, fajr_azan, fajr_iqamah, sunrise, zawal, dhuhr_azan, dhuhr_iqamah, asr_azan, asr_iqamah, maghrib_azan, maghrib_iqamah, isha_azan, isha_iqamah, tmrw_fajr_azan, tmrw_fajr_iqamah, jumah_time_1, jumah_time_2, jumah_time_3')
    .eq('organization_id', orgId)
    .eq('prayer_date', date)
    .maybeSingle()

  if (error) return new Response('Failed to fetch prayer times', { status: 500 })

  return new Response(JSON.stringify(data ?? null), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 's-maxage=60, stale-while-revalidate',
    },
  })
}