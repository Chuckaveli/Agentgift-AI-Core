import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { env, validateEnv } from "./env"

// Validate environment variables but don't throw in development
const isValid = validateEnv()

// Create a singleton Supabase client for browser use
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

export function createClient() {
  // If environment variables are missing, return a mock client for development
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("⚠️  Supabase environment variables not found. Using mock client.")

    // Return a mock client that won't crash the app
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({ data: { user: null }, error: { message: "Supabase not configured" } }),
        signUp: async () => ({ data: { user: null }, error: { message: "Supabase not configured" } }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: [], error: null }),
        update: () => ({ data: [], error: null }),
        delete: () => ({ data: [], error: null }),
      }),
    } as any
  }

  if (!supabaseClient) {
    supabaseClient = createClientComponentClient({
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }
  return supabaseClient
}

// Default export for backward compatibility
export default createClient()
