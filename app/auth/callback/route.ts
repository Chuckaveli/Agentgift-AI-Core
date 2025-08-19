<<<<<<< HEAD
=======
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
>>>>>>> origin/main
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectTo = requestUrl.searchParams.get("redirect") || "/dashboard"

  if (code) {
    const cookieStore = cookies()
    const supabase = getServerClient() => cookieStore })

    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(new URL("/auth?error=auth_callback_error", request.url))
    }
  }

  // Check for redirect cookie
  const cookieStore = cookies()
  const redirectCookie = cookieStore.get("redirect_to")
  const finalRedirect = redirectCookie?.value || redirectTo

  // Clear the redirect cookie
  const response = NextResponse.redirect(new URL(finalRedirect, request.url))
  response.cookies.delete("redirect_to")

  return response
}
