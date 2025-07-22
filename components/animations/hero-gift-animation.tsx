"use client"
import { LottieAnimation } from "./lottie-animation"

export function HeroGiftAnimation() {
  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96">
      <LottieAnimation src="/agentgift_intro.json" className="w-full h-full" autoplay loop />
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
    </div>
  )
}
