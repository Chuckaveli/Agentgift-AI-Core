import { cookies } from "next/headers";
import { createBrowserClient, createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { env } from "./env";

// Create a client for use in browser components
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

// Create a client for server-side environments
export function createServerClient() {
  return createSupabaseServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies },
  );
}

// Create an admin client with service role key
export function createAdminClient() {
  return createSupabaseAdminClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export type SupabaseClient = ReturnType<typeof createClient>;
export type SupabaseServerClient = ReturnType<typeof createServerClient>;
export type SupabaseAdminClient = ReturnType<typeof createAdminClient>;
