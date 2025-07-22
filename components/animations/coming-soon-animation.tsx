"use client"

import { useEffect, useState } from "react"
import LottieAnimation from "./lottie-animation"

interface ComingSoonAnimationProps {
  className?: string
  featureName?: string
  showUpgradeText?: boolean
}

export default function ComingSoonAnimation({
  className,
  featureName = "This Feature",
  showUpgradeText = true,
}: ComingSoonAnimationProps) {
  const [animationSrc, setAnimationSrc] = useState<string>("")

  useEffect(() => {
    // Set the animation source - using the new lottie folder structure
    setAnimationSrc("/lottie/locked.json")
  }, [])

  if (!animationSrc) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-black/80 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-white mb-2">COMING SOON</h3>
          {showUpgradeText && <p className="text-gray-300 text-sm">{featureName} will be available soon</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <LottieAnimation src={animationSrc} className="w-full h-full" autoplay={true} loop={true} speed={1} />

      {/* Overlay text for specific feature */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center bg-black/60 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-1">{featureName}</h3>
          {showUpgradeText && <p className="text-gray-300 text-xs">Upgrade to Pro to unlock this feature</p>}
        </div>
      </div>
    </div>
  )
}
