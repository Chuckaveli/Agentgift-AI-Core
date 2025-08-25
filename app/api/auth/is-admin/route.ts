import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ isAdmin: false })

  // uses your SQL function is_admin() that reads auth.uid()
  const { data: isAdmin, error } = await supabase.rpc("is_admin")
  if (error) return NextResponse.json({ isAdmin: false, error: error.message })

  return NextResponse.json({ isAdmin: !!isAdmin })
}
