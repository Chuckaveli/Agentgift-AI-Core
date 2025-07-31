import { createBrowserClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Client-side Supabase client for browser usage
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Admin client for server-side operations with service role key
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations")
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Default export for backward compatibility
export const supabase = createClient()
