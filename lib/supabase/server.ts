// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createSBClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

// Authenticated server client (reads/writes auth cookies)
export function getServerClient(): SupabaseClient {
  const cookieStore = cookies();
  const url = must("NEXT_PUBLIC_SUPABASE_URL");
  const anon = must("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // In Route Handlers, `cookies().set` persists on the response
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

// Admin client (NO cookies, server-only). Do NOT import this in client code.
export function getAdminClient(): SupabaseClient {
  const url = must("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRole = must("SUPABASE_SERVICE_ROLE_KEY");
  return createSBClient(url, serviceRole);
}
