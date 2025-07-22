import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import ClientLayout from "./ClientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgentGift.ai - AI-Powered Gift Intelligence Platform",
  description:
    "Transform your gifting experience with AI-powered recommendations, cultural intelligence, and personalized insights. Perfect gifts for every occasion, culture, and relationship.",
  keywords: [
    "AI gifts",
    "gift recommendations",
    "cultural gifting",
    "personalized gifts",
    "gift intelligence",
    "smart gifting",
    "gift AI",
    "perfect gifts",
  ],
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
    title: "AgentGift.ai - AI-Powered Gift Intelligence Platform",
    description:
      "Transform your gifting experience with AI-powered recommendations, cultural intelligence, and personalized insights.",
    url: "https://agentgift.ai",
    siteName: "AgentGift.ai",
    images: [
      {
        url: "/agentgift-new-logo.png",
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
    title: "AgentGift.ai - AI-Powered Gift Intelligence Platform",
    description:
      "Transform your gifting experience with AI-powered recommendations, cultural intelligence, and personalized insights.",
    images: ["/agentgift-new-logo.png"],
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
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
