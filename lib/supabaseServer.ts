import { env } from "./env"
import { getServerClient } from "@/lib/supabase/clients"

export function getSupabaseServer() {
  const cookieStore = cookies()

  return getServerClient() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Backward compatibility export
export const createServerSupabaseClient = getServerClient
export default getServerClient
