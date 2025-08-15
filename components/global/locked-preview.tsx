"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Eye } from "lucide-react"
import Link from "next/link"
import { TierEnforcement, type UserTier } from "@/lib/global-logic"

interface LockedPreviewProps {
  children: ReactNode
  requiredTier: UserTier
  featureName: string
  previewText: string
  blurLevel?: "sm" | "md" | "lg"
}

export function LockedPreview({
  children,
  requiredTier,
  featureName,
  previewText,
  blurLevel = "md",
}: LockedPreviewProps) {
  const blurClass = {
    sm: "blur-sm",
    md: "blur-md",
    lg: "blur-lg",
  }[blurLevel]

  return (
    <div className="relative">
      <div className={`${blurClass} pointer-events-none select-none`}>{children}</div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
        <Card className="m-4 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{featureName} Preview</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{previewText}</p>
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Link href={TierEnforcement.getUpgradeUrl(requiredTier)}>
                    <Crown className="w-3 h-3 mr-2" />
                    Unlock {requiredTier.replace("_", " ")}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

