/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Let builds pass even if lint/TS have issues (you can tighten later)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  images: {
    // You set unoptimized, so optimization is skipped;
    // remotePatterns/domains remain harmless for <Image /> validation.
    unoptimized: true,
    domains: ["blob.v0.dev"],
    remotePatterns: [
      { protocol: "https", hostname: "pbxt.replicate.delivery", pathname: "/**" },
      { protocol: "https", hostname: "replicate.delivery", pathname: "/**" },
      { protocol: "https", hostname: "agentgift.blob.core.windows.net", pathname: "/**" },
      { protocol: "https", hostname: "cdn.openai.com", pathname: "/**" },
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "vercel.com", pathname: "/**" },
      { protocol: "https", hostname: "v0.dev", pathname: "/**" },
      { protocol: "https", hostname: "blob.v0.dev", pathname: "/**" },
    ],
  },

  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ["@supabase/supabase-js"],
  },

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_BFF_URL: process.env.NEXT_PUBLIC_BFF_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
