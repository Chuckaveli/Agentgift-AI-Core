"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function SignInPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const search = useSearchParams();

<<<<<<< HEAD
=======
  const redirectTo = search.get("redirectTo") || "/dashboard";
  const reason = search.get("reason");

>>>>>>> 2b0f65d (UPDATED)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // after we have a session, bounce to redirectTo
        router.replace(redirectTo);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, router, redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Sign in to AgentGift.ai</h1>
          {reason === "auth" && (
            <p className="text-sm text-gray-500">Please sign in to continue.</p>
          )}
          {reason === "admin" && (
            <p className="text-sm text-gray-500">
              Admin access required. Sign in with an admin account.
            </p>
          )}
        </div>

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
        </div>
      </div>
    </div>
  );
}
