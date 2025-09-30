import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
<<<<<<< HEAD

=======
  
>>>>>>> 62841888717e65a520dd629dcd2165ef9c1d2b44
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blob.v0.app',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    unoptimized: true,
  },

  // Webpack optimization
  webpack: (config, { isServer, dev }) => {
<<<<<<< HEAD
    // Bundle analyzer (only in production client builds)
    if (!dev && !isServer && process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
=======
    // Only add bundle analyzer in production client builds when ANALYZE=true
    if (!dev && !isServer && process.env.ANALYZE === 'true') {
      // Dynamic import for bundle analyzer
      import('webpack-bundle-analyzer').then(({ BundleAnalyzerPlugin }) => {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            openAnalyzer: true,
          })
        )
      }).catch(() => {
        // Silently fail if bundle analyzer is not installed
      })
>>>>>>> 62841888717e65a520dd629dcd2165ef9c1d2b44
    }

    // Optimize TensorFlow.js
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tensorflow/tfjs$': '@tensorflow/tfjs/dist/tf.min.js',
    };

    // Tree shaking
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };

    return config;
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'lottie-react',
    ],
  },

  // Compiler options
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // ESLint and TypeScript configurations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
