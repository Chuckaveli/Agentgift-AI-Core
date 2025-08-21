// lib/supabase/clients.ts
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}. Add it to .env.local and Vercel Project Settings.`);
  return v;
}

const isServer = typeof window === "undefined";

/** Browser client (anon key) */
export function getBrowserClient(): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createSupabaseClient(url, anon);
}

/** Server client (anon key) */
export function getServerClient(): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createSupabaseClient(url, anon);
}

/** Admin client (service role) — server only */
export function createAdminClient(): SupabaseClient {
  if (!isServer) throw new Error("createAdminClient() can only be used on the server.");
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRole = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createSupabaseClient(url, serviceRole);
}

/** Back-compat: some files import { createClient } from this module */
export function createClient(): SupabaseClient {
  return getBrowserClient();
}

// Alias used by some server code
export { getServerClient as createServerClient };
