import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"

export const POST = withAuth(async (request: Request, { user, deductCredits }) => {
  try {
    const { recipientName, giftDescription, location, messageType, messageContent } = await request.json()

    // Deduct credits for using the feature
    const success = await deductCredits(2, "Agent Gifty")
    if (!success) {
      return NextResponse.json(
        { error: "Insufficient credits", creditsNeeded: 2, creditsAvailable: user?.credits || 0 },
        { status: 402 }
      )
    }

    // Generate QR code and create gift drop
    const giftDropId = `drop_${Date.now()}`
    const qrCodeUrl = `https://agentgift.ai/claim/${giftDropId}`

    const giftDrop = {
      id: giftDropId,
      recipientName,
      giftDescription,
      location,
      messageType,
      messageContent,
      qrCodeUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdBy: user?.id,
      isActive: true,
    }

    return NextResponse.json({
      success: true,
      giftDrop,
      xp_gained: 1,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create gift drop" }, { status: 500 })
  }
})

export const GET = withAuth(async (request: Request, { user }) => {
  try {
    // Get user's gift drops
    const giftDrops = [
      // Mock data - in real app this would come from database
      {
        id: "drop_1",
        recipientName: "John Doe",
        giftDescription: "Birthday surprise",
        location: "Office",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      giftDrops,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gift drops" }, { status: 500 })
  }
}) 