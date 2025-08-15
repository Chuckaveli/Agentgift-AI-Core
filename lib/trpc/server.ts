import { initTRPC, TRPCError } from "@trpc/server"
import { z } from "zod"
import { createServerClient, createAdminClient } from "@/lib/supabase-client"
import superjson from "superjson"

// Create context for tRPC
export const createTRPCContext = async (opts: { req?: Request }) => {
  const supabase = createServerClient()
  const adminSupabase = createAdminClient()

  // Get user session
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  return {
    supabase,
    adminSupabase,
    session,
    user: session?.user || null,
  }
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof z.ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

// Create reusable middleware
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  })
})

const isAdmin = t.middleware(({ next, ctx }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  // Check if user has admin role (you can customize this logic)
  const isUserAdmin = ctx.user.email?.endsWith("@agentgift.ai") || ctx.user.user_metadata?.role === "admin"

  if (!isUserAdmin) {
    throw new TRPCError({ code: "FORBIDDEN" })
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  })
})

// Create router and procedure helpers
export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
export const adminProcedure = t.procedure.use(isAdmin)
