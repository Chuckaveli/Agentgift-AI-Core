// app/auth/callback/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (!code) {
    // Nothing to exchange; send to sign-in with a hint
    return NextResponse.redirect(new URL(`/auth/signin?error=missing_code`, SITE_URL));
  }

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // This sets the auth cookies for the domain in SITE_URL
    await supabase.auth.exchangeCodeForSession(code);

    // Optional: you can validate the session here if you want
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) throw new Error("No user after exchange");
  } catch (err) {
    console.error("[auth/callback] exchange error:", err);
    return NextResponse.redirect(new URL(`/auth/signin?error=callback_error`, SITE_URL));
  }

  // Final redirect to your app’s dashboard (or intended page)
  return NextResponse.redirect(new URL(next, SITE_URL));
}
