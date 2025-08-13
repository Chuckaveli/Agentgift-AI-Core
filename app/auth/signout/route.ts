import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("Error signing out:", error)
    return NextResponse.redirect(new URL("/", request.url))
  }
}
