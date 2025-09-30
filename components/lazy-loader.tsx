"use client"

import React, { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface LazyLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  minHeight?: string
}

export function LazyLoader({ children, fallback, minHeight = "200px" }: LazyLoaderProps) {
  const defaultFallback = (
    <div style={{ minHeight }} className="w-full">
      <Skeleton className="h-full w-full" />
    </div>
  )

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>
}

// Lazy load wrapper for heavy components
export function withLazyLoad<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode
    minHeight?: string
  },
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyLoader fallback={options?.fallback} minHeight={options?.minHeight}>
        <Component {...props} />
      </LazyLoader>
    )
  }
}

// Intersection Observer lazy loader
export function LazyLoadOnView({
  children,
  threshold = 0.1,
  rootMargin = "50px",
}: {
  children: React.ReactNode
  threshold?: number
  rootMargin?: string
}) {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return <div ref={ref}>{isVisible ? children : <Skeleton className="h-[200px] w-full" />}</div>
}
