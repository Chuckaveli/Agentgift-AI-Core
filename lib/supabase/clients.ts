// lib/supabase/clients.ts
"use server";

import { cookies } from "next/headers";
import { createBrowserClient, createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function getBrowserClient() {
  // use in "use client" components
  return createBrowserClient(url, anon);
}

export function getServerClient() {
  // use in RSC, route handlers, and server actions
  return createServerClient(url, anon, { cookies });
}
