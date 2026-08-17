import { createClient } from '@supabase/supabase-js'

// Fall back to a non-functional placeholder when the env vars are absent.
// createClient() throws on an empty url, and this module is pulled into the
// initial bundle, so an unconfigured backend would otherwise blank the whole
// app — including static pages like /privacy that never touch Supabase.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'http://localhost:54321'
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'missing-anon-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — auth and store data will not work.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
