"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DemoPayload {
  recipient: string
  emotions: string[]
  interests: string[]
  outputs: Array<{
    type: "meaningful" | "unconventional" | "otb"
    text: string
    rationale: string
  }>
  source?: string
}

interface DemoFinishButtonProps {
  demoPayload: DemoPayload
  className?: string
  children?: React.ReactNode
}

export function DemoFinishButton({ demoPayload, className, children }: DemoFinishButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFinishDemo = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/orchestrator/finish-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...demoPayload,
          source: demoPayload.source || "landing-demo",
        }),
      })

      const result = await response.json()

      if (result.ok) {
        // Redirect to auth with dashboard redirect
        router.push(result.next)
      } else {
        console.error("Demo finish failed:", result.error)
        // Handle error - could show toast notification
        alert("Something went wrong. Please try again.")
      }
    } catch (error) {
      console.error("Demo finish error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFinishDemo}
      disabled={isLoading}
      className={cn(
        "relative overflow-hidden group",
        "bg-gradient-to-r from-purple-600 to-pink-600",
        "hover:from-purple-700 hover:to-pink-700",
        "transform transition-all duration-200",
        "hover:scale-105 hover:shadow-xl",
        "text-white font-semibold",
        className,
      )}
      size="lg"
    >
      {/* Sparkle effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Button content */}
      <div className="relative flex items-center space-x-2">
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Saving Your Gifts...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            <span>{children || "Save My 3 Gifts & Continue"}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </>
        )}
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10" />
    </Button>
  )
}

