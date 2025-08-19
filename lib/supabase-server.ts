import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side client for API routes and server components
export function createServerClient() {
  const cookieStore = cookies()

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      getSession: async () => {
        const accessToken = cookieStore.get("sb-access-token")?.value
        const refreshToken = cookieStore.get("sb-refresh-token")?.value

        if (!accessToken || !refreshToken) {
          return { data: { session: null }, error: null }
        }

        return {
          data: {
            session: {
              access_token: accessToken,
              refresh_token: refreshToken,
              user: null,
              expires_at: 0,
              expires_in: 0,
              token_type: "bearer",
            },
          },
          error: null,
        }
      },
      setSession: async (session) => {
        if (session) {
          cookieStore.set("sb-access-token", session.access_token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          })
          cookieStore.set("sb-refresh-token", session.refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          })
        } else {
          cookieStore.delete("sb-access-token")
          cookieStore.delete("sb-refresh-token")
        }
      },
    },
  })
}

// Admin client with service role key for server-side operations
export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
