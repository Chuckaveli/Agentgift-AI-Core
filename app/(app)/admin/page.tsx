// app/(app)/admin/page.tsx  — Server Component
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export default async function AdminPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (key) => cookieStore.get(key)?.value } }
  )

  // Require sign-in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Server-side admin check via your SQL helper
  const { data: isAdmin, error } = await supabase.rpc("auth_is_admin")
  if (error) {
    // (Optional) log error somewhere
    redirect("/dashboard") // fail-safe
  }
  if (!isAdmin) redirect("/dashboard")

  // If we’re here, you’re admin 🎩
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Admin Control</h1>
      <p className="opacity-70 mt-2">Welcome, command center is all yours.</p>
      {/* ...your admin UI... */}
    </main>
  )
}
