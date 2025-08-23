"use client"

export const dynamic = "force-dynamic"

import { useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getBrowserClient } from "@/lib/supabase/browser"
import Link from "next/link"

export default function SignUpPage() {
  const params = useSearchParams()
  const next = params.get("next") || "/dashboard"

  const signUpWithGoogle = useCallback(async () => {
    const supabase = getBrowserClient()
    const origin = window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }, [next])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={signUpWithGoogle}>
            Continue with Google
          </Button>

          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link className="underline" href={`/auth/signin?next=${encodeURIComponent(next)}`}>
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
