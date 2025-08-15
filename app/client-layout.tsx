"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Home,
  Gift,
  Users,
  Settings,
  HelpCircle,
  Menu,
  Bell,
  Search,
  Moon,
  Sun,
  User,
  LogOut,
  Crown,
  Sparkles,
  Heart,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Navbar } from "@/components/Navbar"
import { MobileFooterNav } from "@/components/navigation/mobile-footer-nav"
import { GamificationProvider } from "@/components/layout/gamification-provider"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Agent Gifty", href: "/agent-gifty", icon: Sparkles },
  { name: "Smart Search", href: "/smart-search", icon: Search },
  { name: "Gift DNA", href: "/gift-dna", icon: Heart },
  { name: "Group Gifting", href: "/group-gifting", icon: Users },
  { name: "Reveal", href: "/reveal", icon: Gift },
  { name: "Characters", href: "/characters", icon: User },
  { name: "Badges", href: "/badges", icon: Crown },
  { name: "Tokenomics", href: "/tokenomics", icon: Zap },
]

const quickActions = [
  { name: "Find Gift", href: "/smart-search", icon: Search, color: "bg-blue-500" },
  { name: "Ask Gifty", href: "/agent-gifty", icon: Sparkles, color: "bg-purple-500" },
  { name: "Group Gift", href: "/group-gifting", icon: Users, color: "bg-green-500" },
  { name: "Gut Check", href: "/gut-check", icon: Heart, color: "bg-red-500" },
]

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const isActive = (href: string) => pathname === href

  const Header = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <MobileNav />
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/agentgift-new-logo.png" alt="AgentGift.ai" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AgentGift.ai
            </span>
          </Link>
        </div>

        {/* Quick Actions - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href}>
              <Button variant="ghost" size="sm" className="gap-2">
                <action.icon className="h-4 w-4" />
                {action.name}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">john@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/contact">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Support
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )

  const Sidebar = () => (
    <aside className="hidden md:flex w-64 flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] border-r bg-background">
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Upgrade Card */}
      <div className="p-4">
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </CardTitle>
            <CardDescription className="text-purple-100 text-xs">
              Unlock premium features and unlimited access
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button size="sm" variant="secondary" className="w-full">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </aside>
  )

  const MobileNav = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b">
        <Image src="/agentgift-new-logo.png" alt="AgentGift.ai" width={24} height={24} className="rounded" />
        <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AgentGift.ai
        </span>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <Separator className="my-4 mx-3" />

        <div className="px-3">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h4>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <action.icon className="h-4 w-4" />
                {action.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t">
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-medium">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-purple-100 mb-3">Unlock premium features</p>
            <Button size="sm" variant="secondary" className="w-full">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <GamificationProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 md:ml-64 pb-16 md:pb-0">
            <div className="container py-6">{children}</div>
          </main>
        </div>
        {isMobile && <MobileFooterNav />}
      </div>
    </GamificationProvider>
  )
}

export default AppLayout

