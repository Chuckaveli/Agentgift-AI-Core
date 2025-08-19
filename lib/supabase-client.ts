import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client for client-side operations
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Browser-safe fallback functions (these will use the browser client)
export function createServerClient() {
  console.warn("createServerClient called from browser context, using browser client instead")
  return createClient()
}

export function createAdminClient() {
  console.warn("createAdminClient called from browser context, using browser client instead")
  return createClient()
}

// Default export for backward compatibility
export default createClient()
