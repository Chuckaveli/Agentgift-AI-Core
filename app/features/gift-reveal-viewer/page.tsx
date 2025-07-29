"use client"

import { useState, useEffect } from "react"
import { GiftRealViewer } from "@/features/gift-real-viewer/component"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { UserTier } from "@/lib/global-logic"

export default function GiftRevealViewerPage() {
  const [userTier, setUserTier] = useState<UserTier>("free_agent")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getUserProfile() {
      try {
        console.log("Fetching user profile...")
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log("User session found:", session.user.id)
          const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("tier")
            .eq("id", session.user.id)
            .single()
          
          if (profileError) {
            console.error("Profile error:", profileError)
            setError("Failed to fetch user profile")
          } else if (profile?.tier) {
            console.log("User tier:", profile.tier)
            setUserTier(profile.tier as UserTier)
          }
        } else {
          console.log("No user session found")
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setError("Failed to load user data")
      } finally {
        setLoading(false)
      }
    }

    getUserProfile()
  }, [supabase])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading Gift Reveal Viewer...</p>
        </div>
      </div>
    )
  }

  console.log("Rendering GiftRealViewer with tier:", userTier)
  
  try {
    return <GiftRealViewer userTier={userTier} />
  } catch (componentError) {
    console.error("Component error:", componentError)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gift Reveal Viewer™
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                User Tier: {userTier}
              </p>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ Component loaded but there was an error. Check console for details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
} 