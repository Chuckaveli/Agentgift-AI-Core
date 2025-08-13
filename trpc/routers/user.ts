import { z } from "zod"
import { protectedProcedure, router } from "../context"
import { updateProfileSchema } from "@/lib/zodSchemas"

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, user } = ctx

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

    if (error) {
      throw error
    }

    return data
  }),

  upsertProfile: protectedProcedure.input(updateProfileSchema).mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email!,
        full_name: input.fullName,
        preferences: input.preferences || {},
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return data
  }),

  getUsageStats: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, user } = ctx

    // Get feature usage count for current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from("feature_usage")
      .select("feature_id")
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString())

    if (error) {
      throw error
    }

    // Count usage by feature
    const usageByFeature = (data || []).reduce(
      (acc, usage) => {
        acc[usage.feature_id] = (acc[usage.feature_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalUsage: data?.length || 0,
      usageByFeature,
      period: "current_month",
    }
  }),

  deleteAccount: protectedProcedure
    .input(
      z.object({
        confirmation: z.literal("DELETE_MY_ACCOUNT"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx

      // Delete user profile (cascading deletes will handle related data)
      const { error } = await supabase.from("profiles").delete().eq("id", user.id)

      if (error) {
        throw error
      }

      return { ok: true as const }
    }),
})
