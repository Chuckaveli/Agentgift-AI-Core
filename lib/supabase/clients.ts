// lib/supabase/clients.ts
"use server";

import { cookies } from "next/headers";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) {
  throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_URL is not defined");
}

if (!anon) {
  throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined");
}

export function getBrowserClient() {
  // use in "use client" components
  return createBrowserClient(url, anon);
}

export function getServerClient() {
  // use in RSC, route handlers, and server actions
  return createServerClient(url, anon, { cookies });
}
