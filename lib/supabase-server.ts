import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { env, validateEnv } from "./env"

// Create client for server-side operations (main export)
export async function createClient() {
  const isValidEnv = validateEnv()

  if (!isValidEnv || !env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("⚠️ Supabase environment variables missing, returning mock client")
    return createMockServerClient()
  }

  const cookieStore = await cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// Create server-side client for Server Components (alias for compatibility)
export async function createServerClient() {
  const isValidEnv = validateEnv()

  if (!isValidEnv || !env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("⚠️ Supabase environment variables missing, returning mock client")
    return createMockServerClient()
  }

  const cookieStore = await cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// Create admin client for server-side operations
export function createAdminClient() {
  const isValidEnv = validateEnv()

  if (!isValidEnv || !env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("⚠️ Supabase admin environment variables missing, returning mock client")
    return createMockServerClient()
  }

  return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Mock server client for development/fallback
function createMockServerClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: "Mock server client - no database available" } }),
      update: () => Promise.resolve({ data: null, error: { message: "Mock server client - no database available" } }),
      delete: () => Promise.resolve({ data: null, error: { message: "Mock server client - no database available" } }),
      upsert: () => Promise.resolve({ data: null, error: { message: "Mock server client - no database available" } }),
    }),
    rpc: () => Promise.resolve({ data: null, error: { message: "Mock server client - no RPC available" } }),
  } as any
}

// Export getSupabaseServer for backward compatibility
export { createServerClient as getSupabaseServer }
