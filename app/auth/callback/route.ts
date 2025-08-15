import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = getServerClient() => cookieStore })

    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(new URL("/auth/signin?error=callback_error", url.origin))
    }
  }

  return NextResponse.redirect(new URL("/dashboard", url.origin))
}
