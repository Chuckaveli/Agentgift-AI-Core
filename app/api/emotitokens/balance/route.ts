import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

    // Mock token balances
    const mockBalances = [
      {
        id: "1",
        user_id: "mock-user-id",
        token_type_id: "compassion",
        balance: 25,
        allocated: 50,
        month_year: currentMonth,
        emoti_token_types: {
          token_name: "compassion",
          display_name: "Compassion Token",
          emoji: "💝",
          description: "Recognize acts of kindness and empathy",
          color_hex: "#ec4899",
          xp_value: 10,
        },
      },
      {
        id: "2",
        user_id: "mock-user-id",
        token_type_id: "wisdom",
        balance: 18,
        allocated: 30,
        month_year: currentMonth,
        emoti_token_types: {
          token_name: "wisdom",
          display_name: "Wisdom Token",
          emoji: "🧠",
          description: "Acknowledge great insights and knowledge sharing",
          color_hex: "#8b5cf6",
          xp_value: 15,
        },
      },
      {
        id: "3",
        user_id: "mock-user-id",
        token_type_id: "energy",
        balance: 32,
        allocated: 40,
        month_year: currentMonth,
        emoti_token_types: {
          token_name: "energy",
          display_name: "Energy Token",
          emoji: "⚡",
          description: "Celebrate enthusiasm and motivation",
          color_hex: "#10b981",
          xp_value: 8,
        },
      },
    ]

    const mockSentTokens = [
      {
        id: "1",
        sender_id: "mock-user-id",
        receiver_id: "other-user-1",
        token_type_id: "compassion",
        amount: 3,
        message: "Thanks for helping with the project!",
        created_at: new Date().toISOString(),
        emoti_token_types: { display_name: "Compassion Token", emoji: "💝" },
        receiver: { email: "colleague@example.com" },
      },
    ]

    const mockReceivedTokens = [
      {
        id: "2",
        sender_id: "other-user-2",
        receiver_id: "mock-user-id",
        token_type_id: "wisdom",
        amount: 2,
        message: "Great insight in the meeting!",
        created_at: new Date(Date.now() - 60000).toISOString(),
        emoti_token_types: { display_name: "Wisdom Token", emoji: "🧠" },
        sender: { email: "manager@example.com" },
      },
    ]

    // Calculate days until reset
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      balances: mockBalances,
      sent_tokens: mockSentTokens,
      received_tokens: mockReceivedTokens,
      current_month: currentMonth,
      days_until_reset: daysUntilReset,
    })
  } catch (error) {
    console.error("Error in EmotiTokens balance API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
