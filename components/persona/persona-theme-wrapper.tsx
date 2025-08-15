"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import type React from "react"

import { useEffect, useState } from "react"
import { usePersona } from "./persona-context"
import { cn } from "@/lib/utils"

interface PersonaThemeWrapperProps {
  children: React.ReactNode
  className?: string
  applyBackground?: boolean
  applyGradient?: boolean
}

export function PersonaThemeWrapper({
  children,
  className,
  applyBackground = false,
  applyGradient = false,
}: PersonaThemeWrapperProps) {
  const { currentPersona } = usePersona()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !currentPersona) {
    return <div className={className}>{children}</div>
  }

  const themeClasses = cn(
    className,
    applyBackground && `bg-gradient-to-br ${currentPersona.theme.background}`,
    applyGradient && `bg-gradient-to-r ${currentPersona.theme.gradient}`,
    currentPersona.theme.text,
  )

  return (
    <div
      className={themeClasses}
      style={
        {
          "--persona-primary": currentPersona.theme.primary,
          "--persona-secondary": currentPersona.theme.secondary,
          "--persona-accent": currentPersona.theme.accent,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}

