import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { env } from './env.js'

export const supabase = createClient(
  env.supabaseUrl,
  env.supabaseServiceKey,
  {
    auth: { persistSession: false },
    realtime: { transport: ws },
  }
)

export const BUCKET = env.supabaseBucket
