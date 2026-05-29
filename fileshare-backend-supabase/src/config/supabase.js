import { createClient } from '@supabase/supabase-js'
import { fetch as undiciFetch, Agent } from 'undici'
import ws from 'ws'
import { env } from './env.js'

const ipv4Agent = new Agent({ connect: { family: 4 } })
const ipv4Fetch = (url, options) => undiciFetch(url, { ...options, dispatcher: ipv4Agent })

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
