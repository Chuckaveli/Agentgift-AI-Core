"use client"

import { useEffect, useRef, useState } from "react"

interface LottieAnimationProps {
  src?: string
  animationData?: any
  className?: string
  autoplay?: boolean
  loop?: boolean
  speed?: number
}

export default function LottieAnimation({
  src,
  animationData,
  className = "",
  autoplay = true,
  loop = true,
  speed = 1,
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [lottie, setLottie] = useState<any>(null)
  const [animation, setAnimation] = useState<any>(null)

  useEffect(() => {
    // Dynamically import lottie-web to avoid SSR issues
    import("lottie-web").then((lottieModule) => {
      setLottie(lottieModule.default)
    })
  }, [])

  useEffect(() => {
    if (!lottie || !containerRef.current) return

    let animationInstance: any

    const loadAnimation = async () => {
      try {
        let data = animationData

        // If src is provided, fetch the JSON data
        if (src && !animationData) {
          const response = await fetch(src)
          if (!response.ok) {
            throw new Error(`Failed to load animation: ${response.statusText}`)
          }
          data = await response.json()
        }

        if (!data) {
          console.error("No animation data provided")
          return
        }

        // Clear any existing animation
        if (animation) {
          animation.destroy()
        }

        // Create new animation
        animationInstance = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop,
          autoplay,
          animationData: data,
        })

        // Set speed
        animationInstance.setSpeed(speed)

        setAnimation(animationInstance)
      } catch (error) {
        console.error("Error loading Lottie animation:", error)
      }
    }

    loadAnimation()

    return () => {
      if (animationInstance) {
        animationInstance.destroy()
      }
    }
  }, [lottie, src, animationData, autoplay, loop, speed])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animation) {
        animation.destroy()
      }
    }
  }, [animation])

  return <div ref={containerRef} className={className} />
}
