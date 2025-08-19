"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import {
  Menu,
  Home,
  Search,
  Users,
  Settings,
  HelpCircle,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  MessageCircle,
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Navbar } from "@/components/Navbar"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === "SIGNED_IN") {
        router.refresh()
      }
      setLoading(false)
    })

    // Track page views
    if (typeof window !== "undefined") {
      console.log("Page view:", window.location.pathname)
    }

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Smart Search", href: "/smart-search", icon: Search },
    { name: "Community", href: "/social", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help", href: "/contact", icon: HelpCircle },
  ]

  const isAuthPage = pathname?.startsWith("/auth") || pathname === "/login"

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-background">
        <Navbar />
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            {!isAuthPage && (
              <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                      <div className="relative">
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentgift-logo-120x120-LNt9JS0WFm3LMER4UKFOXazjdOmyHS.png"
                          alt="AgentGift.ai Logo"
                          width={32}
                          height={32}
                          className="rounded-lg"
                        />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        AgentGift.ai
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Beta
                      </Badge>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                      {user &&
                        navigation.map((item) => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                pathname === item.href
                                  ? "bg-purple-100 text-purple-700"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </Link>
                          )
                        })}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-4">
                      {user ? (
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">Welcome, {user.email?.split("@")[0]}</span>
                          <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
                            Sign Out
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Link href="/auth/signin">
                            <Button variant="ghost" size="sm">
                              Sign In
                            </Button>
                          </Link>
                          <Link href="/auth/signup">
                            <Button size="sm">Sign Up</Button>
                          </Link>
                        </div>
                      )}

                      {/* Mobile Menu */}
                      {user && (
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" className="md:hidden">
                              <Menu className="w-5 h-5" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="right" className="w-64">
                            <div className="flex flex-col space-y-4 mt-8">
                              {navigation.map((item) => {
                                const Icon = item.icon
                                return (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                      pathname === item.href
                                        ? "bg-purple-100 text-purple-700"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    }`}
                                  >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                  </Link>
                                )
                              })}
                            </div>
                          </SheetContent>
                        </Sheet>
                      )}
                    </div>
                  </div>
                </div>
              </header>
            )}

            {/* Main Content */}
            <main className={isAuthPage ? "" : "flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>{children}</main>

            {/* Footer */}
            {!isAuthPage && (
              <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="relative">
                          <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentgift-logo-120x120-LNt9JS0WFm3LMER4UKFOXazjdOmyHS.png"
                            alt="AgentGift.ai Logo"
                            width={32}
                            height={32}
                            className="rounded-lg"
                          />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          AgentGift.ai
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 max-w-md">
                        AI-powered gift recommendations that understand emotions, relationships, and cultural context.
                        Find the perfect gift every time.
                      </p>
                      <div className="flex space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="https://twitter.com/agentgift" target="_blank" rel="noopener noreferrer">
                            <Twitter className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="https://instagram.com/agentgift" target="_blank" rel="noopener noreferrer">
                            <Instagram className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="https://linkedin.com/company/agentgift" target="_blank" rel="noopener noreferrer">
                            <Linkedin className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="https://github.com/agentgift" target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="https://discord.gg/FVDQPDvkEH" target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Product</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link href="/smart-search" className="text-sm text-gray-600 hover:text-gray-900">
                            Smart Search
                          </Link>
                        </li>
                        <li>
                          <Link href="/concierge" className="text-sm text-gray-600 hover:text-gray-900">
                            AI Concierge
                          </Link>
                        </li>
                        <li>
                          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
                            Pricing
                          </Link>
                        </li>
                        <li>
                          <Link href="/features" className="text-sm text-gray-600 hover:text-gray-900">
                            Features
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Support */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                            Contact Us
                          </Link>
                        </li>
                        <li>
                          <Link href="/legal/terms" className="text-sm text-gray-600 hover:text-gray-900">
                            Terms of Service
                          </Link>
                        </li>
                        <li>
                          <Link href="/legal/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                            Privacy Policy
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="https://discord.gg/FVDQPDvkEH"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-600 hover:text-gray-900"
                          >
                            Discord Community
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 mt-8 pt-8">
                    <p className="text-sm text-gray-500 text-center">© 2024 AgentGift.ai. All rights reserved.</p>
                  </div>
                </div>
              </footer>
            )}
          </div>
        )}
      </div>
      <Toaster />
    </ThemeProvider>
  )
}

