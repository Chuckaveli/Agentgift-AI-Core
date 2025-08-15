import { suggestPhysicalFollowThrough } from "./external-services"
import serviceSuggestions from "./service-suggestions.json"

describe("suggestPhysicalFollowThrough", () => {
  const userTier = "business"

  Object.entries(serviceSuggestions).forEach(([emotion, expected]) => {
    test(`returns suggestions for ${emotion}`, () => {
      const result = suggestPhysicalFollowThrough(emotion, "", userTier)
      expect(result).toEqual(expected)
    })
  })

  test("returns empty array for unknown emotion", () => {
    expect(
      suggestPhysicalFollowThrough("unknown", "", userTier),
    ).toEqual([])
  })
})
