import { type NextRequest, NextResponse } from "next/server"

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })
  },
  5 * 60 * 1000,
)

export function rateLimit(config: RateLimitConfig) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const identifier = getIdentifier(req)
    const now = Date.now()

    // Initialize or get existing rate limit data
    if (!store[identifier] || store[identifier].resetTime < now) {
      store[identifier] = {
        count: 0,
        resetTime: now + config.windowMs,
      }
    }

    // Increment request count
    store[identifier].count++

    // Check if limit exceeded
    if (store[identifier].count > config.maxRequests) {
      const retryAfter = Math.ceil((store[identifier].resetTime - now) / 1000)

      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": store[identifier].resetTime.toString(),
          },
        },
      )
    }

    // Add rate limit headers to response
    const remaining = config.maxRequests - store[identifier].count

    return null // Allow request to proceed
  }
}

// Get unique identifier for rate limiting
function getIdentifier(req: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIp || "unknown"

  // Include user agent for additional uniqueness
  const userAgent = req.headers.get("user-agent") || "unknown"

  return `${ip}:${userAgent}`
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  signup: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  giftSuggestions: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  },
}

// Helper to apply rate limiting to API routes
export async function withRateLimit(
  req: NextRequest,
  config: RateLimitConfig,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const rateLimitResponse = await rateLimit(config)(req)

  if (rateLimitResponse) {
    return rateLimitResponse
  }

  return handler()
}
