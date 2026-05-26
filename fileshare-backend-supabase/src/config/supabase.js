import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'

/**
 * Service-role client — full storage access, bypasses RLS.
 * Never expose this key to the frontend.
 */
export const supabase = createClient(
  env.supabaseUrl,
  env.supabaseServiceKey,
  {
    auth: { persistSession: false },
  }
)

export const BUCKET = env.supabaseBucket
