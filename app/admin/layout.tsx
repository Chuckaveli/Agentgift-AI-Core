// app/admin/layout.tsx
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Require a signed-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Check admin_roles for this user
  const { data, error } = await supabase
    .from("admin_roles")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  // If query fails or user isn't admin, bounce to dashboard
  if (error || !data?.is_admin) redirect("/dashboard");

  return <>{children}</>;
}
