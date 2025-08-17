"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Gift, Sparkles, Heart, Star } from "lucide-react"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [view, setView] = useState<"signin" | "signup">("signup")

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Track auth page view
    const trackAuthView = async () => {
      try {
        const completedQuestionnaire = searchParams.get("completed_questionnaire") === "true"
        const redirectTo = searchParams.get("redirect") || "/dashboard"

        // Simple analytics tracking without external dependencies
        console.log("Auth page view:", {
          view,
          completed_questionnaire: completedQuestionnaire,
          redirect_to: redirectTo,
          recipient_name: searchParams.get("recipient_name"),
          relationship: searchParams.get("relationship"),
          occasion: searchParams.get("occasion"),
        })
      } catch (error) {
        console.log("Analytics tracking failed:", error)
      }
    }

    trackAuthView()

    // Check URL params for view
    const viewParam = searchParams.get("view")
    if (viewParam === "signin" || viewParam === "signup") {
      setView(viewParam)
    }

    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) {
          const redirectTo = searchParams.get("redirect") || "/dashboard"
          router.push(redirectTo)
        }
      } catch (error) {
        console.log("Auth check failed:", error)
      }
    }

    checkAuth()
  }, [searchParams, view, router, supabase])

  const handleAuth = async (type: "signin" | "signup") => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      if (type === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${searchParams.get("redirect") || "/dashboard"}`,
          },
        })

        if (error) throw error

        if (data.user && !data.user.email_confirmed_at) {
          setMessage("Check your email for the confirmation link!")
        } else if (data.user) {
          // Track successful signup
          console.log("Signup completed:", { user_id: data.user.id, method: "email" })

          // Redirect to dashboard
          const redirectTo = searchParams.get("redirect") || "/dashboard"
          router.push(redirectTo)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          console.log("Signin success:", { user_id: data.user.id, method: "email" })

          // Redirect to dashboard
          const redirectTo = searchParams.get("redirect") || "/dashboard"
          router.push(redirectTo)
        }
      }
    } catch (error: any) {
      setError(error.message)
      console.log("Auth error:", { type, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      console.log("Google auth clicked:", { view })

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${searchParams.get("redirect") || "/dashboard"}`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message)
    }
  }

  const completedQuestionnaire = searchParams.get("completed_questionnaire") === "true"
  const recipientName = searchParams.get("recipient_name")

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
            <h2 className="text-3xl font-bold text-gray-900">
              {view === "signup" ? "Join the Giftverse" : "Welcome back to the Giftverse"}
            </h2>
            <p className="text-gray-600">
              {view === "signup"
                ? "Create your account to unlock personalized gift recommendations"
                : "Sign in to access your personalized gift recommendations"}
            </p>
          </div>

          {completedQuestionnaire && recipientName && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center text-green-700">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Great! We have your gift preferences for {recipientName}</span>
              </div>
            </div>
          )}

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
            <CardTitle className="text-xl text-gray-900">
              {view === "signup" ? "Create Your Account" : "Sign In to Continue"}
            </CardTitle>
            <CardDescription>
              {view === "signup" ? "Choose your preferred sign-up method" : "Choose your preferred sign-in method"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={view} onValueChange={(value) => setView(value as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="signin">Sign In</TabsTrigger>
              </TabsList>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    disabled={loading}
                  />
                </div>

                <Button
                  onClick={() => handleAuth("signup")}
                  className="w-full"
                  disabled={loading || !email || !password}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </TabsContent>

              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                </div>

                <Button
                  onClick={() => handleAuth("signin")}
                  className="w-full"
                  disabled={loading || !email || !password}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </TabsContent>
            </Tabs>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" onClick={handleGoogleAuth} className="w-full bg-transparent" disabled={loading}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {message && (
              <Alert className="mt-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
