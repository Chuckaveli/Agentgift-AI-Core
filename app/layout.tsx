<<<<<<< HEAD
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
=======
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"
>>>>>>> beac17554917101f076a52ff5b6ef9392d302d8c

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://agentgift.ai"
  ),
  title: "AgentGift.ai - AI-Powered Gift Intelligence Platform",
  description:
<<<<<<< HEAD
    "Discover the perfect gifts with AI-powered recommendations, cultural intelligence, and personalized gift experiences.",
  keywords: [
    "AI gifts",
    "gift recommendations",
    "personalized gifts",
    "gift intelligence",
  ],
  authors: [{ name: "AgentGift.ai Team", url: "https://agentgift.ai" }],
  openGraph: {
    title: "AgentGift.ai - AI-Powered Gift Intelligence",
    description:
      "Discover the perfect gifts with AI-powered recommendations, cultural intelligence, and personalized gift experiences.",
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
=======
    "Transform gift-giving with AI-powered insights, emotional intelligence, and personalized recommendations",
  keywords: ["gifts", "AI", "personalization", "emotional intelligence", "gift recommendations"],
  authors: [{ name: "AgentGift.ai Team" }],
  openGraph: {
    title: "AgentGift.ai - AI-Powered Gift Intelligence",
    description: "Transform gift-giving with AI-powered insights",
>>>>>>> beac17554917101f076a52ff5b6ef9392d302d8c
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
<<<<<<< HEAD
    title: "AgentGift.ai - AI-Powered Gift Intelligence",
    description:
      "Discover the perfect gifts with AI-powered recommendations, cultural intelligence, and personalized gift experiences.",
    images: ["/agentgift-logo.png"],
    creator: "@AgentGiftAI",
=======
    title: "AgentGift.ai",
    description: "AI-Powered Gift Intelligence Platform",
>>>>>>> beac17554917101f076a52ff5b6ef9392d302d8c
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: "v0.app",
  alternates: {
    canonical: "https://agentgift.ai",
    languages: {
      "en-US": "https://agentgift.ai",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
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
<<<<<<< HEAD
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
=======
        <ClientLayout>{children}</ClientLayout>
>>>>>>> beac17554917101f076a52ff5b6ef9392d302d8c
      </body>
    </html>
  );
}
