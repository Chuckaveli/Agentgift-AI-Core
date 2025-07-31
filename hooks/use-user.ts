"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  name: string
  email: string
  admin_role: boolean
  tier: string
  xp_balance: number
  created_at: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    async function getUser() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        if (mounted) {
          setUser(user)
        }

        if (user) {
          // Get user profile
          const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single()

          if (profileError && profileError.code !== "PGRST116") {
            throw profileError
          }

          if (mounted) {
            setProfile(profileData)
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "An error occurred")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)

        if (session?.user) {
          // Refresh profile when user changes
          const { data: profileData } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          setProfile(profileData)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    profile,
    loading,
    error,
    isAdmin: profile?.admin_role || false,
  }
}
