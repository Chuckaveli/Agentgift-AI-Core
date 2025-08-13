import { z } from "zod"
import { router, protectedProcedure } from "../server"

const GiftSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  recipient: z.object({
    relationship: z.enum(["family", "friend", "colleague", "romantic", "other"]),
    age_range: z.enum(["child", "teen", "young_adult", "adult", "senior"]).optional(),
    interests: z.array(z.string()).optional(),
  }),
  budget: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
    currency: z.string().default("USD"),
  }),
  occasion: z.enum(["birthday", "holiday", "anniversary", "graduation", "wedding", "other"]).optional(),
  cultural_context: z
    .object({
      country: z.string().optional(),
      religion: z.string().optional(),
      traditions: z.array(z.string()).optional(),
    })
    .optional(),
})

export const giftsRouter = router({
  smartSearch: protectedProcedure.input(GiftSearchSchema).mutation(async ({ ctx, input }) => {
    // Track feature usage
    await ctx.supabase.from("feature_usage").insert({
      user_id: ctx.user.id,
      feature_id: "smart-search",
      metadata: { query: input.query, budget: input.budget },
    })

    // Mock AI-powered gift suggestions
    const mockGifts = [
      {
        id: "gift-1",
        name: "Artisan Coffee Subscription",
        description: "Premium coffee beans from around the world, delivered monthly",
        price: 45,
        currency: "USD",
        image_url: "/placeholder.svg?height=200&width=200&text=Coffee",
        vendor: "Local Roasters Co.",
        emotional_score: 0.92,
        cultural_fit: 0.88,
        match_reasoning: "Perfect for coffee enthusiasts who appreciate quality and discovery",
        tags: ["subscription", "coffee", "artisan", "monthly"],
        availability: "in_stock",
      },
      {
        id: "gift-2",
        name: "Personalized Leather Journal",
        description: "Hand-crafted leather journal with custom engraving",
        price: 35,
        currency: "USD",
        image_url: "/placeholder.svg?height=200&width=200&text=Journal",
        vendor: "Craftsman Studio",
        emotional_score: 0.89,
        cultural_fit: 0.95,
        match_reasoning: "Thoughtful and personal, great for someone who loves writing or planning",
        tags: ["personalized", "leather", "journal", "handmade"],
        availability: "in_stock",
      },
      {
        id: "gift-3",
        name: "Succulent Garden Kit",
        description: "Complete kit to grow and care for beautiful succulents",
        price: 28,
        currency: "USD",
        image_url: "/placeholder.svg?height=200&width=200&text=Plants",
        vendor: "Green Thumb Gardens",
        emotional_score: 0.85,
        cultural_fit: 0.82,
        match_reasoning: "Low-maintenance plants perfect for beginners or busy people",
        tags: ["plants", "gardening", "kit", "low-maintenance"],
        availability: "in_stock",
      },
    ]

    // Filter by budget if specified
    const filteredGifts = mockGifts.filter((gift) => {
      if (input.budget.min && gift.price < input.budget.min) return false
      if (input.budget.max && gift.price > input.budget.max) return false
      return true
    })

    return {
      gifts: filteredGifts,
      total_results: filteredGifts.length,
      search_metadata: {
        query: input.query,
        processing_time: "0.45s",
        ai_confidence: 0.91,
      },
    }
  }),

  gutCheck: protectedProcedure
    .input(
      z.object({
        gift_name: z.string(),
        recipient_relationship: z.string(),
        occasion: z.string(),
        price: z.number(),
        additional_context: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Track feature usage
      await ctx.supabase.from("feature_usage").insert({
        user_id: ctx.user.id,
        feature_id: "gut-check",
        metadata: { gift_name: input.gift_name, price: input.price },
      })

      // Mock gut check analysis
      const analysis = {
        overall_score: 0.87,
        feedback: {
          positive: [
            "Great price point for the relationship",
            "Thoughtful and personal choice",
            "Appropriate for the occasion",
          ],
          concerns: ["Consider if they already have something similar"],
          suggestions: ["Add a personal note to make it extra special", "Consider gift wrapping options"],
        },
        cultural_considerations: {
          appropriate: true,
          notes: "This gift aligns well with common gifting practices",
        },
        confidence_level: 0.89,
      }

      return analysis
    }),

  saveGift: protectedProcedure
    .input(
      z.object({
        gift_id: z.string(),
        gift_name: z.string(),
        recipient_name: z.string().optional(),
        occasion: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.from("saved_gifts").insert({
        user_id: ctx.user.id,
        gift_id: input.gift_id,
        gift_name: input.gift_name,
        recipient_name: input.recipient_name,
        occasion: input.occasion,
        notes: input.notes,
        created_at: new Date().toISOString(),
      })

      if (error) {
        throw new Error("Failed to save gift")
      }

      return { success: true, id: data?.[0]?.id }
    }),

  getSavedGifts: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("saved_gifts")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return []
    }

    return data
  }),
})
