"use client"

import dynamic from "next/dynamic"
import { LazyLoader } from "@/components/lazy-loader"

// Lazy load admin components
export const LazyFeatureBuilder = dynamic(() => import("@/app/admin/feature-builder/page"), {
  loading: () => (
    <LazyLoader minHeight="600px">
      <div />
    </LazyLoader>
  ),
  ssr: false,
})

export const LazyGiftverseControl = dynamic(() => import("@/app/admin/giftverse-control/page"), {
  loading: () => (
    <LazyLoader minHeight="600px">
      <div />
    </LazyLoader>
  ),
  ssr: false,
})

export const LazyMemoryVault = dynamic(() => import("@/app/admin/memory-vault/page"), {
  loading: () => (
    <LazyLoader minHeight="600px">
      <div />
    </LazyLoader>
  ),
  ssr: false,
})

export const LazyEconomyArchitect = dynamic(() => import("@/app/admin/economy-architect/page"), {
  loading: () => (
    <LazyLoader minHeight="600px">
      <div />
    </LazyLoader>
  ),
  ssr: false,
})

export const LazyVisualAnalytics = dynamic(() => import("@/app/admin/visual-analytics/page"), {
  loading: () => (
    <LazyLoader minHeight="600px">
      <div />
    </LazyLoader>
  ),
  ssr: false,
})
