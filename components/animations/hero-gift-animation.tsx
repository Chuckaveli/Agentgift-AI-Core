"use client"

import { useEffect, useState } from "react"
import LottieAnimation from "./lottie-animation"

interface HeroGiftAnimationProps {
  className?: string
}

export default function HeroGiftAnimation({ className }: HeroGiftAnimationProps) {
  const [animationSrc, setAnimationSrc] = useState<string>("")

  useEffect(() => {
    // Set the animation source - using the new lottie folder structure
    setAnimationSrc("/lottie/intro.json")
  }, [])

  if (!animationSrc) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-8xl animate-bounce mb-4">🎁</div>
          <p className="text-lg font-semibold text-muted-foreground">Perfect Gifts Await</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <LottieAnimation src={animationSrc} className="w-full h-full" autoplay={true} loop={true} speed={1} />
    </div>
  )
}
