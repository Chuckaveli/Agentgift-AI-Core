"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Sparkles, Heart, Mail, CheckCircle } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { user, signInWithMagicLink } = useUser()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    router.replace("/auth/signin")
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast.error("Hmm, that doesn't look like an email address 🤔")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signInWithMagicLink(email)

      if (error) {
        if (error.message.includes("rate limit")) {
          toast.error("Looks like our elves are tired. Try again in a sec. 😴")
        } else {
          toast.error("Something went wrong. Our gift wizards are on it! 🧙‍♂️")
        }
      } else {
        setIsSubmitted(true)
        toast.success("Check your inbox! 📬")
      }
    } catch (error) {
      toast.error("Oops! Our magic wands need recalibrating. Try again? ✨")
    } finally {
      setIsLoading(false)
    }
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Gift Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Gift
          className="absolute top-1/4 left-1/4 w-6 h-6 text-purple-300 animate-bounce"
          style={{ animationDelay: "0s" }}
        />
        <Sparkles
          className="absolute top-1/3 right-1/3 w-5 h-5 text-pink-300 animate-bounce"
          style={{ animationDelay: "1s" }}
        />
        <Heart
          className="absolute bottom-1/3 left-1/3 w-4 h-4 text-blue-300 animate-bounce"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Gift className="w-8 h-8 text-white" />
          </div>

          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to AgentGift.ai
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              We don't do passwords. Just effortless gifting.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending magic...</span>
                  </div>
                ) : (
                  <>Send me the magic link 🔑</>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Check your inbox!</h3>
                <p className="text-gray-600 mt-1">
                  We sent a magic link to <span className="font-medium text-purple-600">{email}</span>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail("")
                }}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                Use a different email
              </Button>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-500 italic">"A smarter way to show you care – welcome back."</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

