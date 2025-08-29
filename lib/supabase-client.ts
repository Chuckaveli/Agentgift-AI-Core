import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Validation functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function isSupabaseUrl(url: string): boolean {
  return url.includes("supabase.co") || url.includes("localhost")
}

function isPlaceholder(value: string): boolean {
  const placeholders = ["your-project", "your_project", "placeholder", "example", "demo"]
  return placeholders.some((p) => value.toLowerCase().includes(p))
}

// Environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Validation
const isValidConfig =
  supabaseUrl &&
  supabaseAnonKey &&
  isValidUrl(supabaseUrl) &&
  isSupabaseUrl(supabaseUrl) &&
  !isPlaceholder(supabaseUrl) &&
  !isPlaceholder(supabaseAnonKey)

// Mock client for demo mode
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () =>
      Promise.resolve({
        data: { user: null, session: null },
        error: { message: "Demo mode - authentication disabled" },
      }),
    signUp: () =>
      Promise.resolve({
        data: { user: null, session: null },
        error: { message: "Demo mode - authentication disabled" },
      }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: { message: "Demo mode - database disabled" } }),
    update: () => Promise.resolve({ data: null, error: { message: "Demo mode - database disabled" } }),
    delete: () => Promise.resolve({ data: null, error: { message: "Demo mode - database disabled" } }),
  }),
  rpc: () => Promise.resolve({ data: null, error: { message: "Demo mode - functions disabled" } }),
})

// Create client function - REQUIRED NAMED EXPORT
export function createClient() {
  if (!isValidConfig) {
    console.warn("Supabase not configured properly, using demo mode")
    return createMockClient() as any
  }

  try {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  } catch (error) {
    console.warn("Failed to create Supabase client, using demo mode:", error)
    return createMockClient() as any
  }
}

// Create admin client function - REQUIRED NAMED EXPORT
export function createAdminClient() {
  if (!isValidConfig) {
    console.warn("Supabase not configured properly, using demo mode")
    return createMockClient() as any
  }

  if (!serviceRoleKey) {
    console.warn("Service role key not configured, using regular client")
    return createClient()
  }

  try {
    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  } catch (error) {
    console.warn("Failed to create Supabase admin client, using demo mode:", error)
    return createMockClient() as any
  }
}

// Create server client function - REQUIRED NAMED EXPORT
export function createServerClient() {
  return createClient()
}

// Additional exports for compatibility
export const supabase = createClient()
export const isSupabaseConfigured = () => isValidConfig
export const getSupabaseClient = () => createClient()
export default supabase
