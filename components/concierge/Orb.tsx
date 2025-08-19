"use client"

import { useMemo, useState, useEffect } from "react"

type OrbStatus = "active" | "dim" | "locked"

interface OrbProps {
  label: string
  status: OrbStatus
  lottie: string
  tooltip?: string
}

export function Orb({ label, status, lottie, tooltip }: OrbProps) {
  const [animationData, setAnimationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Load the Lottie animation data
    fetch(lottie)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load animation")
        return response.json()
      })
      .then((data) => {
        setAnimationData(data)
        setLoading(false)
      })
      .catch((error) => {
        console.warn(`Failed to load Lottie animation: ${lottie}`, error)
        setError(true)
        setLoading(false)
      })
  }, [lottie])

  const glow = useMemo(() => {
    if (status === "active") return "shadow-[0_0_24px_rgba(168,85,247,0.45)]"
    if (status === "locked") return "opacity-40 grayscale"
    return "opacity-70"
  }, [status])

  // Get emoji based on label
  const getEmoji = (label: string) => {
    switch (label.toLowerCase()) {
      case "love language":
        return "💕"
      case "numerology":
        return "🔢"
      case "emotion tag":
        return "😊"
      case "relationship":
        return "👥"
      case "tier / xp":
        return "⭐"
      default:
        return "✨"
    }
  }

  return (
    <div
      className={`group rounded-xl border border-gray-100 p-3 bg-white hover:shadow-md transition ${glow}`}
      title={tooltip}
    >
      <div className="h-20 grid place-items-center">
        {loading ? (
          <div className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 animate-pulse" />
        ) : error || !animationData ? (
          <div className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 grid place-items-center">
            <span className="text-2xl">{getEmoji(label)}</span>
          </div>
        ) : (
          <div className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 grid place-items-center">
            <span className="text-2xl">{getEmoji(label)}</span>
          </div>
        )}
      </div>
      <div className="text-center mt-1 text-sm font-medium text-gray-800">{label}</div>
      <div className="text-center text-[10px] text-gray-500">
        {status === "active" ? "Active" : status === "locked" ? "Locked" : "Not set"}
      </div>
    </div>
  )
}

export default Orb
