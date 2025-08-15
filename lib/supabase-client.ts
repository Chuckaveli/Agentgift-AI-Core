// Backward compatibility exports - redirects to new client structure
import { getBrowserClient, getServerClient, getAdminClient } from "@/lib/supabase/clients"

// Named exports for backward compatibility
export const createClient = getBrowserClient
export const createServerClient = getServerClient
export const createAdminClient = getAdminClient

// Default export
export default getBrowserClient
