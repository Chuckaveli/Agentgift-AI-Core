"use client";

import { useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Github, Facebook, Chrome, Gamepad2 } from "lucide-react"; // Chrome = Google, Gamepad2 = Discord
import Image from "next/image";

export default function SignInPage() {
  const supabase = createClientComponentClient();

  // Build redirect URL dynamically (fallback to env or localhost)
  const redirectTo =
    (typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") +
    "/auth/callback";

  const signInWith = useCallback(
    async (provider: "google" | "discord" | "facebook") => {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });
    },
    [supabase, redirectTo]
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            <Image
              src="https://agentgift.ai/agentgift-logo.png"
              alt="AgentGift.ai"
              width={56}
              height={56}
            />
          </div>
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
