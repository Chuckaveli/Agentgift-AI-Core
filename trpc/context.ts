import { createServerClient } from "@/lib/supabase-server"
import type { CreateNextContextOptions } from "@trpc/server/adapters/next"
import { initTRPC, TRPCError } from "@trpc/server"

// Initialize TRPC
const t = initTRPC.context<Context>().create()

// Create a router
export const router = t.router

// Create a public procedure
export const publicProcedure = t.procedure

// Create a protected procedure
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.supabase.auth.getSession()) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      supabase: ctx.supabase,
      user: (await ctx.supabase.auth.getUser()).data.user,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req, res } = opts

  // Create the Supabase client
  const supabase = createServerClient()

  return {
    req,
    res,
    supabase,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

// Export getSupabaseServer for backward compatibility
export async function getSupabaseServer() {
  return createServerClient()
}

export const createContext = createTRPCContext
