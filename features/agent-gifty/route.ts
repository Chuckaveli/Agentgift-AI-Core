import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { recipientName, giftDescription, location, userId } = await request.json()

    // Create gift drop
    const giftDrop = await createGiftDrop({
      recipientName,
      giftDescription,
      location,
      userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })

    // Generate QR code
    const qrCode = generateQRCode(giftDrop.id)

    return NextResponse.json({
      success: true,
      giftDrop: {
        ...giftDrop,
        qrCode,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create gift drop" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dropId = searchParams.get("dropId")

    if (!dropId) {
      return NextResponse.json({ error: "Drop ID required" }, { status: 400 })
    }

    const giftDrop = await getGiftDrop(dropId)

    if (!giftDrop || !giftDrop.isActive) {
      return NextResponse.json({ error: "Gift drop not found or expired" }, { status: 404 })
    }

    return NextResponse.json({ giftDrop })
  } catch (error) {
    return NextResponse.json({ error: "Failed to retrieve gift drop" }, { status: 500 })
  }
}

async function createGiftDrop(data: any) {
  // In a real app, this would save to database
  return {
    id: `drop_${Date.now()}`,
    ...data,
    isActive: true,
    createdAt: new Date().toISOString(),
  }
}

async function getGiftDrop(dropId: string) {
  // In a real app, this would query database
  return {
    id: dropId,
    recipientName: "Test User",
    giftDescription: "A special surprise",
    location: "Coffee Shop",
    isActive: true,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

function generateQRCode(dropId: string): string {
  return `https://agentgift.ai/claim/${dropId}`
}
