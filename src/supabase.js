import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dxhoxjssilitulrrwaqk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4aG94anNzaWxpdHVscnJ3YXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODQ2MzEsImV4cCI6MjA5MzI2MDYzMX0.HH4ZEfhkuwok2keUxTvJSUeWaPZ2GLd5nrXPbjgCIJY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})
