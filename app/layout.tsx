import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgentGift.ai - AI-Powered Gift Intelligence Platform",
  description:
    "Discover the perfect gifts with AI-powered recommendations, cultural intelligence, and personalized gift experiences.",
  keywords: ["AI gifts", "gift recommendations", "personalized gifts", "gift intelligence"],
  authors: [{ name: "AgentGift.ai Team" }],
  openGraph: {
    title: "AgentGift.ai - AI-Powered Gift Intelligence",
    description: "Discover the perfect gifts with AI-powered recommendations",
    url: "https://agentgift.ai",
    siteName: "AgentGift.ai",
    images: [
      {
        url: "/agentgift-logo.png",
        width: 1200,
        height: 630,
        alt: "AgentGift.ai Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentGift.ai - AI-Powered Gift Intelligence",
    description: "Discover the perfect gifts with AI-powered recommendations",
    images: ["/agentgift-logo.png"],
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
        </ThemeProvider>
      </body>
    </html>
  )
}
