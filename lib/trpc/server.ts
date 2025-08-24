// lib/trpc/server.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdmin, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/** Server-side Supabase client (SSR cookies) */
function createServerSupabase(): SupabaseClient<Database> {
  const store = cookies();
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient<Database>(url, anon, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      set(name: string, value: string, options?: Parameters<typeof store.set>[2]) {
        // @ts-expect-error next/types are a bit loose here; this is the supported shape
        store.set({ name, value, ...options });
      },
      remove(name: string, options?: Parameters<typeof store.set>[2]) {
        // @ts-expect-error same as above
        store.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });
}

/** Admin client (service role) — server-only */
function createAdminSupabase(): SupabaseClient<Database> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  return createSupabaseAdmin<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch },
  });
}

/** tRPC context */
export const createTRPCContext = async (_opts: { req?: Request }) => {
  const supabase = createServerSupabase();
  const adminSupabase = createAdminSupabase();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    supabase,
    adminSupabase,
    session,
    user: session?.user ?? null,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/** tRPC init */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof z.ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/** Middlewares */
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});

const isAdmin = t.middleware(({ next, ctx }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const role = String(ctx.user.user_metadata?.role || "").toLowerCase();
  const email = ctx.user.email || "";
  const ok = email.endsWith("@agentgift.ai") || role === "admin" || role === "founder";
  if (!ok) throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

/** Exports */
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
