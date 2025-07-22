"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface LottieAnimationProps {
  src: string
  className?: string
  autoplay?: boolean
  loop?: boolean
  speed?: number
}

export function LottieAnimation({ src, className, autoplay = true, loop = true, speed = 1 }: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<any>(null)

  useEffect(() => {
    let lottie: any = null

    const loadLottie = async () => {
      try {
        // Dynamically import lottie-web to avoid SSR issues
        const lottieModule = await import("lottie-web")
        lottie = lottieModule.default

        if (containerRef.current && lottie) {
          // Clear any existing animation
          if (animationRef.current) {
            animationRef.current.destroy()
          }

          // Load the animation
          animationRef.current = lottie.loadAnimation({
            container: containerRef.current,
            renderer: "svg",
            loop,
            autoplay,
            path: src,
          })

          // Set speed if provided
          if (speed !== 1) {
            animationRef.current.setSpeed(speed)
          }
        }
      } catch (error) {
        console.error("Failed to load Lottie animation:", error)
      }
    }

    loadLottie()

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy()
        animationRef.current = null
      }
    }
  }, [src, autoplay, loop, speed])

  return (
    <div ref={containerRef} className={cn("lottie-animation", className)} style={{ width: "100%", height: "100%" }} />
  )
}
