"use client"

import { useEffect, useState } from "react"

export function HeroGiftAnimation() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative w-full h-96 flex items-center justify-center">
        <div className="text-6xl animate-pulse">🎁</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-96 flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 opacity-50 rounded-3xl" />

      {/* Main gift box animation */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="animate-bounce">
          <div className="text-8xl transform hover:scale-110 transition-transform duration-300 cursor-pointer">🎁</div>
        </div>
      </div>

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-2xl animate-pulse delay-100">✨</div>
        <div className="absolute top-1/3 right-1/4 text-xl animate-pulse delay-300">🌟</div>
        <div className="absolute bottom-1/3 left-1/3 text-lg animate-pulse delay-500">💫</div>
        <div className="absolute bottom-1/4 right-1/3 text-2xl animate-pulse delay-700">⭐</div>
      </div>

      {/* Floating emojis */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/6 left-1/6 text-xl animate-float delay-200">🎉</div>
        <div className="absolute top-1/5 right-1/6 text-lg animate-float delay-400">🎊</div>
        <div className="absolute bottom-1/5 left-1/5 text-xl animate-float delay-600">🎈</div>
        <div className="absolute bottom-1/6 right-1/5 text-lg animate-float delay-800">🎀</div>
      </div>

      {/* Pulsing rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 border-2 border-purple-300 rounded-full animate-ping opacity-20" />
        <div className="absolute w-48 h-48 border-2 border-pink-300 rounded-full animate-ping opacity-10 delay-1000" />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
