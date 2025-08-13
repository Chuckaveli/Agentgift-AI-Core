import { z } from "zod"
import { protectedProcedure, router } from "../context"
import { trackUsageSchema } from "@/lib/zodSchemas"
import { triggerFeatureUsageWebhook } from "@/lib/make"

export const featuresRouter = router({
  getAvailable: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, user } = ctx

    // Get user's profile to determine tier/plan
    const { data: profile } = await supabase.from("profiles").select("tier, plan").eq("id", user!.id).single()

    const tier = profile?.tier || "free"
    const plan = profile?.plan || "basic"

    // Define feature availability based on tier/plan
    const features = {
      chat: true,
      tts: plan === "premium" || plan === "enterprise",
      smartSearch: tier !== "free",
      gutCheck: tier !== "free",
      agentGifty: ["pro", "enterprise"].includes(tier),
      culturalIntelligence: ["pro", "enterprise"].includes(tier),
      groupGifting: tier === "enterprise",
      analytics: plan === "enterprise",
      apiAccess: plan === "enterprise",
      prioritySupport: tier !== "free",
      giftSaving: true,
    }

    return features
  }),

  trackUsage: protectedProcedure.input(trackUsageSchema).mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    const { data, error } = await supabase
      .from("feature_usage")
      .insert({
        user_id: user!.id,
        feature_id: input.featureId,
        metadata: input.metadata || {},
      })
      .select("id")
      .single()

    if (error) throw error
    // Trigger webhook for analytics (non-blocking)
    triggerFeatureUsageWebhook(input.featureId, user!.id, input.metadata).catch(console.error)

    return { ok: true as const, usageId: data.id }
  }),

  getUsageLimits: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, user } = ctx

    // Get user's profile to check tier
    const { data: profile } = await supabase.from("profiles").select("tier, plan").eq("id", user!.id).single()

    const tier = profile?.tier || "free"
    const plan = profile?.plan || "basic"

    // Define limits based on tier/plan
    const limits = {
      free: {
        smartSearches: 5,
        ttsRequests: 0,
        savedGifts: 10,
      },
      pro: {
        smartSearches: 50,
        ttsRequests: 20,
        savedGifts: 100,
      },
      enterprise: {
        smartSearches: -1, // unlimited
        ttsRequests: -1,
        savedGifts: -1,
      },
    }

    return limits[tier as keyof typeof limits] || limits.free
  }),

  checkAccess: protectedProcedure.input(z.object({ featureId: z.string() })).query(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    // Get available features
    const { data: profile } = await supabase.from("profiles").select("tier, plan").eq("id", user!.id).single()

    const tier = profile?.tier || "free"

    // Simple access check (you can make this more sophisticated)
    const hasAccess = tier !== "free" || ["chat", "giftSaving"].includes(input.featureId)

    return { hasAccess, tier }
  }),
})
