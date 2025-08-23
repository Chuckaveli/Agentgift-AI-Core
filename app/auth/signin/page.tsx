// app/auth/signin/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const supabase = getBrowserClient(); // your client-only singleton
  const sp = useSearchParams();
  const next = sp.get("next") || sp.get("redirectTo") || "/dashboard";

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      console.error("OAuth error:", error.message);
      alert(`Sign-in failed: ${error.message}`);
    }
  }, [next, supabase]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Sign in to AgentGift</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={signInWithGoogle} className="w-full">
            Continue with Google
          </Button>

          {/* If you later add GitHub, just uncomment:
          <Button variant="outline" onClick={signInWithGitHub} className="w-full">
            Continue with GitHub
          </Button>
          */}

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a className="underline" href={`/auth/signup?next=${encodeURIComponent(next)}`}>
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
