"use client"

import React from "react"

import { useEffect } from "react"

// Core Web Vitals tracking
export function reportWebVitals(metric: any) {
  const { name, value, id } = metric

  // Send to analytics
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, {
      event_category: "Web Vitals",
      value: Math.round(name === "CLS" ? value * 1000 : value),
      event_label: id,
      non_interaction: true,
    })
  }

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Performance] ${name}:`, value)
  }

  // Send to custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metric: name,
        value,
        id,
        timestamp: Date.now(),
      }),
    }).catch((err) => console.error("Analytics error:", err))
  }
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Track page load time
    if (typeof window !== "undefined" && window.performance) {
      const perfData = window.performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart

      console.log(`[Performance] Page Load Time: ${pageLoadTime}ms`)

      // Track resource timing
      const resources = window.performance.getEntriesByType("resource")
      const slowResources = resources.filter((r: any) => r.duration > 1000)

      if (slowResources.length > 0) {
        console.warn("[Performance] Slow resources detected:", slowResources)
      }
    }
  }, [])
}

// Lazy load helper
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    fallback?: React.ReactNode
    delay?: number
  },
) {
  const LazyComponent = React.lazy(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        importFunc().then(resolve)
      }, options?.delay || 0)
    })
  })

  return LazyComponent
}

// Image preloader
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// Prefetch route
export function prefetchRoute(href: string) {
  if (typeof window !== "undefined") {
    const link = document.createElement("link")
    link.rel = "prefetch"
    link.href = href
    document.head.appendChild(link)
  }
}

// Bundle size tracker
export function trackBundleSize() {
  if (typeof window !== "undefined" && window.performance) {
    const resources = window.performance.getEntriesByType("resource") as PerformanceResourceTiming[]

    const jsResources = resources.filter((r) => r.name.endsWith(".js"))
    const totalJsSize = jsResources.reduce((acc, r) => acc + (r.transferSize || 0), 0)

    console.log(`[Performance] Total JS Bundle Size: ${(totalJsSize / 1024 / 1024).toFixed(2)}MB`)

    // Warn if bundle is too large
    if (totalJsSize > 2 * 1024 * 1024) {
      console.warn("[Performance] Bundle size exceeds 2MB!")
    }
  }
}

// Memory usage tracker
export function trackMemoryUsage() {
  if (typeof window !== "undefined" && (performance as any).memory) {
    const memory = (performance as any).memory
    console.log(`[Performance] Memory Usage:`, {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
    })
  }
}

// FPS tracker
export function trackFPS(callback: (fps: number) => void) {
  let lastTime = performance.now()
  let frames = 0

  function measureFPS() {
    const currentTime = performance.now()
    frames++

    if (currentTime >= lastTime + 1000) {
      const fps = Math.round((frames * 1000) / (currentTime - lastTime))
      callback(fps)
      frames = 0
      lastTime = currentTime
    }

    requestAnimationFrame(measureFPS)
  }

  requestAnimationFrame(measureFPS)
}

// Long task detector
export function detectLongTasks() {
  if (typeof window !== "undefined" && "PerformanceObserver" in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn(`[Performance] Long task detected: ${entry.duration}ms`)
      }
    })

    observer.observe({ entryTypes: ["longtask"] })
  }
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window !== "undefined") {
    // Track bundle size
    trackBundleSize()

    // Track memory usage every 30 seconds
    setInterval(trackMemoryUsage, 30000)

    // Detect long tasks
    detectLongTasks()

    // Track FPS
    trackFPS((fps) => {
      if (fps < 30) {
        console.warn(`[Performance] Low FPS detected: ${fps}`)
      }
    })
  }
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}
