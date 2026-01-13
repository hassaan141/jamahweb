import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export const config = { runtime: 'edge' }

export default async function handler(req) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return new Response('Missing id', { status: 400 })

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) return new Response('Failed to fetch organization', { status: 500 })

  return new Response(JSON.stringify(data ?? null), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 's-maxage=300, stale-while-revalidate',
    },
  })
}