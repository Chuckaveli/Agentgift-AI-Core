import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgentGift.ai - AI-Powered Gift Intelligence Platform",
  description:
    "Transform gift-giving with AI-powered insights, emotional intelligence, and personalized recommendations",
  keywords: ["gifts", "AI", "personalization", "emotional intelligence", "gift recommendations"],
  authors: [{ name: "AgentGift.ai Team" }],
  openGraph: {
    title: "AgentGift.ai - AI-Powered Gift Intelligence",
    description: "Transform gift-giving with AI-powered insights",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentGift.ai",
    description: "AI-Powered Gift Intelligence Platform",
  },
  robots: {
    index: true,
    follow: true,
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://blob.v0.app" />
        <link rel="dns-prefetch" href="https://supabase.co" />
      </head>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
