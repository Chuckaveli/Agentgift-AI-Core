import { http, HttpResponse } from "msw"

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://test.supabase.co"

export const handlers = [
  // Auth endpoints
  http.post(`${BASE_URL}/auth/v1/signup`, async () => {
    return HttpResponse.json({
      user: {
        id: "new-user-123",
        email: "newuser@example.com",
        created_at: new Date().toISOString(),
      },
      session: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
      },
    })
  }),

  http.post(`${BASE_URL}/auth/v1/token`, async () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      user: {
        id: "user-123",
        email: "test@example.com",
      },
    })
  }),

  http.get(`${BASE_URL}/auth/v1/user`, async () => {
    return HttpResponse.json({
      id: "user-123",
      email: "test@example.com",
      user_metadata: {
        full_name: "Test User",
      },
    })
  }),

  // User profile
  http.get(`${BASE_URL}/rest/v1/user_profiles`, async () => {
    return HttpResponse.json([
      {
        id: "user-123",
        email: "test@example.com",
        full_name: "Test User",
        tier: "free",
        xp: 100,
        credits: 50,
      },
    ])
  }),

  // Features
  http.get(`${BASE_URL}/rest/v1/agentgift_features`, async () => {
    return HttpResponse.json([
      {
        id: "feature-1",
        name: "Gift Gut Check",
        tier_required: "free",
        is_active: true,
      },
      {
        id: "feature-2",
        name: "Smart Search",
        tier_required: "premium",
        is_active: true,
      },
    ])
  }),

  // Gift suggestions
  http.post("/api/gift-suggestions", async () => {
    return HttpResponse.json({
      suggestions: [
        {
          id: "gift-1",
          name: "Smart Plant Care System",
          price: 89.99,
        },
      ],
    })
  }),

  // Emotitokens
  http.get("/api/emotitokens/balance", async () => {
    return HttpResponse.json({
      balance: 150,
    })
  }),

  http.post("/api/emotitokens/send", async () => {
    return HttpResponse.json({
      success: true,
      new_balance: 130,
    })
  }),

  // AgentVault
  http.get("/api/agentvault/items", async () => {
    return HttpResponse.json({
      items: [
        {
          id: "auction-1",
          name: "Exclusive Tech Bundle",
          current_bid: 250,
          status: "active",
        },
      ],
    })
  }),

  http.post("/api/agentvault/bid", async () => {
    return HttpResponse.json({
      success: true,
      new_bid: 300,
    })
  }),

  // Error simulation
  http.get("/api/error", async () => {
    return HttpResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }),
]
