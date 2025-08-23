"use client"

import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { Gift } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

const supabase = createClientComponentClient()

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect_to") || "/dashboard"

  // Determine site URL for Supabase redirect. Falls back to the current
  // browser origin if NEXT_PUBLIC_SITE_URL isn't configured which avoids
  // generating `undefined/auth/callback` during deployment.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")

  useEffect(() => {
    // Set redirect cookie for auth callback
    if (redirectTo) {
      document.cookie = `redirect_to=${redirectTo}; path=/; max-age=3600`
    }
  }, [redirectTo])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AgentGift.ai
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join AgentGift.ai</h2>
          <p className="text-gray-600">Create your account to get personalized gift recommendations</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Auth
            supabaseClient={supabase}
            view="sign_up"
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
            redirectTo={`${siteUrl}/auth/callback`}
            showLinks={false}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/signin" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our{" "}
            <Link href="/legal/terms" className="text-purple-600 hover:text-purple-500">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-purple-600 hover:text-purple-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
