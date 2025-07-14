import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Protected routes that require authentication
const protectedRoutes = ["/dashboard", "/admin", "/features", "/business", "/api/protected"]

// Public routes that should always be accessible
const publicRoutes = ["/", "/tokenomics", "/pricing", "/terms", "/contact", "/login", "/signup"]

// Admin-only routes
const adminRoutes = ["/admin", "/api/admin"]

// Feature-specific routes with tier requirements
const featureRoutes = {
  "/features/ai-companion": "agent_00g",
  "/features/gift-campaigns": "pro_agent",
  "/features/reminder-scheduler": "pro_agent",
  "/features/social-proof-verifier": "premium_spy",
  "/api/features/ai-companion": "agent_00g",
  "/api/features/gift-campaigns": "pro_agent",
  "/api/features/reminder-scheduler": "pro_agent",
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { pathname } = req.nextUrl

  // Allow public routes to pass through without authentication
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  if (isPublicRoute) {
    return res
  }

  // Check authentication for protected routes
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated, get their profile for additional checks
  if (session) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("tier, credits, role")
      .eq("id", session.user.id)
      .single()

    // Check admin access
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

    if (isAdminRoute && profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Check feature-specific tier requirements
    const featureRoute = Object.keys(featureRoutes).find((route) => pathname.startsWith(route))

    if (featureRoute && profile) {
      const requiredTier = featureRoutes[featureRoute as keyof typeof featureRoutes]

      const tierLevels = {
        free_agent: 0,
        premium_spy: 1,
        pro_agent: 2,
        agent_00g: 3,
        small_biz: 4,
        enterprise: 5,
      }

      const userTierLevel = tierLevels[profile.tier as keyof typeof tierLevels] || 0
      const requiredTierLevel = tierLevels[requiredTier as keyof typeof tierLevels]

      if (userTierLevel < requiredTierLevel) {
        // For API routes, return 403
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            {
              error: "Insufficient tier access",
              requiredTier,
              currentTier: profile.tier,
              upgradeUrl: `/pricing?tier=${requiredTier}`,
            },
            { status: 403 },
          )
        }

        // For UI routes, redirect to upgrade page
        const upgradeUrl = new URL("/pricing", req.url)
        upgradeUrl.searchParams.set("tier", requiredTier)
        upgradeUrl.searchParams.set("feature", featureRoute)
        return NextResponse.redirect(upgradeUrl)
      }
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}
