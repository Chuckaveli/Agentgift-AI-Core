// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerClient } from "@/lib/supabase/clients";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/dashboard";
  const supabase = getServerClient();
  const code = url.searchParams.get("code");
  if (code) await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL(next, url.origin));
}
