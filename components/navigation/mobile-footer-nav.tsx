"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Home, Grid3X3, MessageCircle, User, Bell, Shield } from "lucide-react"
import { useIsAdmin } from "@/hooks/useIsAdmin"

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export function MobileFooterNav() {
  const pathname = usePathname()
  const { isAdmin } = useIsAdmin()
  const [activeItem, setActiveItem] = useState<string>("")

  const items: NavItem[] = useMemo(() => {
    const base: NavItem[] = [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
      { id: "features", label: "Features", href: "/features", icon: Grid3X3 },
      { id: "concierge", label: "Concierge", href: "/concierge", icon: MessageCircle, badge: 2 },
      { id: "account", label: "Account", href: "/account", icon: User },
      { id: "notifications", label: "Alerts", href: "/notifications", icon: Bell, badge: 5 },
    ]
    if (isAdmin) base.push({ id: "admin", label: "Admin", href: "/admin", icon: Shield })
    return base
  }, [isAdmin])

  useEffect(() => {
    const currentItem = items.find((item) => pathname.startsWith(item.href))
    setActiveItem(currentItem?.id || "")
  }, [pathname, items])

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive
                  ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveItem(item.id)}
            >
              {/* Glow effect for active item */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg animate-pulse" />
              )}

              <div className="relative flex flex-col items-center">
                <div className="relative">
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? "scale-110" : ""} transition-transform`} />

                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs bg-red-500 text-white border-0">
                      {item.badge > 9 ? "9+" : item.badge}
                    </Badge>
                  )}
                </div>

                <span
                  className={`text-xs font-medium truncate max-w-full ${
                    isActive ? "text-purple-600 dark:text-purple-400" : ""
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
