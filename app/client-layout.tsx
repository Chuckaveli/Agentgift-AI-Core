"use client"

import { SheetContent } from "@/components/ui/sheet"

import { SheetTrigger } from "@/components/ui/sheet"

import { Sheet } from "@/components/ui/sheet"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import type React from "react"
import { useTheme } from "next-themes"
import {
  Menu,
  Home,
  UserIcon,
  MessageCircle,
  BookOpen,
  Settings,
  Bell,
  Moon,
  Sun,
  Zap,
  Trophy,
  Coins,
  Gift,
  BarChart3,
  Users,
  Shield,
  LogOut,
} from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import { GamificationProvider } from "@/components/layout/gamification-provider"
import { CulturalProvider } from "@/components/cultural/cultural-context"
import { PersonaThemeWrapper } from "@/components/persona/persona-theme-wrapper"
import { MobileFooterNav } from "@/components/navigation/mobile-footer-nav"
import { ToastBadgeNotifier } from "@/components/global/toast-badge-notifier"
import { ConciergeTrigger } from "@/components/concierge-trigger"

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  requiresAuth?: boolean
  adminOnly?: boolean
}

interface ClientLayoutProps {
  children: React.ReactNode
}

const publicNavigation: NavigationItem[] = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "blog", label: "Gift Intel", href: "/blog", icon: BookOpen },
  { id: "pricing", label: "Pricing", href: "/pricing", icon: Zap },
  { id: "mission", label: "Our Mission", href: "/mission", icon: Gift },
]

const userNavigation: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: BarChart3, requiresAuth: true },
  { id: "concierge", label: "AI Concierge", href: "/concierge", icon: MessageCircle, requiresAuth: true, badge: "New" },
  { id: "profile", label: "Profile", href: "/profile", icon: UserIcon, requiresAuth: true },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings, requiresAuth: true },
]

const adminNavigation: NavigationItem[] = [
  { id: "admin", label: "Admin Panel", href: "/admin", icon: Shield, adminOnly: true },
  { id: "users", label: "User Management", href: "/admin/users", icon: Users, adminOnly: true },
]

const AppLayoutInner = ({ children }: ClientLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const user = null // Placeholder for user data
  const isAuthenticated = !!user
  const isAdmin = user?.tier === "premium" // Simplified admin check

  const allNavigation = [
    ...publicNavigation,
    ...(isAuthenticated ? userNavigation : []),
    ...(isAdmin ? adminNavigation : []),
  ].filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false
    if (item.adminOnly && !isAdmin) return false
    return true
  })

  const getXPProgress = () => {
    if (!user) return 0
    const currentLevelXP = user.level * 1000
    const nextLevelXP = (user.level + 1) * 1000
    return ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <Image src="/agentgift-logo.png" alt="AgentGift Logo" width={32} height={32} />
          <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AgentGift.ai
          </span>
        </div>
      </div>

      {/* Gamification Bar */}
      {user && (
        <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Level {user.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{user.credits}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>XP Progress</span>
                <span>{user.xp} XP</span>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-accent-foreground w-full" style={{ width: `${getXPProgress()}%` }} />
              </div>
            </div>
            {user.badges.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {user.badges.slice(0, 3).map((badge, index) => (
                  <div key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                    {badge}
                  </div>
                ))}
                {user.badges.length > 3 && (
                  <div className="bg-outline text-outline-foreground px-2 py-1 rounded text-xs">
                    +{user.badges.length - 3} more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 py-4">
        <ul className="space-y-1">
          {allNavigation.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-md hover:bg-accent hover:text-accent-foreground ${
                  pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs ml-auto">
                    {item.badge}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Mobile Menu + Logo */}
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Logo (visible on mobile when no sidebar) */}
            {!isAuthenticated && (
              <a href="/" className="flex items-center gap-2">
                <Image src="/agentgift-logo.png" alt="AgentGift Logo" width={32} height={32} />
                <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
                  AgentGift.ai
                </span>
              </a>
            )}
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-secondary text-secondary-foreground rounded-full">
                  3
                </div>
              </button>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <div
                    className="h-10 w-10 bg-cover bg-center rounded-full"
                    style={{ backgroundImage: `url(${user.avatar || "/placeholder.svg"})` }}
                  >
                    {user.avatar ? "" : user.name.charAt(0)}
                  </div>
                </button>
                <div className="absolute right-0 top-full w-56 bg-background border rounded mt-2">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="border-t" />
                  <button className="flex items-center justify-start gap-2 p-2 w-full hover:bg-accent hover:text-accent-foreground">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </button>
                  <button className="flex items-center justify-start gap-2 p-2 w-full hover:bg-accent hover:text-accent-foreground">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </button>
                  <div className="border-t" />
                  <button className="flex items-center justify-start gap-2 p-2 w-full hover:bg-accent hover:text-accent-foreground">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button variant="ghost" size="sm">
                  Sign In
                </button>
                <button variant="default" size="sm">
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <CulturalProvider>
        <GamificationProvider>
          <PersonaThemeWrapper>
            <div className="min-h-screen bg-background">
              <AppLayoutInner>{children}</AppLayoutInner>
              <MobileFooterNav />
              <ConciergeTrigger />
              <ToastBadgeNotifier />
            </div>
          </PersonaThemeWrapper>
        </GamificationProvider>
      </CulturalProvider>
    </ThemeProvider>
  )
}

// Default export for Next.js
export default ClientLayout
