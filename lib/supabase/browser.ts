"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _client: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  if (!URL || !ANON) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (!_client) _client = createBrowserClient(URL, ANON);
  return _client;
}

// alias for existing code that imported `createClient` from your old file
export function createClient(): SupabaseClient {
  return getBrowserClient();
}
