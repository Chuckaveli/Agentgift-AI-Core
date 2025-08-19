import { generateGiftSuggestion, POST } from "./reveal/route"
import type { NextRequest } from "next/server"

describe("generateGiftSuggestion", () => {
  describe("Key generation with spaces", () => {
    it('should handle "just because" with spaces correctly', async () => {
      const result = await generateGiftSuggestion({
        occasion_type: "just because",
        emotional_state: "anxious",
        gift_frequency: "rarely",
        preferred_format: "physical",
      })

      expect(result.giftName).toBe("Worry Stone Garden Kit")
      expect(result.category).toBe("Mindfulness")
      expect(result.confidence).toBe(88)
    })

    it("should handle multiple spaces in occasion type", async () => {
      const result = await generateGiftSuggestion({
        occasion_type: "special   occasion",
        emotional_state: "grateful",
        gift_frequency: "sometimes",
        preferred_format: "experience",
      })

      // Should fall back to default since "grateful-specialoccasion" doesn't exist
      expect(result.giftName).toBe("Serendipity Box")
      expect(result.category).toBe("Mystery")
    })

    it("should handle mixed case with spaces", async () => {
      const result = await generateGiftSuggestion({
        occasion_type: "Just Because",
        emotional_state: "ANXIOUS",
        gift_frequency: "often",
        preferred_format: "digital",
      })

      expect(result.giftName).toBe("Worry Stone Garden Kit")
      expect(result.reasoning).toContain("Smooth stones for nervous hands")
    })

    it("should handle tabs and newlines in occasion type", async () => {
      const result = await generateGiftSuggestion({
        occasion_type: "just\t\nbecause",
        emotional_state: "anxious",
        gift_frequency: "rarely",
        preferred_format: "physical",
      })

      expect(result.giftName).toBe("Worry Stone Garden Kit")
    })
  })

  describe("Key Generation Logic", () => {
    it("should generate a key without spaces", async () => {
      const gift_dna = "Unique Gift DNA"
      const recipient_name = "Recipient Name"

      const req = {
        json: async () => ({ gift_dna, recipient_name }),
      } as NextRequest

      const res = await POST(req)
      const data = await res.json()

      expect(data.key).toBe("UniqueGiftDNA-RecipientName")
    })

    it("should handle empty strings", async () => {
      const gift_dna = ""
      const recipient_name = ""

      const req = {
        json: async () => ({ gift_dna, recipient_name }),
      } as NextRequest

      const res = await POST(req)
      const data = await res.json()

      expect(data.key).toBe("-")
    })

    it("should handle special characters", async () => {
      const gift_dna = "Gift@DNA!"
      const recipient_name = "Recipient#Name$"

      const req = {
        json: async () => ({ gift_dna, recipient_name }),
      } as NextRequest

      const res = await POST(req)
      const data = await res.json()

      expect(data.key).toBe("Gift@DNA!-Recipient#Name$")
    })
  })

  describe("Gift properties validation", () => {
    it("should return all required properties", async () => {
      const result = await generateGiftSuggestion({
        occasion_type: "healing",
        emotional_state: "overwhelmed",
        gift_frequency: "rarely",
        preferred_format: "physical",
      })

      expect(result).toHaveProperty("giftName")
      expect(result).toHaveProperty("reasoning")
      expect(result).toHaveProperty("emotionalBenefit")
      expect(result).toHaveProperty("giftUrl")
      expect(result).toHaveProperty("price")
      expect(result).toHaveProperty("category")
      expect(result).toHaveProperty("confidence")
    })

    it("should have valid confidence score range", async () => {
      const result = await generateGiftSuggestion({
        occasion_type: "anniversary",
        emotional_state: "nostalgic",
        gift_frequency: "often",
        preferred_format: "physical",
      })

      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(100)
    })

    it("should have properly formatted price", async () => {
      const result = await generateGiftSuggestion({
        occasion_type: "healing",
        emotional_state: "overwhelmed",
        gift_frequency: "sometimes",
        preferred_format: "physical",
      })

      expect(result.price).toMatch(/^\$\d+\.\d{2}$/)
    })

    it("should have valid URL format", async () => {
      const result = await generateGiftSuggestion({
        occasion_type: "just because",
        emotional_state: "anxious",
        gift_frequency: "rarely",
        preferred_format: "physical",
      })

      expect(result.giftUrl).toMatch(/^\/products\/[\w-]+$/)
    })
  })

  describe("Fallback behavior", () => {
    it("should fallback to default for unknown combinations", async () => {
      const result = await generateGiftSuggestion({
        occasion_type: "unknown occasion",
        emotional_state: "unknown emotion",
        gift_frequency: "never",
        preferred_format: "virtual",
      })

      expect(result.giftName).toBe("Serendipity Box")
      expect(result.category).toBe("Mystery")
      expect(result.confidence).toBe(85)
    })

    it("should handle empty strings", async () => {
      const result = await generateGiftSuggestion({
        occasion_type: "",
        emotional_state: "",
        gift_frequency: "sometimes",
        preferred_format: "physical",
      })

      expect(result.giftName).toBe("Serendipity Box")
    })
  })

  describe("Key generation edge cases", () => {
    it("should handle very long strings", async () => {
      const longOccasion = "a very long occasion type with many words and spaces"
      const result = await generateGiftSuggestion({
        occasion_type: longOccasion,
        emotional_state: "happy",
        gift_frequency: "rarely",
        preferred_format: "physical",
      })

      // Should not throw error and should fallback to default
      expect(result.giftName).toBe("Serendipity Box")
    })

    it("should handle special characters in occasion type", async () => {
      const result = await generateGiftSuggestion({
        occasion_type: "just-because!",
        emotional_state: "anxious",
        gift_frequency: "sometimes",
        preferred_format: "physical",
      })

      // Should fallback since special characters won't match exact keys
      expect(result.giftName).toBe("Serendipity Box")
    })
  })
})
