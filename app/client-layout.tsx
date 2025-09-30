"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { initPerformanceMonitoring } from "@/lib/performance"
import { useEffect } from "react"

function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      initPerformanceMonitoring()
    }
  }, [])

  return null
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <PerformanceMonitor />
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
