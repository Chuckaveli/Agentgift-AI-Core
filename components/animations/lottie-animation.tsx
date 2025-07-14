"use client"

import { useEffect, useRef, useState } from "react"

interface LottieAnimationProps {
  animationData?: any
  animationUrl?: string
  className?: string
  width?: number
  height?: number
  loop?: boolean
  autoplay?: boolean
}

export function LottieAnimation({
  animationData,
  animationUrl,
  className = "",
  width = 300,
  height = 300,
  loop = true,
  autoplay = true,
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let animationInstance: any = null

    const loadLottie = async () => {
      try {
        const lottie = await import("lottie-web")

        if (!containerRef.current) return

        let data = animationData

        if (animationUrl && !data) {
          const response = await fetch(animationUrl)
          data = await response.json()
        }

        if (!data) {
          setError(true)
          return
        }

        animationInstance = lottie.default.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop,
          autoplay,
          animationData: data,
        })

        setIsLoaded(true)
      } catch (err) {
        console.error("Failed to load Lottie animation:", err)
        setError(true)
      }
    }

    loadLottie()

    return () => {
      if (animationInstance) {
        animationInstance.destroy()
      }
    }
  }, [animationData, animationUrl, loop, autoplay])

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-4xl animate-bounce">🎁</div>
      </div>
    )
  }

  return <div ref={containerRef} className={className} style={{ width, height }} />
}
