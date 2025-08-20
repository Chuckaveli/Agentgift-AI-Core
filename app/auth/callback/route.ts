<<<<<<< HEAD
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = getServerClient() => cookieStore })

    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(new URL("/auth/signin?error=callback_error", url.origin))
    }
  }

  return NextResponse.redirect(new URL("/dashboard", url.origin))
=======
// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/dashboard";
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
  const code = url.searchParams.get("code");
  if (code) await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL(next, url.origin));
>>>>>>> 4f1ca05 (Update route.ts)
}
