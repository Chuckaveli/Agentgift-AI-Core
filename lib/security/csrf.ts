import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = "csrf-token"
const CSRF_HEADER_NAME = "x-csrf-token"

// Generate CSRF token
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex")
}

// Validate CSRF token
export function validateCsrfToken(req: NextRequest): boolean {
  // Skip CSRF check for GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return true
  }

  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value
  const headerToken = req.headers.get(CSRF_HEADER_NAME)

  if (!cookieToken || !headerToken) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
}

// Middleware to add CSRF token to response
export function addCsrfToken(response: NextResponse): NextResponse {
  const token = generateCsrfToken()

  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  })

  return response
}

// Helper to check CSRF protection
export async function withCsrfProtection(
  req: NextRequest,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  if (!validateCsrfToken(req)) {
    return NextResponse.json(
      {
        error: "Invalid CSRF token",
        message: "CSRF token validation failed",
      },
      { status: 403 },
    )
  }

  return handler()
}
