import { redirect } from "next/navigation"
import type { NextResponse } from "next/server"

export async function getUserOrRedirect(redirectTo = "/auth") {
  const cookieStore = cookies()
  const supabase = getServerClient() => cookieStore })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect(`${redirectTo}?redirect=${encodeURIComponent(redirectTo)}`)
  }

  return user
}

export async function getOptionalUser() {
  const cookieStore = cookies()
  const supabase = getServerClient() => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export function setServerSessionCookies(response: NextResponse, sessionData: any) {
  // Set session cookies for server-side auth
  response.cookies.set("sb-access-token", sessionData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: sessionData.expires_in,
    path: "/",
  })

  response.cookies.set("sb-refresh-token", sessionData.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  })

  return response
}

export async function requireAdmin() {
  const user = await getUserOrRedirect("/auth")

  // Check if user is admin (you can customize this logic)
  const isAdmin = user.email === "admin@agentgift.ai" || user.user_metadata?.role === "admin"

  if (!isAdmin) {
    redirect("/dashboard")
  }

  return user
}
