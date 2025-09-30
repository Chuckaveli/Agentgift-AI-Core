import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { validateCsrfToken, addCsrfToken } from "@/lib/security/csrf"
import { rateLimit, rateLimitConfigs } from "@/lib/security/rate-limiter"

export async function middleware(req: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://vercel.live",
    "frame-ancestors 'none'",
  ].join("; ")

  response.headers.set("Content-Security-Policy", csp)

  // Apply rate limiting based on path
  const path = req.nextUrl.pathname

  if (path.startsWith("/api/auth/signin")) {
    const rateLimitResponse = await rateLimit(rateLimitConfigs.auth)(req)
    if (rateLimitResponse) return rateLimitResponse
  } else if (path.startsWith("/api/auth/signup")) {
    const rateLimitResponse = await rateLimit(rateLimitConfigs.signup)(req)
    if (rateLimitResponse) return rateLimitResponse
  } else if (path.startsWith("/api/admin")) {
    const rateLimitResponse = await rateLimit(rateLimitConfigs.admin)(req)
    if (rateLimitResponse) return rateLimitResponse
  } else if (path.startsWith("/api/gift-suggestions")) {
    const rateLimitResponse = await rateLimit(rateLimitConfigs.giftSuggestions)(req)
    if (rateLimitResponse) return rateLimitResponse
  } else if (path.startsWith("/api")) {
    const rateLimitResponse = await rateLimit(rateLimitConfigs.api)(req)
    if (rateLimitResponse) return rateLimitResponse
  }

  // CSRF protection for state-changing requests
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    if (!validateCsrfToken(req)) {
      return NextResponse.json(
        {
          error: "Invalid CSRF token",
          message: "CSRF token validation failed",
        },
        { status: 403 },
      )
    }
  }

  // Add CSRF token to response
  return addCsrfToken(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
