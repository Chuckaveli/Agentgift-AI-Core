<<<<<<< HEAD
=======
// app/auth/signin/page.tsx
>>>>>>> d445645 (updated)
"use client";

import { useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Github, Facebook, Chrome, Gamepad2 } from "lucide-react"; // Chrome = Google, Gamepad2 = Discord
import Image from "next/image";
=======
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Chrome, Gamepad2, Facebook } from "lucide-react";
>>>>>>> d445645 (updated)

export default function SignInPage() {
  const supabase = createClientComponentClient();

<<<<<<< HEAD
  // Build redirect URL dynamically (fallback to env or localhost)
  const redirectTo =
    (typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") +
    "/auth/callback";
=======
  const redirectTo =
    (typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") + "/auth/callback";
>>>>>>> d445645 (updated)

  const signInWith = useCallback(
    async (provider: "google" | "discord" | "facebook") => {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });
    },
<<<<<<< HEAD
    [supabase, redirectTo]
=======
    [supabase, redirectTo],
>>>>>>> d445645 (updated)
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Sign in to AgentGift.ai</CardTitle>
          <CardDescription>
            Choose a provider to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => signInWith("google")}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => signInWith("discord")}
          >
            <Gamepad2 className="mr-2 h-4 w-4" />
            Continue with Discord
          </Button>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => signInWith("facebook")}
          >
            <Facebook className="mr-2 h-4 w-4" />
            Continue with Facebook
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
