// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // Skip static assets & public/health endpoints or when env is missing
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api/public") ||
    /\.[a-zA-Z0-9]+$/.test(req.nextUrl.pathname) ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  // Supabase client for Middleware (Edge) with cookie bridge
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          // write refreshed auth cookies onto the response
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const protectedRoutes = [
      "/dashboard",
      "/admin",
      "/settings",
      "/agent-gifty",
      "/smart-search",
      "/gift-dna",
      "/badges",
      "/emotitokens",
      "/agentvault",
      "/assistants",
      "/registry",
    ];

    const path = req.nextUrl.pathname;
    const isProtected = protectedRoutes.some((r) => path.startsWith(r));

    // Not logged in → bounce to signin
    if (isProtected && !session) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/signin";

      // Preserve where we were going (support both "next" and "redirectTo")
      const intended = path + (req.nextUrl.search || "");
      url.searchParams.set("next", intended);
      url.searchParams.set("redirectTo", intended);

      return NextResponse.redirect(url);
    }

    // Logged in → keep auth pages out of the way
    if (
      session &&
      (path.startsWith("/auth/signin") || path.startsWith("/auth/signup"))
    ) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return res;
  } catch (err) {
    // If Supabase fails, just continue without auth (don’t break the site)
    console.warn("Middleware auth skipped due to error:", err);
    return res;
  }
}

// keep middleware off static/image/favicon and common assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
