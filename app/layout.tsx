import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { PersonaProvider } from "@/components/persona/persona-context"
import { GamificationProvider } from "@/components/layout/gamification-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgentGift.ai - Smart, Meaningful Gifts Powered by AI",
  description:
    "Make your next gift unforgettable—without overthinking. AI-powered gift intelligence that reads vibes, budgets, and intentions to deliver perfect matches.",
  keywords: "AI gifts, gift recommendations, smart gifting, personalized gifts, gift finder, AI assistant",
  authors: [{ name: "AgentGift.ai Team" }],
  creator: "AgentGift.ai",
  publisher: "AgentGift.ai",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://agentgift.ai"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AgentGift.ai - Smart, Meaningful Gifts Powered by AI",
    description: "From gifting chaos to calm in seconds. AI-powered gift intelligence for meaningful presents.",
    url: "https://agentgift.ai",
    siteName: "AgentGift.ai",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AgentGift.ai - AI-Powered Gift Intelligence",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentGift.ai - Smart, Meaningful Gifts Powered by AI",
    description: "From gifting chaos to calm in seconds. AI-powered gift intelligence for meaningful presents.",
    images: ["/og-image.jpg"],
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
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <PersonaProvider>
            <GamificationProvider>
              {children}
              <Toaster />
            </GamificationProvider>
          </PersonaProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
