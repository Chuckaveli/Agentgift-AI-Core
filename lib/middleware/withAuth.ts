import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/types/supabase"

export interface AuthenticatedUser {
  id: string
  email: string
  tier: string
  credits: number
  xp: number
  level: number
  badges: string[]
  prestige_level: string | null
}

export interface AuthContext {
  user: AuthenticatedUser | null
  hasAccess: (requiredTier: string, creditsNeeded?: number) => boolean
  deductCredits: (amount: number, reason: string) => Promise<boolean>
}

export function withAuth<T extends any[]>(
  handler: (req: NextRequest, context: AuthContext, ...args: T) => Promise<Response>,
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    try {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json(
          {
            error: "Authentication service not configured",
            redirect: "/login",
          },
          { status: 503 },
        )
      }

      const supabase = createServerComponentClient({ cookies })

      // Check session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        return NextResponse.json({ error: "Authentication required", redirect: "/login" }, { status: 401 })
      }

      // Get user profile with credits and tier info
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profileError || !profile) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 })
      }

      const user: AuthenticatedUser = {
        id: profile.id,
        email: session.user.email || "",
        tier: profile.tier || "free_agent",
        credits: profile.credits || 0,
        xp: profile.xp || 0,
        level: profile.level || 1,
        badges: profile.badges || [],
        prestige_level: profile.prestige_level,
      }

      // Tier hierarchy for access checking
      const tierLevels = {
        free_agent: 0,
        premium_spy: 1,
        pro_agent: 2,
        agent_00g: 3,
        small_biz: 4,
        enterprise: 5,
      }

      const hasAccess = (requiredTier: string, creditsNeeded = 0): boolean => {
        const userTierLevel = tierLevels[user.tier as keyof typeof tierLevels] || 0
        const requiredTierLevel = tierLevels[requiredTier as keyof typeof tierLevels] || 0

        const tierAccess = userTierLevel >= requiredTierLevel
        const creditAccess = user.credits >= creditsNeeded

        return tierAccess && creditAccess
      }

      const deductCredits = async (amount: number, reason: string): Promise<boolean> => {
        if (user.credits < amount) return false

        try {
          // Update user credits
          const { error: updateError } = await supabase
            .from("user_profiles")
            .update({
              credits: user.credits - amount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)

          if (updateError) return false

          // Log transaction
          await supabase.from("credit_transactions").insert({
            user_id: user.id,
            amount: -amount,
            reason,
            balance_after: user.credits - amount,
            created_at: new Date().toISOString(),
          })

          // Calculate XP gain (2 credits = 1 XP)
          const xpGained = Math.floor(amount / 2)
          if (xpGained > 0) {
            const newXP = user.xp + xpGained
            const newLevel = Math.floor(newXP / 150) + 1

            await supabase
              .from("user_profiles")
              .update({
                xp: newXP,
                level: newLevel,
              })
              .eq("id", user.id)

            // Log XP gain
            await supabase.from("xp_logs").insert({
              user_id: user.id,
              xp_amount: xpGained,
              reason: `Credits spent: ${reason}`,
              created_at: new Date().toISOString(),
            })
          }

          // Update local user object
          user.credits -= amount
          user.xp += xpGained

          return true
        } catch (error) {
          console.error("Error deducting credits:", error)
          return false
        }
      }

      const context: AuthContext = {
        user,
        hasAccess,
        deductCredits,
      }

      return handler(req, context, ...args)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}

// Helper for page-level protection
export async function requireAuth(): Promise<AuthenticatedUser | null> {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return null
    }

    const supabase = createServerComponentClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return null

    const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single()

    if (!profile) return null

    return {
      id: profile.id,
      email: session.user.email || "",
      tier: profile.tier || "free_agent",
      credits: profile.credits || 0,
      xp: profile.xp || 0,
      level: profile.level || 1,
      badges: profile.badges || [],
      prestige_level: profile.prestige_level,
    }
  } catch (error) {
    console.error("requireAuth error:", error)
    return null
  }
}
