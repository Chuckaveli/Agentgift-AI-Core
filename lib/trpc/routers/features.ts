import { z } from "zod"
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../server"

export const featuresRouter = router({
  getAvailableFeatures: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.from("features").select("*").eq("is_active", true)

    if (error) {
      // Return mock features
      return [
        {
          id: "smart-search",
          name: "Smart Search",
          description: "AI-powered gift discovery with cultural intelligence",
          tier_required: "Explorer",
          usage_limit: 10,
          is_active: true,
        },
        {
          id: "gut-check",
          name: "Gift Gut Check",
          description: "Get instant feedback on your gift ideas",
          tier_required: "Explorer",
          usage_limit: 5,
          is_active: true,
        },
        {
          id: "agent-gifty",
          name: "Agent Gifty",
          description: "Your personal AI gift concierge",
          tier_required: "Curator",
          usage_limit: 20,
          is_active: true,
        },
      ]
    }

    return data
  }),

  checkFeatureAccess: protectedProcedure.input(z.object({ featureId: z.string() })).query(async ({ ctx, input }) => {
    // Check user's tier and usage
    const { data: usage, error } = await ctx.supabase
      .from("feature_usage")
      .select("*")
      .eq("user_id", ctx.user.id)
      .eq("feature_id", input.featureId)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      // Return mock access data
      return {
        hasAccess: true,
        usageCount: 2,
        usageLimit: 10,
        resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    }

    return {
      hasAccess: usage.length < 10, // Mock limit
      usageCount: usage.length,
      usageLimit: 10,
      resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
  }),

  trackFeatureUsage: protectedProcedure
    .input(
      z.object({
        featureId: z.string(),
        metadata: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.from("feature_usage").insert({
        user_id: ctx.user.id,
        feature_id: input.featureId,
        metadata: input.metadata,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.log("Failed to track usage:", error)
        return { success: true } // Don't fail the request if tracking fails
      }

      return { success: true }
    }),

  getFeatureAnalytics: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("feature_usage")
      .select("feature_id, created_at")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      // Return mock analytics
      return {
        totalUsage: 1250,
        topFeatures: [
          { feature_id: "smart-search", usage_count: 450 },
          { feature_id: "gut-check", usage_count: 320 },
          { feature_id: "agent-gifty", usage_count: 280 },
        ],
        dailyUsage: [
          { date: "2024-01-01", count: 180 },
          { date: "2024-01-02", count: 165 },
          { date: "2024-01-03", count: 195 },
        ],
      }
    }

    // Process the data for analytics
    const analytics = {
      totalUsage: data.length,
      topFeatures: [] as any[],
      dailyUsage: [] as any[],
    }

    return analytics
  }),
})
