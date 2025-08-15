import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { checkUserAccess } from "./checkUserAccess"

describe("checkUserAccess", () => {
  it("omits fallbackReason when access is granted", async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: { tier: "agent_00g", credits: 10, xp: 0, level: 0 },
    })
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect })
    const mockSupabase = {
      auth: {
        getSession: jest
          .fn()
          .mockResolvedValue({ data: { session: { user: { id: "user1" } } } }),
      },
      from: mockFrom,
    }
    ;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase)

    const result = await checkUserAccess("gift-gut-check")

    expect(result.accessGranted).toBe(true)
    expect(result.fallbackReason).toBeUndefined()
  })
})
