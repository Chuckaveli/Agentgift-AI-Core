import { getBrowserClient, getServerClient, getAdminClient } from "@/lib/supabase/clients"

// Re-export the clients for backward compatibility
export const createClientSupabase = getBrowserClient
export const createServerSupabase = getServerClient
export const createAdminSupabase = getAdminClient

// Type exports
export type SupabaseClient = ReturnType<typeof getBrowserClient>
export type SupabaseServerClient = ReturnType<typeof getServerClient>
export type SupabaseAdminClient = ReturnType<typeof getAdminClient>
