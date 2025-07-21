import { type NextRequest, NextResponse } from "next/server"

// Mock data for testing
const mockNominations = [
  {
    id: "1",
    recipientName: "Maria Santos",
    country: "Brazil",
    state: "São Paulo",
    story:
      "Single mother of three working two jobs to support her family. Recently lost her home in floods and is rebuilding from scratch with incredible strength and determination.",
    wishlist: ["School supplies for children", "Winter clothing", "Basic household items"],
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
    story:
      "Veteran struggling with PTSD who volunteers at local animal shelter despite personal challenges. His dedication to helping abandoned animals is truly inspiring.",
    wishlist: ["Apartment security deposit", "Professional work clothes", "Therapy sessions"],
    nominatorName: "Sarah Johnson",
    votes: 892,
    status: "approved",
    createdAt: "2024-01-20",
    userId: "user456",
  },
  {
    id: "3",
    recipientName: "Yuki Tanaka",
    country: "Japan",
    story:
      "Elderly man who lost his wife and now spends his days feeding stray cats in his neighborhood. His kindness touches everyone who meets him.",
    wishlist: ["Cat food and supplies", "Warm blankets", "Medical check-up"],
    nominatorName: "Hiroshi Sato",
    votes: 2156,
    status: "finalist",
    createdAt: "2024-01-10",
    userId: "user789",
  },
  {
    id: "4",
    recipientName: "Emma Thompson",
    country: "United Kingdom",
    story:
      "Teacher who started a free after-school program for underprivileged children. Uses her own money to buy supplies and snacks for the kids.",
    wishlist: ["Educational materials", "Art supplies", "Healthy snacks for kids"],
    nominatorName: "David Wilson",
    votes: 634,
    status: "approved",
    createdAt: "2024-01-22",
    userId: "user101",
  },
  {
    id: "5",
    recipientName: "Carlos Rodriguez",
    country: "Mexico",
    story:
      "Construction worker who built a playground for his neighborhood children using recycled materials. Works extra hours to fund community projects.",
    wishlist: ["Construction tools", "Safety equipment", "Materials for community center"],
    nominatorName: "Isabella Garcia",
    votes: 423,
    status: "approved",
    createdAt: "2024-01-25",
    userId: "user202",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country")
    const status = searchParams.get("status")

    let filteredNominations = [...mockNominations]

    if (country && country !== "all") {
      filteredNominations = filteredNominations.filter((n) => n.country === country)
    }

    if (status) {
      filteredNominations = filteredNominations.filter((n) => n.status === status)
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

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

    // Simulate checking user credits
    const userCredits = 150 // Mock user credits
    if (userCredits < 20) {
      return NextResponse.json(
        { success: false, error: "Insufficient credits. Need 20 credits to submit nomination." },
        { status: 400 },
      )
    }

    // Create nomination
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

    // Add to mock data (in real app, this would be saved to database)
    mockNominations.unshift(newNomination)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      nomination: newNomination,
      message: "Nomination submitted successfully! 20 credits deducted, 100 XP awarded.",
      creditsDeducted: 20,
      xpAwarded: 100,
    })
  } catch (error) {
    console.error("Error creating nomination:", error)
    return NextResponse.json({ success: false, error: "Failed to create nomination" }, { status: 500 })
  }
}
