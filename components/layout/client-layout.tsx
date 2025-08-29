"use client"

import { useEffect } from "react"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Toaster } from "@/components/ui/sonner"
import Link from "next/link"
import { Heart, Mail, MapPin, Twitter, Linkedin, Github } from "lucide-react"

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

interface ClientLayoutProps {
  children: React.ReactNode
}

function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return false
  }

  const placeholders = ["placeholder", "your-", "example", "localhost", "127.0.0.1"]
  if (
    placeholders.some(
      (placeholder) =>
        supabaseUrl.toLowerCase().includes(placeholder) || supabaseAnonKey.toLowerCase().includes(placeholder),
    )
  ) {
    return false
  }

  if (!isValidUrl(supabaseUrl)) {
    return false
  }

  return true
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!isSupabaseConfigured()) {
          console.warn("⚠️ Supabase not configured, running in demo mode")
          setLoading(false)
          return
        }

        const { createClient } = await import("@/lib/supabase-client")
        const supabase = createClient()

        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user || null)

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null)
        })

        setLoading(false)

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Error initializing auth:", error)
        console.warn("⚠️ Running in demo mode due to auth error")
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const hideNavbar = pathname?.startsWith("/auth") || pathname === "/login"
  const hideFooter =
    pathname?.startsWith("/auth") ||
    pathname === "/login" ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="container-responsive py-6 sm:py-8 lg:py-12 flex-1">{children}</main>
      {!hideFooter && (
        <footer className="bg-gray-900 text-white">
          <div className="container-responsive py-8 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Company Info */}
              <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center space-x-2">
                  <Heart className="w-6 h-6 text-pink-500 flex-shrink-0" />
                  <span className="text-lg sm:text-xl font-bold">AgentGift.ai</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  AI-powered gift recommendations that create meaningful connections and lasting memories.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Product */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Product</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/smart-search"
                      className="text-gray-400 hover:text-white transition-colors text-sm block py-1"
                    >
                      Smart Search
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/gift-dna"
                      className="text-gray-400 hover:text-white transition-colors text-sm block py-1"
                    >
                      Gift DNA
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/concierge"
                      className="text-gray-400 hover:text-white transition-colors text-sm block py-1"
                    >
                      AI Concierge
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/group-gifting"
                      className="text-gray-400 hover:text-white transition-colors text-sm block py-1"
                    >
                      Group Gifting
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing"
                      className="text-gray-400 hover:text-white transition-colors text-sm block py-1"
                    >
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/mission"
                      className="text-gray-400 hover:text-white transition-colors text-sm block py-1"
                    >
                      Our Mission
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm block py-1">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-gray-400 hover:text-white transition-colors text-sm block py-1"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <a
                      href="mailto:support@agentgift.ai"
                      className="text-gray-400 hover:text-white transition-colors text-sm block py-1"
                    >
                      Support
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/legal/privacy"
                      className="text-gray-400 hover:text-white transition-colors text-sm block py-1"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/legal/terms"
                      className="text-gray-400 hover:text-white transition-colors text-sm block py-1"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/legal/data-deletion"
                      className="text-gray-400 hover:text-white transition-colors text-sm block py-1"
                    >
                      Data Deletion
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-6 sm:pt-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <p className="text-gray-400 text-sm">© {new Date().getFullYear()} AgentGift.ai. All rights reserved.</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                  <div className="flex items-center text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Global</span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <a href="mailto:hello@agentgift.ai" className="hover:text-white transition-colors">
                      hello@agentgift.ai
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
      <Toaster />
    </div>
  )
}
