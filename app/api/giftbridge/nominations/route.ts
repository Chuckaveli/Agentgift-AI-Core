import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country")
    const status = searchParams.get("status")

    // Mock data - in real app, fetch from Supabase
    const mockNominations = [
      {
        id: "1",
        recipientName: "Maria Santos",
        country: "Brazil",
        state: "São Paulo",
        story:
          "Single mother of three working two jobs to support her family. Recently lost her home in floods and is rebuilding from scratch.",
        wishlist: ["School supplies", "Winter clothing", "Basic household items"],
        nominatorName: "Ana Rodriguez",
        votes: 1247,
        status: "approved",
        createdAt: "2024-01-15",
        userId: "user123",
      },
      {
        id: "2",
        recipientName: "James Mitchell",
        country: "United States",
        state: "Ohio",
        story: "Veteran struggling with PTSD who volunteers at local animal shelter despite personal challenges.",
        wishlist: ["Apartment deposit", "Work clothes", "Therapy sessions"],
        nominatorName: "Sarah Johnson",
        votes: 892,
        status: "approved",
        createdAt: "2024-01-20",
        userId: "user456",
      },
    ]

    let filteredNominations = mockNominations

    if (country) {
      filteredNominations = filteredNominations.filter((n) => n.country === country)
    }

    if (status) {
      filteredNominations = filteredNominations.filter((n) => n.status === status)
    }

    return NextResponse.json({
      success: true,
      nominations: filteredNominations,
      total: filteredNominations.length,
    })
  } catch (error) {
    console.error("Error fetching nominations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch nominations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientName, country, state, story, wishlist, nominatorName, userId } = body

    // Validate required fields
    if (!recipientName || !country || !story || !nominatorName || !userId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check user credits (mock - in real app, check Supabase)
    const userCredits = 50 // Mock user credits
    if (userCredits < 20) {
      return NextResponse.json(
        { success: false, error: "Insufficient credits. Need 20 credits to submit nomination." },
        { status: 400 },
      )
    }

    // Create nomination (mock - in real app, insert into Supabase)
    const newNomination = {
      id: Date.now().toString(),
      recipientName,
      country,
      state: state || null,
      story,
      wishlist: Array.isArray(wishlist) ? wishlist : wishlist.split(",").map((item: string) => item.trim()),
      nominatorName,
      votes: 0,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      userId,
    }

    // Deduct credits (mock - in real app, update Supabase)
    console.log(`Deducted 20 credits from user ${userId}`)

    // Award XP for submission (mock - in real app, update Supabase)
    console.log(`Awarded 100 XP to user ${userId} for nomination submission`)

    return NextResponse.json({
      success: true,
      nomination: newNomination,
      message: "Nomination submitted successfully! 20 credits deducted, 100 XP awarded.",
    })
  } catch (error) {
    console.error("Error creating nomination:", error)
    return NextResponse.json({ success: false, error: "Failed to create nomination" }, { status: 500 })
  }
}
