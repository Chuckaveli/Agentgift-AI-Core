import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return false
  }

  // Check for placeholder values
  const placeholders = ["placeholder", "your-", "example", "localhost", ""]
  if (
    placeholders.some(
      (placeholder) =>
        supabaseUrl.toLowerCase().includes(placeholder) || supabaseAnonKey.toLowerCase().includes(placeholder),
    ) ||
    supabaseUrl.trim() === "" ||
    supabaseAnonKey.trim() === ""
  ) {
    return false
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
    return supabaseUrl.includes("supabase.co") || supabaseUrl.includes("localhost")
  } catch {
    return false
  }
}

// Mock client for demo mode
const mockClient = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () =>
      Promise.resolve({ data: { user: null }, error: { message: "Demo mode - authentication disabled" } }),
    signUp: () => Promise.resolve({ data: { user: null }, error: { message: "Demo mode - authentication disabled" } }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: () => ({ data: [], error: null }),
      neq: () => ({ data: [], error: null }),
      gt: () => ({ data: [], error: null }),
      lt: () => ({ data: [], error: null }),
      gte: () => ({ data: [], error: null }),
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
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null }),
    }),
    insert: (data: any) => Promise.resolve({ data: null, error: { message: "Demo mode" } }),
    update: (data: any) => Promise.resolve({ data: null, error: { message: "Demo mode" } }),
    delete: () => Promise.resolve({ data: null, error: { message: "Demo mode" } }),
    upsert: (data: any) => Promise.resolve({ data: null, error: { message: "Demo mode" } }),
  }),
  rpc: (functionName: string, params?: any) => Promise.resolve({ data: null, error: { message: "Demo mode" } }),
}

// Create client function
export function createClient() {
  if (!isSupabaseConfigured()) {
    console.warn("⚠️ Supabase not configured, using mock client")
    return mockClient as any
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  try {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("❌ Error creating Supabase client:", error)
    console.warn("⚠️ Falling back to mock client")
    return mockClient as any
  }
}

// Create admin client function
export function createAdminClient() {
  if (!isSupabaseConfigured()) {
    console.warn("⚠️ Supabase not configured, using mock client")
    return mockClient as any
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    console.warn("⚠️ Service role key not configured, using regular client")
    return createClient()
  }

  try {
    return createSupabaseClient(supabaseUrl, serviceRoleKey)
  } catch (error) {
    console.error("❌ Error creating Supabase admin client:", error)
    console.warn("⚠️ Falling back to mock client")
    return mockClient as any
  }
}

// Create server client function
export function createServerClient() {
  return createClient()
}

// Safe default export - only create client when actually needed
let _supabaseClient: any = null

export function getSupabaseClient() {
  if (!_supabaseClient) {
    _supabaseClient = createClient()
  }
  return _supabaseClient
}

// Default export for backward compatibility - use lazy initialization
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const client = getSupabaseClient()
    return client[prop]
  },
})

export default supabase
