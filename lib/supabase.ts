import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// Client-side Supabase client
export const createClientSupabase = () => createClientComponentClient<Database>()

// Server-side Supabase client
export const createServerSupabase = () => createServerComponentClient<Database>({ cookies })

// Admin Supabase client (for server-side operations that need elevated permissions)
export const createAdminSupabase = () =>
  createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

// Type exports
export type SupabaseClient = ReturnType<typeof createClientSupabase>
export type SupabaseServerClient = ReturnType<typeof createServerSupabase>
export type SupabaseAdminClient = ReturnType<typeof createAdminSupabase>
