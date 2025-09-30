"use client"

import Image from "next/image"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <span className="text-sm text-muted-foreground">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && <Skeleton className="absolute inset-0 z-10" />}
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={className}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError(true)
        }}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
      />
    </div>
  )
}

// Responsive image with multiple sizes
export function ResponsiveImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={className}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  )
}
