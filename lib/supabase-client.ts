import { createClient as supabaseCreateClient, type SupabaseClient } from "@supabase/supabase-js"
import { env, isSupabaseConfigured } from "./env"

let supabaseClient: SupabaseClient | null = null

// Singleton pattern for client-side Supabase client
export function createClient(): SupabaseClient {
  if (typeof window === "undefined") {
    // Server-side: Create a new client on each request
    if (!isSupabaseConfigured()) {
      console.warn("Supabase is not configured, returning a mock client.")
      return createMockClient()
    }
    return supabaseCreateClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }

  // Client-side: Use a singleton to prevent multiple initializations
  if (!supabaseClient) {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase is not configured, returning a mock client.")
      return createMockClient()
    }
    supabaseClient = supabaseCreateClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }
  return supabaseClient
}

// Create a Supabase client for server-side use (with service role key)
export function createAdminClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase is not configured, returning a mock client.")
    return createMockClient()
  }
  return supabaseCreateClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  })
}

// Create a Supabase client for server components (with cookie forwarding)
import { cookies } from "next/headers"

export function createServerClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase is not configured, returning a mock client.")
    return createMockClient()
  }
  return supabaseCreateClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookies().set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookies().delete({ name, ...options })
      },
    },
  })
}

// Mock Supabase client for handling missing environment variables
function createMockClient(): SupabaseClient {
  console.warn("Using mock Supabase client.")
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithOAuth: async () => ({ data: { session: null, user: null }, error: null }),
      signOut: async () => ({ data: null, error: null }),
      onAuthStateChange: (callback: any) => {
        callback("SIGNED_OUT", { user: null, session: null })
        return { data: { subscription: { unsubscribe: () => {} } }, error: null }
      },
    },
    from: () => ({
      select: async () => ({ data: [], error: null }),
      insert: async () => ({ data: [], error: null }),
      update: async () => ({ data: [], error: null }),
      delete: async () => ({ data: [], error: null }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: "" }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" }, error: null }),
      }),
    },
  } as any
}

// Re-export the isSupabaseConfigured function
export { isSupabaseConfigured }

// Default export
export default createClient()
