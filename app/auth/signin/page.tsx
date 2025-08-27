"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SignInMagicOnly() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const search = useSearchParams();

<<<<<<< HEAD
=======
  const redirectTo = search.get("redirectTo") || "/dashboard";

<<<<<<< HEAD
>>>>>>> 2b0f65d (UPDATED)
=======
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If a session appears (e.g., after returning from magic link), bounce to redirectTo
>>>>>>> 155f889 (updated)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace(redirectTo);
    });
    return () => subscription.unsubscribe();
  }, [supabase, router, redirectTo]);

  const sendMagicLink = async () => {
    setErrorMsg(null);
    if (!email) {
      setErrorMsg("Enter your email.");
      return;
    }
    try {
      setStatus("sending");

      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "";

      const emailRedirectTo = `${origin}/auth/callback?redirectTo=${encodeURIComponent(
        redirectTo
      )}`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo },
      });

      if (error) {
        setErrorMsg(error.message);
        setStatus("error");
      } else {
        setStatus("sent");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Sign in to AgentGift.ai</h1>
          <p className="text-sm text-gray-500">We’ll email you a secure sign-in link.</p>
        </div>

<<<<<<< HEAD
        <div className="rounded-lg border p-4">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            view="sign_in"
<<<<<<< HEAD
            providers={["google", "apple"]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#9333ea",
                    brandAccent: "#7c3aed",
                    brandButtonText: "white",
                    defaultButtonBackground: "#f3f4f6",
                    defaultButtonBackgroundHover: "#e5e7eb",
                    inputBackground: "#f9fafb",
                    inputBorder: "#d1d5db",
                    inputBorderHover: "#9333ea",
                    inputBorderFocus: "#7c3aed",
                  },
                  borderWidths: {
                    buttonBorderWidth: "1px",
                    inputBorderWidth: "1px",
                  },
                  radii: {
                    borderRadiusButton: "8px",
                    buttonBorderRadius: "8px",
                    inputBorderRadius: "8px",
                  },
                },
              },
              className: {
                container: "space-y-4",
                button: "w-full px-4 py-3 font-medium transition-all duration-200",
                input: "w-full px-4 py-3 transition-all duration-200",
                label: "text-sm font-medium text-gray-700 mb-2",
                message: "text-sm text-red-600 mt-2",
              },
            }}
            redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
            showLinks={false}
=======
            // Optional: style the UI to match your brand
            theme="light"
            onlyThirdPartyProviders={false}
>>>>>>> 2b0f65d (UPDATED)
          />
=======
        <div className="rounded-lg border p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-600">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

          {status === "sent" ? (
            <p className="text-sm text-green-700">
              Magic link sent! Check your inbox to continue.
            </p>
          ) : (
            <button
              onClick={sendMagicLink}
              disabled={status === "sending"}
              className="w-full rounded-md bg-purple-600 text-white py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
            >
              {status === "sending" ? "Sending..." : "Send magic link"}
            </button>
          )}

          <p className="text-xs text-gray-500">
            No password needed. If this email isn’t registered, we’ll create your account when you click the link.
          </p>
>>>>>>> 155f889 (updated)
        </div>
      </div>
    </div>
  );
}
