<<<<<<< HEAD
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Client-side Supabase client
export const createClientSupabase = () => createBrowserClient<Database>()

// Server-side Supabase client
export const createServerSupabase = () => createServerClient<Database>({ cookies })

// Admin Supabase client (for server-side operations that need elevated permissions)
export const createAdminSupabase = () =>
  createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
=======
import { getBrowserClient, getServerClient, getAdminClient } from "@/lib/supabase/clients"

// Re-export the clients for backward compatibility
export const createClientSupabase = getBrowserClient
export const createServerSupabase = getServerClient
export const createAdminSupabase = getAdminClient
>>>>>>> origin/main

// Type exports
export type SupabaseClient = ReturnType<typeof getBrowserClient>
export type SupabaseServerClient = ReturnType<typeof getServerClient>
export type SupabaseAdminClient = ReturnType<typeof getAdminClient>
