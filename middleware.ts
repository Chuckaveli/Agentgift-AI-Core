// middleware.ts
import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  // 0) Always let the OAuth callback through
  if (req.nextUrl.pathname.startsWith("/auth/callback")) {
    return NextResponse.next()
  }

  // Skip static assets & public API
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api/public") ||
    /\.[a-zA-Z0-9]+$/.test(req.nextUrl.pathname) ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    },
  )

  try {
    const { data: { session } } = await supabase.auth.getSession()

    const protectedRoutes = [
      "/dashboard",
      "/admin",
      "/settings",
      "/agent-gifty",
      "/smart-search",
      "/gift-dna",
      "/badges",
      "/emotitokens",
      "/agentvault",
      "/assistants",
      "/registry",
    ]

    const path = req.nextUrl.pathname
    const isProtected = protectedRoutes.some((r) => path.startsWith(r))

    if (isProtected && !session) {
      const url = req.nextUrl.clone()
      url.pathname = "/auth/signin"
      url.searchParams.set("next", path + (req.nextUrl.search || ""))
      return NextResponse.redirect(url)
    }

    if (session && (path.startsWith("/auth/signin") || path.startsWith("/auth/signup"))) {
      const url = req.nextUrl.clone()
      url.pathname = "/dashboard"
      url.search = ""
      return NextResponse.redirect(url)
    }

    return res
  } catch (err) {
    console.warn("Middleware auth skipped due to error:", err)
    return res
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
