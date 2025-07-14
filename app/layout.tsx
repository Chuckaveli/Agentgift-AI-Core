import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { PersonaProvider } from "@/components/persona/persona-context"
import { CulturalProvider } from "@/components/cultural/cultural-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgentGift.ai - Culturally Intelligent Gift Recommendations",
  description:
    "The world's most culturally aware AI gift platform. Perfect gifts across cultures, languages, and traditions.",
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CulturalProvider>
            <PersonaProvider>
              {children}
              <Toaster />
            </PersonaProvider>
          </CulturalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
