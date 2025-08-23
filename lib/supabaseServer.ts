// server-only helper
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseServer(): SupabaseClient {
  const store = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, anon, {
    cookies: {
      get: (name) => store.get(name)?.value,
      set: (name, value, options) => store.set({ name, value, ...options }),
      remove: (name, options) => store.set({ name, value: "", ...options }),
    },
  });
}
