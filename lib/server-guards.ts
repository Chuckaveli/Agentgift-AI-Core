// lib/server-guards.ts
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"

type HandlerCtx = {
  req: Request
  supabase: ReturnType<typeof createRouteHandlerClient>
  user: User
}

export function withAdminRoute(
  handler: (ctx: HandlerCtx) => Promise<Response>
) {
  return async (req: Request) => {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data: isAdmin, error } = await supabase.rpc("is_admin", { uid: user.id })

    if (error) {
      console.error("is_admin rpc error:", error)
      return NextResponse.json({ error: "Auth check failed" }, { status: 500 })
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return handler({ req, supabase, user })
  }
}
