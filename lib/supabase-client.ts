import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { env, isSupabaseConfigured } from "./env"

// Create the main client for client-side operations
function createClient() {
  if (!isSupabaseConfigured()) {
    console.warn("⚠️ Supabase not configured, using mock client")
    return createMockClient()
  }

  try {
    return createClientComponentClient()
  } catch (error) {
    console.error("❌ Error creating Supabase client:", error)
    console.warn("⚠️ Falling back to mock client")
    return createMockClient()
  }
}

// Create server client for server-side operations (alias for compatibility)
function createServerClient() {
  if (!isSupabaseConfigured()) {
    console.warn("⚠️ Supabase not configured, using mock client")
    return createMockClient()
  }

  try {
    return createClientComponentClient()
  } catch (error) {
    console.error("❌ Error creating Supabase server client:", error)
    console.warn("⚠️ Falling back to mock client")
    return createMockClient()
  }
}

// Create admin client for server-side operations
function createAdminClient() {
  if (!isSupabaseConfigured() || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("⚠️ Supabase admin not configured, using mock client")
    return createMockClient()
  }

  try {
    return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("❌ Error creating Supabase admin client:", error)
    console.warn("⚠️ Falling back to mock client")
    return createMockClient()
  }
}

// Mock client for development/fallback
function createMockClient() {
  const mockError = {
    message:
      "Supabase not configured - please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables",
    details: "This is a mock client. Database operations will not work until Supabase is properly configured.",
  }

  return {
    auth: {
      getUser: () => {
        console.info("🔒 Mock auth: getUser called")
        return Promise.resolve({ data: { user: null }, error: null })
      },
      getSession: () => {
        console.info("🔒 Mock auth: getSession called")
        return Promise.resolve({ data: { session: null }, error: null })
      },
      signInWithPassword: () => {
        console.info("🔒 Mock auth: signInWithPassword called")
        return Promise.resolve({ data: { user: null, session: null }, error: mockError })
      },
      signUp: () => {
        console.info("🔒 Mock auth: signUp called")
        return Promise.resolve({ data: { user: null, session: null }, error: mockError })
      },
      signOut: () => {
        console.info("🔒 Mock auth: signOut called")
        return Promise.resolve({ error: null })
      },
      onAuthStateChange: (callback: any) => {
        console.info("🔒 Mock auth: onAuthStateChange called")
        return {
          data: {
            subscription: {
              unsubscribe: () => console.info("🔒 Mock auth: unsubscribed from auth state changes"),
            },
          },
        }
      },
    },
    from: (table: string) => ({
      select: (columns?: string) => {
        console.info(`📊 Mock DB: SELECT ${columns || "*"} FROM ${table}`)
        return {
          eq: () => ({ data: [], error: null }),
          neq: () => ({ data: [], error: null }),
          gt: () => ({ data: [], error: null }),
          lt: () => ({ data: [], error: null }),
          gte: () => ({ data: [], error: null }),
          lte: () => ({ data: [], error: null }),
          like: () => ({ data: [], error: null }),
          ilike: () => ({ data: [], error: null }),
          is: () => ({ data: [], error: null }),
          in: () => ({ data: [], error: null }),
          contains: () => ({ data: [], error: null }),
          containedBy: () => ({ data: [], error: null }),
          rangeGt: () => ({ data: [], error: null }),
          rangeLt: () => ({ data: [], error: null }),
          rangeGte: () => ({ data: [], error: null }),
          rangeLte: () => ({ data: [], error: null }),
          rangeAdjacent: () => ({ data: [], error: null }),
          overlaps: () => ({ data: [], error: null }),
          textSearch: () => ({ data: [], error: null }),
          match: () => ({ data: [], error: null }),
          not: () => ({ data: [], error: null }),
          or: () => ({ data: [], error: null }),
          filter: () => ({ data: [], error: null }),
          order: () => ({ data: [], error: null }),
          limit: () => ({ data: [], error: null }),
          range: () => ({ data: [], error: null }),
          single: () => ({ data: null, error: null }),
          maybeSingle: () => ({ data: null, error: null }),
          then: (resolve: any) => resolve({ data: [], error: null }),
        }
      },
      insert: (data: any) => {
        console.info(`📊 Mock DB: INSERT INTO ${table}`, data)
        return Promise.resolve({ data: null, error: mockError })
      },
      update: (data: any) => {
        console.info(`📊 Mock DB: UPDATE ${table}`, data)
        return Promise.resolve({ data: null, error: mockError })
      },
      delete: () => {
        console.info(`📊 Mock DB: DELETE FROM ${table}`)
        return Promise.resolve({ data: null, error: mockError })
      },
      upsert: (data: any) => {
        console.info(`📊 Mock DB: UPSERT INTO ${table}`, data)
        return Promise.resolve({ data: null, error: mockError })
      },
    }),
    rpc: (functionName: string, params?: any) => {
      console.info(`🔧 Mock RPC: ${functionName}`, params)
      return Promise.resolve({ data: null, error: mockError })
    },
    storage: {
      from: (bucket: string) => ({
        upload: (path: string, file: any) => {
          console.info(`📁 Mock Storage: upload to ${bucket}/${path}`)
          return Promise.resolve({ data: null, error: mockError })
        },
        download: (path: string) => {
          console.info(`📁 Mock Storage: download from ${bucket}/${path}`)
          return Promise.resolve({ data: null, error: mockError })
        },
        list: (path?: string) => {
          console.info(`📁 Mock Storage: list ${bucket}/${path || ""}`)
          return Promise.resolve({ data: [], error: null })
        },
        remove: (paths: string[]) => {
          console.info(`📁 Mock Storage: remove from ${bucket}`, paths)
          return Promise.resolve({ data: [], error: mockError })
        },
      }),
    },
  } as any
}

export { createClient, createServerClient, createAdminClient }
export default createClient
