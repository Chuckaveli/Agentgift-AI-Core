// app/api/auth/is-admin/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // In dev, fail closed (not admin) instead of throwing
  if (!url || !anon) {
    return NextResponse.json({ is_admin: false, error: "Supabase env not set" }, { status: 200 });
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ is_admin: false }, { status: 200 });

  const { data, error } = await supabase
    .from("admin_roles")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    // fail closed
    return NextResponse.json({ is_admin: false }, { status: 200 });
  }

  return NextResponse.json({ is_admin: !!data?.is_admin }, { status: 200 });
}
