import { z } from "zod"
import { protectedProcedure, router } from "../context"
import { smartSearchSchema, saveGiftSchema } from "@/lib/zodSchemas"
import { triggerGiftSearchWebhook } from "@/lib/make"

export const giftsRouter = router({
  smartSearch: protectedProcedure.input(smartSearchSchema).mutation(async ({ ctx, input }) => {
    const { user } = ctx

    // Trigger Make webhook for AI processing (non-blocking)
    triggerGiftSearchWebhook(input.query, user.id).catch(console.error)

    // Mock AI-powered gift search results
    const mockResults = [
      {
        id: "gift-1",
        title: "Artisan Coffee Subscription",
        description: "Premium coffee beans from around the world, delivered monthly",
        price: 29.99,
        imageUrl: "/coffee-subscription-box.png",
        vendor: "Coffee Masters",
        category: "Food & Beverage",
        emotionalScore: 0.92,
        culturalScore: 0.88,
        matchReason: "Perfect for coffee enthusiasts who appreciate quality and discovery",
        tags: ["subscription", "coffee", "artisan", "monthly"],
        availability: "in_stock",
        shippingTime: "2-3 business days",
        culturalNotes: "Coffee gifting is appreciated across most cultures",
      },
      {
        id: "gift-2",
        title: "Personalized Leather Journal",
        description: "Hand-crafted leather journal with custom engraving",
        price: 45.0,
        imageUrl: "/placeholder-a9r41.png",
        vendor: "Artisan Crafts",
        category: "Stationery",
        emotionalScore: 0.89,
        culturalScore: 0.95,
        matchReason: "Thoughtful and personal, perfect for someone who values writing",
        tags: ["personalized", "leather", "journal", "handmade"],
        availability: "in_stock",
        shippingTime: "5-7 business days",
        culturalNotes: "Writing instruments are universally appreciated gifts",
      },
      {
        id: "gift-3",
        title: "Smart Plant Care System",
        description: "Automated watering and monitoring system for houseplants",
        price: 89.99,
        imageUrl: "/smart-plant-care-system.png",
        vendor: "GreenTech",
        category: "Home & Garden",
        emotionalScore: 0.85,
        culturalScore: 0.82,
        matchReason: "Great for plant lovers who want to keep their green friends healthy",
        tags: ["smart", "plants", "automation", "home"],
        availability: "limited_stock",
        shippingTime: "3-5 business days",
        culturalNotes: "Plants symbolize growth and care in many cultures",
      },
    ]

    // Filter results based on budget if provided
    let filteredResults = mockResults
    if (input.budget?.max) {
      filteredResults = mockResults.filter((gift) => gift.price <= input.budget!.max!)
    }
    if (input.budget?.min) {
      filteredResults = filteredResults.filter((gift) => gift.price >= input.budget!.min!)
    }

    return {
      results: filteredResults,
      total: filteredResults.length,
      query: input.query,
      metadata: {
        searchTime: Math.random() * 500 + 200, // Mock search time
        aiConfidence: 0.87,
        culturalContext: input.recipient?.relationship || "general",
        budgetRange: input.budget ? `$${input.budget.min || 0}-${input.budget.max || "∞"}` : "any",
      },
    }
  }),

  saveGift: protectedProcedure.input(saveGiftSchema).mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    const { data, error } = await supabase
      .from("saved_gifts")
      .insert({
        user_id: user.id,
        gift_id: input.giftId,
        gift_name: input.giftName,
        recipient_name: input.recipientName,
        occasion: input.occasion,
        price: input.price,
        notes: input.notes,
        status: "idea",
      })
      .select("id")
      .single()

    if (error) {
      throw error
    }

    return { ok: true as const, savedGiftId: data.id }
  }),

  getSavedGifts: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["idea", "researching", "decided", "purchased", "delivered"]).optional(),
          limit: z.number().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { supabase, user } = ctx

      let query = supabase
        .from("saved_gifts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (input?.status) {
        query = query.eq("status", input.status)
      }

      if (input?.limit) {
        query = query.limit(input.limit)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []
    }),

  updateGiftStatus: protectedProcedure
    .input(
      z.object({
        giftId: z.string().uuid(),
        status: z.enum(["idea", "researching", "decided", "purchased", "delivered"]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx

      const updateData: any = {
        status: input.status,
        updated_at: new Date().toISOString(),
      }

      if (input.notes !== undefined) {
        updateData.notes = input.notes
      }

      const { error } = await supabase
        .from("saved_gifts")
        .update(updateData)
        .eq("user_id", user.id)
        .eq("id", input.giftId)

      if (error) {
        throw error
      }

      return { ok: true as const }
    }),

  deleteGift: protectedProcedure.input(z.object({ giftId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    const { error } = await supabase.from("saved_gifts").delete().eq("user_id", user.id).eq("id", input.giftId)

    if (error) {
      throw error
    }

    return { ok: true as const }
  }),

  gutCheck: protectedProcedure
    .input(
      z.object({
        giftIdea: z.string().min(1),
        recipient: z.object({
          relationship: z.string(),
          interests: z.array(z.string()).optional(),
          personality: z.string().optional(),
        }),
        context: z
          .object({
            occasion: z.string().optional(),
            budget: z.number().optional(),
            timeline: z.string().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Mock gut check analysis
      const analysis = {
        overallScore: Math.random() * 0.3 + 0.7, // 70-100%
        factors: {
          personalRelevance: Math.random() * 0.4 + 0.6,
          occasionFit: Math.random() * 0.3 + 0.7,
          budgetAppropriate: Math.random() * 0.2 + 0.8,
          culturalSensitivity: Math.random() * 0.1 + 0.9,
        },
        insights: [
          "This gift shows thoughtfulness and personal attention",
          "The timing aligns well with the occasion",
          "Consider the recipient's current life situation",
        ],
        suggestions: [
          "Add a personal note explaining why you chose this",
          "Consider packaging or presentation options",
          "Think about delivery timing for maximum impact",
        ],
        redFlags: [],
        confidence: Math.random() * 0.2 + 0.8,
      }

      // Add red flags if score is low
      if (analysis.overallScore < 0.75) {
        analysis.redFlags.push("Gift may not align with recipient preferences")
      }

      return analysis
    }),
})
