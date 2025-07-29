"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import {
  Menu,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  Globe,
  ChevronDown,
  Gift,
  Sparkles,
  Users,
  Heart,
  Star,
  Zap,
  LogOut,
  User,
  Settings,
} from "lucide-react"
import { CulturalContextProvider } from "@/components/cultural/cultural-context"
import { useUser } from "@/hooks/use-user"
import { PersonaProvider } from "@/components/persona/persona-context"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const { theme, setTheme } = useTheme()
  const { user, loading, isAuthenticated, signOut } = useUser()

  useEffect(() => {
    setMounted(true)
  }, [])

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "th", name: "ไทย", flag: "🇹🇭" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  ]

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", icon: Sparkles },
    { href: "/features", label: "Features", icon: Star },
    { href: "/pricing", label: "Pricing", icon: Zap },
    { href: "/about", label: "About", icon: Heart },
    { href: "/contact", label: "Contact", icon: Users },
  ]

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    // Here you would typically integrate with your i18n solution
    console.log(`Language changed to: ${language}`)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-16 bg-muted" />
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-muted rounded mb-4" />
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <CulturalContextProvider>
      <PersonaProvider>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      src="/agentgift-new-logo.png"
                      alt="AgentGift.ai"
                      width={40}
                      height={40}
                      className="rounded-lg"
                      priority
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      AgentGift.ai
                    </span>
                    <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                      <Globe className="w-2 h-2 mr-1" />
                      Global
                    </Badge>
                  </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-3">
                  {/* Language Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="hidden sm:flex">
                        <Globe className="w-4 h-4 mr-2" />
                        <span className="hidden lg:inline">{selectedLanguage}</span>
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Select Language</div>
                      <DropdownMenuSeparator />
                      {languages.map((lang) => (
                        <DropdownMenuItem
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.name)}
                          className="flex items-center space-x-2"
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Theme Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    className="hidden sm:flex"
                  >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>

                  {/* Auth Buttons */}
                  <div className="hidden sm:flex items-center space-x-2">
                    {!loading && (
                      <>
                        {isAuthenticated ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>{user?.email?.split('@')[0] || 'User'}</span>
                                <ChevronDown className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link href="/dashboard" className="flex items-center">
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Dashboard
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/settings" className="flex items-center">
                                  <Settings className="w-4 h-4 mr-2" />
                                  Settings
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => signOut()}
                                className="flex items-center text-red-600"
                              >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href="/sign-in">
                                <LogIn className="w-4 h-4 mr-2" />
                                Sign In
                              </Link>
                            </Button>
                            <Button size="sm" asChild>
                              <Link href="/login">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Get Started
                              </Link>
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* Mobile Menu */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80">
                      <div className="flex flex-col space-y-6 mt-6">
                        {/* Mobile Logo */}
                        <div className="flex items-center space-x-3">
                          <Image
                            src="/agentgift-new-logo.png"
                            alt="AgentGift.ai"
                            width={32}
                            height={32}
                            className="rounded-lg"
                          />
                          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            AgentGift.ai
                          </span>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="flex flex-col space-y-3">
                          {navigationItems.map((item) => {
                            const Icon = item.icon
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center space-x-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
                              >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                              </Link>
                            )
                          })}
                        </nav>

                        {/* Mobile Actions */}
                        <div className="space-y-3 pt-6 border-t">
                          {/* Language Selector */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full justify-between bg-transparent">
                                <div className="flex items-center">
                                  <Globe className="w-4 h-4 mr-2" />
                                  {selectedLanguage}
                                </div>
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                              {languages.map((lang) => (
                                <DropdownMenuItem
                                  key={lang.code}
                                  onClick={() => handleLanguageChange(lang.name)}
                                  className="flex items-center space-x-2"
                                >
                                  <span className="text-lg">{lang.flag}</span>
                                  <span>{lang.name}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Theme Toggle */}
                          <Button
                            variant="outline"
                            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                            className="w-full justify-start"
                          >
                            <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-4 w-4 ml-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="ml-6">Toggle theme</span>
                          </Button>

                          {/* Auth Buttons */}
                          <div className="space-y-2">
                            {!loading && (
                              <>
                                {isAuthenticated ? (
                                  <>
                                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                                      <Link href="/dashboard">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Dashboard
                                      </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                                      <Link href="/settings">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                      </Link>
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      className="w-full justify-start text-red-600"
                                      onClick={() => signOut()}
                                    >
                                      <LogOut className="w-4 h-4 mr-2" />
                                      Sign Out
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                                      <Link href="/sign-in">
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Sign In
                                      </Link>
                                    </Button>
                                    <Button className="w-full justify-start" asChild>
                                      <Link href="/login">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Get Started
                                      </Link>
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Company Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Image
                      src="/agentgift-new-logo.png"
                      alt="AgentGift.ai"
                      width={32}
                      height={32}
                      className="rounded-lg"
                    />
                    <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      AgentGift.ai
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Transform your gifting experience with AI-powered recommendations and cultural intelligence.
                  </p>
                </div>

                {/* Product */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Product</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link href="/features" className="hover:text-foreground transition-colors">
                        Features
                      </Link>
                    </li>
                    <li>
                      <Link href="/pricing" className="hover:text-foreground transition-colors">
                        Pricing
                      </Link>
                    </li>
                    <li>
                      <Link href="/api" className="hover:text-foreground transition-colors">
                        API
                      </Link>
                    </li>
                    <li>
                      <Link href="/integrations" className="hover:text-foreground transition-colors">
                        Integrations
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Company */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Company</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link href="/about" className="hover:text-foreground transition-colors">
                        About
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog" className="hover:text-foreground transition-colors">
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link href="/careers" className="hover:text-foreground transition-colors">
                        Careers
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="hover:text-foreground transition-colors">
                        Contact
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Legal */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Legal</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link href="/privacy" className="hover:text-foreground transition-colors">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="hover:text-foreground transition-colors">
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link href="/cookies" className="hover:text-foreground transition-colors">
                        Cookie Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/gdpr" className="hover:text-foreground transition-colors">
                        GDPR
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
                <p className="text-sm text-muted-foreground">© 2024 AgentGift.ai. All rights reserved.</p>
                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                  <Badge variant="secondary" className="text-xs">
                    <Gift className="w-3 h-3 mr-1" />
                    Made with ❤️ for gift-givers worldwide
                  </Badge>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </PersonaProvider>
    </CulturalContextProvider>
  )
}
