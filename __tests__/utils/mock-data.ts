export const mockUser = {
  id: "user-123",
  email: "test@example.com",
  user_metadata: {
    full_name: "Test User",
    avatar_url: "https://example.com/avatar.jpg",
  },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

export const mockUserProfile = {
  id: "user-123",
  email: "test@example.com",
  full_name: "Test User",
  avatar_url: "https://example.com/avatar.jpg",
  tier: "free",
  xp: 100,
  credits: 50,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

export const mockFeatures = [
  {
    id: "feature-1",
    name: "Gift Gut Check",
    description: "Quick gift validation",
    icon: "heart",
    tier_required: "free",
    xp_required: 0,
    is_active: true,
    route: "/gut-check",
  },
  {
    id: "feature-2",
    name: "Smart Search",
    description: "AI-powered gift search",
    icon: "search",
    tier_required: "premium",
    xp_required: 100,
    is_active: true,
    route: "/smart-search",
  },
  {
    id: "feature-3",
    name: "AgentVault",
    description: "Exclusive gift auctions",
    icon: "lock",
    tier_required: "pro",
    xp_required: 500,
    is_active: true,
    route: "/agentvault",
  },
]

export const mockGiftSuggestions = [
  {
    id: "gift-1",
    name: "Smart Plant Care System",
    description: "Automated watering and monitoring",
    price: 89.99,
    image_url: "/smart-plant-care-system.png",
    category: "tech",
    tags: ["smart-home", "plants", "automation"],
  },
  {
    id: "gift-2",
    name: "Coffee Subscription Box",
    description: "Monthly artisan coffee delivery",
    price: 29.99,
    image_url: "/coffee-subscription-box.png",
    category: "food",
    tags: ["subscription", "coffee", "gourmet"],
  },
]

export const mockEmotitokens = {
  balance: 150,
  transactions: [
    {
      id: "tx-1",
      amount: 50,
      type: "earned",
      description: "Completed Gift Gut Check",
      created_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "tx-2",
      amount: -20,
      type: "spent",
      description: "Sent gift to colleague",
      created_at: "2024-01-14T15:30:00Z",
    },
  ],
}

export const mockAuctionItems = [
  {
    id: "auction-1",
    name: "Exclusive Tech Bundle",
    description: "Limited edition gadgets",
    starting_bid: 100,
    current_bid: 250,
    end_time: "2024-02-01T00:00:00Z",
    image_url: "/placeholder.jpg",
    status: "active",
  },
]

export const mockBadges = [
  {
    id: "badge-1",
    name: "First Gift",
    description: "Sent your first gift",
    icon: "gift",
    earned_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "badge-2",
    name: "Generous Giver",
    description: "Sent 10 gifts",
    icon: "heart",
    earned_at: null,
  },
]

export const mockApiError = {
  error: "Internal Server Error",
  message: "Something went wrong",
  statusCode: 500,
}

export const mockValidationError = {
  error: "Validation Error",
  message: "Invalid input data",
  statusCode: 400,
  details: {
    email: "Invalid email format",
  },
}
