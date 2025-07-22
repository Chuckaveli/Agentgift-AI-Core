"use client"

import Link from "next/link"
import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
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
  Star,
  Heart,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import Image from "next/image"
import { CulturalLocaleSelector } from "@/components/cultural/cultural-locale-selector"

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

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  // Mock user data - replace with actual auth
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    // Mock user for demo - replace with actual auth
    setUser({
      id: "1",
      name: "Demo User",
      email: "demo@agentgift.ai",
      avatar: "/placeholder-user.jpg",
      tier: "free",
      level: 5,
      xp: 2450,
      credits: 150,
      badges: ["Early Adopter", "Gift Guru", "Social Butterfly"],
    })
  }, [])

  const isAuthenticated = !!user
  const isAdmin = user?.tier === "premium"

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
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <Image src="/agentgift-new-logo.png" alt="AgentGift Logo" width={40} height={40} className="rounded-lg" />
          </div>
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
              <Progress value={getXPProgress()} className="h-2" />
            </div>
            {user.badges.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {user.badges.slice(0, 3).map((badge: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
                {user.badges.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{user.badges.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {allNavigation.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${
                  pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Mobile Menu + Logo */}
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <Image
                  src="/agentgift-new-logo.png"
                  alt="AgentGift Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
                AgentGift.ai
              </span>
            </Link>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Cultural Locale Selector */}
            <CulturalLocaleSelector />

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
            {isAuthenticated && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        {isAuthenticated && (
          <aside className="hidden md:flex w-80 flex-col fixed inset-y-0 left-0 top-16 border-r bg-background">
            <SidebarContent />
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${isAuthenticated ? "md:ml-80" : ""}`}>{children}</main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/agentgift-new-logo.png"
                  alt="AgentGift Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AgentGift.ai
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered gift intelligence for meaningful connections and perfect presents.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/smart-search" className="hover:text-foreground">
                    Smart Search
                  </Link>
                </li>
                <li>
                  <Link href="/gift-dna" className="hover:text-foreground">
                    Gift DNA
                  </Link>
                </li>
                <li>
                  <Link href="/agent-gifty" className="hover:text-foreground">
                    Agent Gifty
                  </Link>
                </li>
                <li>
                  <Link href="/reveal" className="hover:text-foreground">
                    Gift Reveal
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/mission" className="hover:text-foreground">
                    Our Mission
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground">
                    Gift Intel
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Connect</h3>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AgentGift.ai. All rights reserved. Made with ❤️ for meaningful connections.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
