import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = getServerClient()

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("Error signing out:", error)
    return NextResponse.redirect(new URL("/", request.url))
  }
}
