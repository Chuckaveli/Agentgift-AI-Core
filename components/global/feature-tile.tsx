"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lock, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { TierEnforcement, type UserTier } from "@/lib/global-logic"

interface FeatureTileProps {
  title: string
  description: string
  icon: ReactNode
  href: string
  userTier: UserTier
  requiredTier: UserTier
  gradient: string
  isNew?: boolean
  isBeta?: boolean
  className?: string
}

export function FeatureTile({
  title,
  description,
  icon,
  href,
  userTier,
  requiredTier,
  gradient,
  isNew = false,
  isBeta = false,
  className,
}: FeatureTileProps) {
  const hasAccess = TierEnforcement.hasAccess(userTier, requiredTier)

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 group cursor-pointer",
        hasAccess ? "hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10" : "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      {/* Locked Overlay */}
      {!hasAccess && (
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center text-white">
            <Lock className="w-6 h-6 mx-auto mb-2" />
            <div className="text-xs font-medium">{requiredTier.replace("_", " ")} Required</div>
          </div>
        </div>
      )}

      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
      />

      {/* Badges */}
      <div className="absolute top-3 right-3 flex gap-1">
        {isNew && (
          <Badge className="bg-green-500 text-white text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            New
          </Badge>
        )}
        {isBeta && <Badge className="bg-blue-500 text-white text-xs">Beta</Badge>}
      </div>

      <CardContent className="p-6 relative">
        <div className="space-y-4">
          <div
            className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
          >
            {icon}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-tight text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
          </div>

          {hasAccess ? (
            <Button asChild variant="ghost" className="w-full justify-between p-0 h-auto">
              <Link href={href}>
                <span className="text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors">
                  Try Now
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
              <Link href={TierEnforcement.getUpgradeUrl(requiredTier)}>
                <Lock className="w-3 h-3 mr-2" />
                Upgrade
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

