import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Get environment variables with proper validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client for browser usage
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Admin client for server-side operations with service role key
export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables for admin client. Please check your .env.local file and ensure SUPABASE_SERVICE_ROLE_KEY is set.",
    )
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Server-side client for API routes (alternative to admin client)
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createSupabaseClient(supabaseUrl, supabaseServiceKey)
}

// Default export for backward compatibility
export const supabase = createClient()
