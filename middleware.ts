import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl

  // Skip middleware for static files, ALL API routes (prevents loops), and when envs are missing
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next()
  }

  // Only enforce admin check on /admin/*
  if (pathname.startsWith("/admin")) {
    try {
      const res = await fetch(new URL("/api/auth/is-admin", origin), {
        headers: { cookie: req.headers.get("cookie") ?? "" },
        cache: "no-store",
      })

      // Not signed in or couldn’t verify → send to signin
      if (!res.ok) {
        const signin = new URL("/auth/signin", origin)
        signin.searchParams.set("reason", "auth")
        signin.searchParams.set("redirectTo", pathname)
        return NextResponse.redirect(signin)
      }

      const { isAdmin } = (await res.json()) as { isAdmin?: boolean }

      // Non-admins → bounce to dashboard
      if (!isAdmin) {
        const dash = new URL("/dashboard", origin)
        dash.searchParams.set("denied", "admin")
        return NextResponse.redirect(dash)
      }

      // Admins pass through
      return NextResponse.next()
    } catch {
      const signin = new URL("/auth/signin", origin)
      signin.searchParams.set("reason", "auth")
      signin.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(signin)
    }
  }

  // Everything else just passes through
  return NextResponse.next()
}

export const config = {
  matcher: [
    // keep your existing wide matcher and file exclusions
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
