import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "@/trpc/router"
import { createContext } from "@/trpc/context"

export const runtime = "nodejs"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      // Expose Request for idempotency helper
      ;(globalThis as any).__NEXT_PRIVATE_REQ__ = req
      return await createContext()
    },
    onError({ error, path }) {
      console.error(`tRPC error at ${path}:`, error)
    },
  })

export { handler as GET, handler as POST }
