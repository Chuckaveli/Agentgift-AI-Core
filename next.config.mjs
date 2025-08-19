import { withPlaiceholder } from "@plaiceholder/next";

/** @type {import('next').NextConfig} */
const nextConfig = withPlaiceholder({
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['blob.v0.dev'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbxt.replicate.delivery",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "agentgift.blob.core.windows.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.openai.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "vercel.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "v0.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "blob.v0.dev",
        port: "",
        pathname: "/**",
      },
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
  publicRuntimeConfig: {
    NEXT_PUBLIC_BFF_URL: process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:3000",
  },
});

export default nextConfig;
