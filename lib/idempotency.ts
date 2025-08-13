import { createHash } from "crypto"

export function getIdempotencyKey(request: Request, providedKey?: string): string {
  if (providedKey) {
    return providedKey
  }

  // Generate idempotency key from request details
  const url = new URL(request.url)
  const method = request.method
  const timestamp = Math.floor(Date.now() / (1000 * 60)) // 1-minute window

  const keyData = `${method}:${url.pathname}:${timestamp}`
  return createHash("sha256").update(keyData).digest("hex").substring(0, 16)
}

export function isIdempotentRequest(method: string): boolean {
  return ["POST", "PUT", "PATCH"].includes(method.toUpperCase())
}
