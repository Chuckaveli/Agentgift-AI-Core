"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Mail, ArrowLeft, Sparkles, Gift, Heart } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { useUser } from "@/hooks/use-user"

const wittyErrorMessages = [
  "Looks like our elves are tired. Try again in a sec.",
  "Our gift-wrapping robots need a coffee break. One moment!",
  "The magic link factory is running a bit slow today.",
  "Even AI needs a breather sometimes. Please try again!",
  "Our digital gift box got a little tangled. Give us another shot!",
]

const getRandomErrorMessage = () => {
  return wittyErrorMessages[Math.floor(Math.random() * wittyErrorMessages.length)]
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailError, setEmailError] = useState("")
  const router = useRouter()
  const { user, loading } = useUser()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  // Don't render if still loading or user is authenticated
  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setEmailError("Please enter your email address")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setEmailError("")

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        if (error.message.includes("rate limit")) {
          toast.error("Whoa there, speedy! Our elves can only work so fast. Try again in a minute.")
        } else {
          toast.error(getRandomErrorMessage())
        }
        setIsLoading(false)
        return
      }

      setIsSubmitted(true)
      toast.success("Check your inbox! 📧", {
        description: "We've sent you a magic link to sign in.",
      })
    } catch (error) {
      console.error("Login error:", error)
      toast.error(getRandomErrorMessage())
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
            <span className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">
              Back to AgentGift.ai
            </span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Image src="/agentgift-new-logo.png" alt="AgentGift.ai" width={24} height={24} className="rounded" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AgentGift.ai
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Decorative Elements */}
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-2 mb-6">
              <div className="animate-bounce delay-0">
                <Gift className="h-6 w-6 text-purple-500" />
              </div>
              <div className="animate-bounce delay-100">
                <Sparkles className="h-6 w-6 text-pink-500" />
              </div>
              <div className="animate-bounce delay-200">
                <Heart className="h-6 w-6 text-orange-500" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-gray-600">A smarter way to show you care – welcome back.</p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-xl font-semibold text-gray-900">Sign in to your account</CardTitle>
              <CardDescription className="text-gray-600">
                We don't do passwords. Just effortless gifting.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setEmailError("")
                        }}
                        className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        disabled={isLoading}
                      />
                    </div>
                    {emailError && <p className="text-sm text-red-600">{emailError}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending magic link...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">Send me the magic link 🔑</div>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Check your inbox! 📧</h3>
                    <p className="text-gray-600 text-sm">
                      We've sent a magic link to <strong>{email}</strong>
                    </p>
                    <p className="text-gray-500 text-xs">
                      Click the link in your email to sign in. It may take a minute to arrive.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false)
                      setEmail("")
                    }}
                    className="w-full"
                  >
                    Use a different email
                  </Button>
                </div>
              )}

              {/* Additional Info */}
              <div className="text-center space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Secure & Simple</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  No passwords to remember. No forms to fill out. Just click and you're in.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              New to AgentGift.ai?{" "}
              <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
                Learn more about our platform
              </Link>
            </p>
            <div className="flex justify-center space-x-4 text-xs text-gray-500">
              <Link href="/terms" className="hover:text-purple-600">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-purple-600">
                Support
              </Link>
              <Link href="/mission" className="hover:text-purple-600">
                Mission
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  )
}
