// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = getSupabaseServer();

    // 1) Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/auth/signin?error=${encodeURIComponent(error.message)}`
      );
    }

    // 2) Ensure profile exists / is up-to-date (table uses user_id now)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const fullName =
        (user.user_metadata as Record<string, any> | undefined)?.full_name ?? null;

      await supabase
        .from("user_profiles")
        .upsert(
          {
            user_id: user.id,          // <-- IMPORTANT: user_id (FK to auth.users)
            email: user.email ?? null,
            name: fullName,
          },
          { onConflict: "user_id" }    // <-- match new PK/FK column
        );
      // (ignore upsert error; the auth trigger also creates a row)
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
