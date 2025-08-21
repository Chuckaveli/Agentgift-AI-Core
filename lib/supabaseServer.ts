import { getServerClient } from "@/lib/supabase/clients"

export function getSupabaseServer() {
  return getServerClient()
}

// Optional back-compat, in case other modules expect this name:
export { getServerClient }
export default getSupabaseServer
