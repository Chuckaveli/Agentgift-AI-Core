import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Sign out error:", error)
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin), {
    status: 301,
  })
}
