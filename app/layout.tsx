import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayout from "@/components/layout/client-layout"
import AppToaster from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgentGift.ai - AI-Powered Gift Recommendations",
  description:
    "Discover the perfect gifts with AI-powered recommendations tailored to your loved ones' personalities and preferences.",
  keywords: ["AI", "gifts", "recommendations", "personalized", "shopping"],
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
    title: "AgentGift.ai - AI-Powered Gift Recommendations",
    description:
      "Discover the perfect gifts with AI-powered recommendations tailored to your loved ones' personalities and preferences.",
    url: "/",
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
    description:
      "Discover the perfect gifts with AI-powered recommendations tailored to your loved ones' personalities and preferences.",
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
  generator: "v0.app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ClientLayout>{children}</ClientLayout>
          {/* Global toaster for notifications */}
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
