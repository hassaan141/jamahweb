import { createClient } from '@supabase/supabase-js'

// CRA exposes only REACT_APP_* variables
const url = process.env.REACT_APP_SUPABASE_URL
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(url, anonKey)
