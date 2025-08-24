// lib/auth-helpers.ts
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export async function getUserOrRedirect(redirectTo = "/auth/signin") {
  const supabase = getServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`${redirectTo}?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}

export async function getOptionalUser() {
  const supabase = getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export function setServerSessionCookies(
  response: NextResponse,
  sessionData: { access_token: string; refresh_token: string; expires_in: number }
) {
  response.cookies.set("sb-access-token", sessionData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: sessionData.expires_in,
    path: "/",
  });

  response.cookies.set("sb-refresh-token", sessionData.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}

export async function requireAdmin() {
  const user = await getUserOrRedirect("/auth/signin");

  const role = String(user.user_metadata?.role || "").toLowerCase();
  const email = user.email || "";
  const isAdmin = email.endsWith("@agentgift.ai") || role === "admin" || role === "founder";

  if (!isAdmin) redirect("/dashboard");
  return user;
}
