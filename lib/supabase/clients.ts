import { createClient as createBrowserClient } from "@/lib/supabase-client"

// Browser-safe client functions
export function getClient() {
  return createBrowserClient()
}

export function getServerClient() {
  // In browser context, use browser client
  if (typeof window !== "undefined") {
    return createBrowserClient()
  }

  // In server context, dynamically import server client
  const { createServerClient } = require("@/lib/supabase-server")
  return createServerClient()
}

export function getAdminClient() {
  // In browser context, use browser client
  if (typeof window !== "undefined") {
    console.warn("Admin client not available in browser context")
    return createBrowserClient()
  }

  // In server context, dynamically import admin client
  const { createAdminClient } = require("@/lib/supabase-server")
  return createAdminClient()
}

// Add the missing export that was causing deployment errors
export const getBrowserClient = getClient
</merged_code>
