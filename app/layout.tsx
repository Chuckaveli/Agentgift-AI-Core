import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { CulturalProvider } from "@/components/cultural/cultural-context"
import ClientLayout from "@/app/ClientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AgentGift.ai - AI-Powered Gift Intelligence",
  description: "AI-powered gift intelligence for meaningful connections and perfect presents.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CulturalProvider>
            <ClientLayout>{children}</ClientLayout>
            <Toaster />
          </CulturalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
