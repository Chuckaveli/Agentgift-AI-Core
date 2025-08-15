import { initTRPC, TRPCError } from "@trpc/server"
import { getSupabaseServer } from "@/lib/supabaseServer"

export async function createContext() {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

const t = initTRPC.context<Awaited<ReturnType<typeof createContext>>>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof Error ? error.cause.message : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" })
  }

  // Check if user is admin (you can customize this logic)
  const isAdmin = ctx.user.email?.endsWith("@agentgift.ai") || ctx.user.user_metadata?.role === "admin"

  if (!isAdmin) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})
