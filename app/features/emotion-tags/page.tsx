"use client"

import { useState, useEffect } from "react"
import { EmotionTags } from "@/features/emotion-tags/component"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { UserTier } from "@/lib/global-logic"

export default function EmotionTagsPage() {
  const [userTier, setUserTier] = useState<UserTier>("free_agent")
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getUserProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("tier")
            .eq("id", session.user.id)
            .single()
          
          if (profile?.tier) {
            setUserTier(profile.tier as UserTier)
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    getUserProfile()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <EmotionTags userTier={userTier} />
} 