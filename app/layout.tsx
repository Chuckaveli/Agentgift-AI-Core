import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgentGift.ai - AI-Powered Gift Discovery Platform",
  description:
    "Discover perfect gifts with AI-powered recommendations, cultural intelligence, and personalized experiences.",
  keywords: ["gifts", "AI", "recommendations", "personalized", "occasions"],
  authors: [{ name: "AgentGift.ai Team" }],
  creator: "AgentGift.ai",
  publisher: "AgentGift.ai",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "AgentGift.ai - AI-Powered Gift Discovery Platform",
    description:
      "Discover perfect gifts with AI-powered recommendations, cultural intelligence, and personalized experiences.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    siteName: "AgentGift.ai",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentGift.ai - AI-Powered Gift Discovery Platform",
    description:
      "Discover perfect gifts with AI-powered recommendations, cultural intelligence, and personalized experiences.",
    creator: "@agentgiftai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.app'
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
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
