import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=auth_callback_error`)
      }

      // Check for redirect cookie
      const redirectCookie = request.cookies.get("redirect_to")
      const redirectTo = redirectCookie?.value || next || "/dashboard"

      // Clear the redirect cookie
      const response = NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
      response.cookies.delete("redirect_to")

      // Trigger onboarding for new users
      if (data.user) {
        try {
          await fetch(`${requestUrl.origin}/api/orchestrator/onboard`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.session?.access_token}`,
            },
          })
        } catch (onboardingError) {
          console.error("Onboarding error:", onboardingError)
          // Don't fail the auth flow if onboarding fails
        }
      }

      return response
    } catch (error) {
      console.error("Unexpected auth error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=unexpected_error`)
    }
  }

  // No code present, redirect to auth
  return NextResponse.redirect(`${requestUrl.origin}/auth`)
}
