import { createTRPCReact } from "@trpc/react-query"
import { httpBatchLink } from "@trpc/client"
import type { AppRouter } from "@/trpc/router"
import superjson from "superjson"
import { env } from "@/lib/env"

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return ""
  }

  // Use NEXT_PUBLIC_BFF_URL from lib/env.ts if available
  const bffUrl = env.NEXT_PUBLIC_BFF_URL

  if (!bffUrl) {
    console.error("NEXT_PUBLIC_BFF_URL is not defined in environment variables.")
    return "http://localhost:3000" // Provide a default value if the variable is not defined
  }

  // Vercel provides NEXT_PUBLIC_VERCEL_URL environment variable
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  // Render provides RENDER_INTERNAL_HOSTNAME
  if (process.env.RENDER_INTERNAL_HOSTNAME) {
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`
  }

  console.log("BFF URL:", bffUrl) // Log the BFF URL to check its value
  console.log("env.NEXT_PUBLIC_BFF_URL:", env.NEXT_PUBLIC_BFF_URL) // Log the BFF URL to check its value

  return bffUrl
}

export const trpc = createTRPCReact<AppRouter>()

export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
})
