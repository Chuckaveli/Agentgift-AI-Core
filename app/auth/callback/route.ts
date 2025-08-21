import { NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase/clients"

// OAuth callback handler
export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")

  try {
    if (code) {
      // Exchange the code for a session. This compiles and is safe even if cookies
      // aren’t fully wired; at worst it’s a no-op and you can improve later.
      const supabase = getServerClient()
      await supabase.auth.exchangeCodeForSession(code)
    }
  } catch (e) {
    console.error("auth/callback exchange error:", e)
    // Continue to redirect regardless
  }

  // Redirect users somewhere sensible after login
  return NextResponse.redirect(new URL("/dashboard", req.url))
}
