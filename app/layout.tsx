import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "@/components/layout/client-layout"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgentGift.ai - AI-Powered Gift Recommendations",
  description: "Discover perfect gifts with AI that understands emotions, relationships, and cultural context.",
  keywords: ["AI", "gifts", "recommendations", "cultural intelligence", "emotional AI"],
  authors: [{ name: "AgentGift.ai Team" }],
  openGraph: {
    title: "AgentGift.ai - AI-Powered Gift Recommendations",
    description: "Discover perfect gifts with AI that understands emotions, relationships, and cultural context.",
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
    title: "AgentGift.ai - AI-Powered Gift Recommendations",
    description: "Discover perfect gifts with AI that understands emotions, relationships, and cultural context.",
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
