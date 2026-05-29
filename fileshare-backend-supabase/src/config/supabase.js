import { createClient } from '@supabase/supabase-js'
import nodeFetch from 'node-fetch'
import ws from 'ws'
import { env } from './env.js'

const ipv4Fetch = (url, options) => nodeFetch(url, options)

export const supabase = createClient(
  env.supabaseUrl,
  env.supabaseServiceKey,
  {
    auth: { persistSession: false },
    realtime: { transport: ws },
    global: { fetch: ipv4Fetch },
  }
)

export const BUCKET = env.supabaseBucket
