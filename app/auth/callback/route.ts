import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const cookieStore = cookies()

  if (code) {
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      await supabase.auth.exchangeCodeForSession(code)

      // Get redirect URL from cookie
      const redirectTo = cookieStore.get("redirect_to")?.value || "/dashboard"

      // Clear the redirect cookie
      const response = NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
      response.cookies.delete("redirect_to")

      return response
    } catch (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(new URL("/auth?error=callback_error", requestUrl.origin))
    }
  }

  // No code provided, redirect to auth
  return NextResponse.redirect(new URL("/auth", requestUrl.origin))
}
