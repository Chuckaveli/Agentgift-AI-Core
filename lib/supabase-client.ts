import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_URL is not defined")
  }
  if (!anonKey) {
    throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined")
  }

  return createSupabaseClient<Database>(url, anonKey)
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_URL is not defined")
  }
  if (!serviceRoleKey) {
    throw new Error("Environment variable SUPABASE_SERVICE_ROLE_KEY is not defined")
  }

  return createSupabaseClient<Database>(url, serviceRoleKey)
}
