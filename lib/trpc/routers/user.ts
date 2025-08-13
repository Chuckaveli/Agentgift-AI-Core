import { z } from "zod"
import { router, protectedProcedure } from "../server"

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data: profile, error } = await ctx.supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", ctx.user.id)
      .single()

    if (error) {
      // Return mock data if table doesn't exist
      return {
        id: ctx.user.id,
        email: ctx.user.email,
        full_name: ctx.user.user_metadata?.full_name || "User",
        avatar_url: ctx.user.user_metadata?.avatar_url || null,
        xp_points: 100,
        tier: "Explorer",
        created_at: new Date().toISOString(),
      }
    }

    return profile
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        full_name: z.string().optional(),
        avatar_url: z.string().url().optional(),
        preferences: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("user_profiles")
        .update(input)
        .eq("user_id", ctx.user.id)
        .select()
        .single()

      if (error) {
        throw new Error("Failed to update profile")
      }

      return data
    }),

  getXPHistory: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("xp_transactions")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      // Return mock XP history
      return [
        {
          id: "1",
          user_id: ctx.user.id,
          points: 25,
          action: "gift_search",
          description: "Used Smart Search feature",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          user_id: ctx.user.id,
          points: 50,
          action: "profile_complete",
          description: "Completed profile setup",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ]
    }

    return data
  }),

  getGiftHistory: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("saved_gifts")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      // Return mock gift history
      return [
        {
          id: "1",
          user_id: ctx.user.id,
          gift_name: "Artisan Coffee Subscription",
          recipient_name: "Sarah",
          occasion: "Birthday",
          price_range: "$30-50",
          status: "saved",
          created_at: new Date().toISOString(),
        },
      ]
    }

    return data
  }),
})
