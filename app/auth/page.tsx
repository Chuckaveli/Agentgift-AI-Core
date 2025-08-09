"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Gift, Heart, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [redirectTo, setRedirectTo] = useState("/dashboard")

  useEffect(() => {
    // Get redirect parameter and store in cookie
    const redirect = searchParams.get("redirect")
    if (redirect) {
      setRedirectTo(redirect)
      document.cookie = `redirect_to=${redirect}; path=/; max-age=600` // 10 minutes
    }

    // Check if user is already authenticated
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        // User is already logged in, trigger onboarding and redirect
        await triggerOnboarding()
        router.push(redirectTo)
      }
      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await triggerOnboarding()
        router.push(redirectTo)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, redirectTo, searchParams])

  const triggerOnboarding = async () => {
    try {
      const response = await fetch("/api/orchestrator/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error("Onboarding failed:", await response.text())
      }
    } catch (error) {
      console.error("Onboarding error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AgentGift.ai
              </h1>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Global
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Almost there — your 3 gifts are waiting 💝</h2>
            <p className="text-gray-600">
              Sign in to save your personalized gift recommendations and unlock the full Giftverse experience.
            </p>
          </div>

          {/* Demo Preview */}
          <div className="flex justify-center space-x-2 py-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-600" />
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-900">Welcome to the Giftverse</CardTitle>
            <CardDescription>Choose your preferred sign-in method to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#8b5cf6",
                      brandAccent: "#7c3aed",
                      brandButtonText: "white",
                      defaultButtonBackground: "#f8fafc",
                      defaultButtonBackgroundHover: "#f1f5f9",
                      inputBackground: "white",
                      inputBorder: "#e2e8f0",
                      inputBorderHover: "#8b5cf6",
                      inputBorderFocus: "#8b5cf6",
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
                  button: cn(
                    "transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
                    "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
                  ),
                  input: "transition-all duration-200 focus:ring-2 focus:ring-purple-500/20",
                },
              }}
              providers={["google", "apple"]}
              redirectTo={`${window.location.origin}/auth/callback`}
              onlyThirdPartyProviders={false}
              magicLink={true}
              showLinks={false}
              localization={{
                variables: {
                  sign_in: {
                    email_label: "Email address",
                    password_label: "Password",
                    button_label: "Sign in to AgentGift",
                    loading_button_label: "Signing in...",
                    social_provider_text: "Continue with {{provider}}",
                    link_text: "Already have an account? Sign in",
                    email_input_placeholder: "Your email address",
                    password_input_placeholder: "Your password",
                  },
                  sign_up: {
                    email_label: "Email address",
                    password_label: "Create password",
                    button_label: "Join AgentGift",
                    loading_button_label: "Creating account...",
                    social_provider_text: "Continue with {{provider}}",
                    link_text: "Don't have an account? Sign up",
                    email_input_placeholder: "Your email address",
                    password_input_placeholder: "Create a password",
                  },
                  magic_link: {
                    email_input_label: "Email address",
                    email_input_placeholder: "Your email address",
                    button_label: "Send magic link",
                    loading_button_label: "Sending magic link...",
                    link_text: "Send a magic link email",
                    confirmation_text: "Check your email for the login link",
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="text-center space-y-2">
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Sparkles className="w-4 h-4 mr-1" />
              50+ Countries
            </span>
            <span className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              25+ Languages
            </span>
            <span className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              1000+ Holidays
            </span>
          </div>
          <p className="text-xs text-gray-400">Secure authentication powered by Supabase</p>
        </div>
      </div>
    </div>
  )
}
