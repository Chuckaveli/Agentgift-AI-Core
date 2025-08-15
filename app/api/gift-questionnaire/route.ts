import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const dynamic = "force-dynamic"

interface QuestionnaireData {
  recipientName: string
  relationship: string
  birthday?: string
  loveLanguage: string
  interests: string[]
  hobbies?: string
}

interface GiftSuggestion {
  name: string
  description: string
  price: string
  category: string
  confidence: number
  reasoning: string
}

const LOVE_LANGUAGE_GIFTS = {
  "Words of Affirmation": [
    {
      name: "Custom Photo Book",
      description: "Personalized photo album with heartfelt messages",
      price: "$25-45",
      category: "Personalized",
    },
    {
      name: "Handwritten Letter Set",
      description: "Beautiful stationery for meaningful notes",
      price: "$15-30",
      category: "Stationery",
    },
    {
      name: "Inspirational Book Collection",
      description: "Curated books with uplifting messages",
      price: "$20-40",
      category: "Books",
    },
  ],
  "Quality Time": [
    {
      name: "Experience Voucher",
      description: "Tickets for shared activities or events",
      price: "$30-100",
      category: "Experiences",
    },
    {
      name: "Board Game Collection",
      description: "Games perfect for spending time together",
      price: "$25-60",
      category: "Games",
    },
    {
      name: "Cooking Class for Two",
      description: "Learn new recipes together",
      price: "$80-150",
      category: "Experiences",
    },
  ],
  "Physical Touch": [
    { name: "Luxury Blanket", description: "Soft, cozy blanket for comfort", price: "$40-80", category: "Home" },
    {
      name: "Massage Gift Certificate",
      description: "Professional massage experience",
      price: "$60-120",
      category: "Wellness",
    },
    { name: "Weighted Blanket", description: "Therapeutic comfort blanket", price: "$50-100", category: "Wellness" },
  ],
  "Acts of Service": [
    {
      name: "Meal Delivery Service",
      description: "Pre-prepared meals for convenience",
      price: "$50-100",
      category: "Food",
    },
    {
      name: "House Cleaning Service",
      description: "Professional cleaning service",
      price: "$80-150",
      category: "Services",
    },
    {
      name: "Task Management Planner",
      description: "Beautiful planner to organize life",
      price: "$20-40",
      category: "Organization",
    },
  ],
  "Receiving Gifts": [
    {
      name: "Surprise Gift Box",
      description: "Curated monthly surprise box",
      price: "$30-60",
      category: "Subscription",
    },
    { name: "Jewelry Piece", description: "Thoughtful jewelry selection", price: "$40-200", category: "Jewelry" },
    { name: "Artisan Craft Item", description: "Unique handmade creation", price: "$25-75", category: "Handmade" },
  ],
}

const INTEREST_GIFTS = {
  "Art & Creativity": [
    { name: "Art Supply Set", description: "Professional-grade art materials", price: "$40-100", category: "Art" },
    {
      name: "Digital Drawing Tablet",
      description: "Graphics tablet for digital art",
      price: "$60-200",
      category: "Electronics",
    },
    {
      name: "Craft Workshop Kit",
      description: "Complete kit for new craft skills",
      price: "$30-70",
      category: "Crafts",
    },
  ],
  "Books & Reading": [
    { name: "E-Reader", description: "Latest e-reader with backlight", price: "$100-200", category: "Electronics" },
    {
      name: "Book Subscription Box",
      description: "Monthly curated book selections",
      price: "$15-30/month",
      category: "Subscription",
    },
    {
      name: "Reading Accessories Set",
      description: "Bookmarks, reading light, book stand",
      price: "$20-40",
      category: "Accessories",
    },
  ],
  "Coffee & Tea": [
    {
      name: "Premium Coffee Subscription",
      description: "Monthly delivery of artisan coffee beans",
      price: "$20-40/month",
      category: "Subscription",
    },
    {
      name: "Professional Espresso Machine",
      description: "High-quality home espresso maker",
      price: "$200-500",
      category: "Kitchen",
    },
    {
      name: "Tea Tasting Set",
      description: "Curated selection of premium teas",
      price: "$30-60",
      category: "Food",
    },
  ],
  "Cooking & Baking": [
    {
      name: "Premium Spice Set",
      description: "Gourmet spices from around the world",
      price: "$35-60",
      category: "Food",
    },
    { name: "Stand Mixer", description: "Professional-grade kitchen mixer", price: "$200-400", category: "Kitchen" },
    {
      name: "Cookbook Collection",
      description: "Curated cookbooks for inspiration",
      price: "$25-50",
      category: "Books",
    },
  ],
  "Fitness & Wellness": [
    {
      name: "Fitness Tracker",
      description: "Advanced health and activity monitor",
      price: "$100-300",
      category: "Electronics",
    },
    { name: "Yoga Mat Set", description: "Premium yoga mat with accessories", price: "$40-80", category: "Fitness" },
    {
      name: "Protein Powder Set",
      description: "High-quality protein supplements",
      price: "$30-60",
      category: "Nutrition",
    },
  ],
  Gaming: [
    {
      name: "Gaming Headset",
      description: "High-quality gaming headphones with mic",
      price: "$80-200",
      category: "Electronics",
    },
    {
      name: "Mechanical Keyboard",
      description: "Premium gaming keyboard with RGB lighting",
      price: "$100-250",
      category: "Electronics",
    },
    {
      name: "Board Game Collection",
      description: "Strategy and party games for all occasions",
      price: "$30-80",
      category: "Games",
    },
  ],
  Gardening: [
    {
      name: "Indoor Plant Collection",
      description: "Beautiful houseplants with care guide",
      price: "$25-75",
      category: "Plants",
    },
    { name: "Garden Tool Kit", description: "High-quality gardening tools", price: "$50-100", category: "Garden" },
    {
      name: "Seed Starting Kit",
      description: "Everything needed to start a garden",
      price: "$20-50",
      category: "Garden",
    },
  ],
  Music: [
    {
      name: "Wireless Headphones",
      description: "High-quality noise-canceling headphones",
      price: "$100-300",
      category: "Electronics",
    },
    {
      name: "Vinyl Record Collection",
      description: "Curated vintage or new vinyl records",
      price: "$20-60",
      category: "Music",
    },
    {
      name: "Concert Tickets",
      description: "Tickets to favorite artist performance",
      price: "$50-200",
      category: "Experiences",
    },
  ],
  "Outdoor Activities": [
    {
      name: "Hiking Gear Set",
      description: "Essential equipment for outdoor adventures",
      price: "$60-150",
      category: "Outdoor",
    },
    {
      name: "Camping Equipment",
      description: "High-quality camping essentials",
      price: "$80-200",
      category: "Outdoor",
    },
    {
      name: "Adventure Experience",
      description: "Guided outdoor activity or tour",
      price: "$100-300",
      category: "Experiences",
    },
  ],
  Photography: [
    {
      name: "Camera Accessories Kit",
      description: "Lenses, filters, and photography tools",
      price: "$50-200",
      category: "Electronics",
    },
    {
      name: "Photo Editing Software",
      description: "Professional photo editing suite",
      price: "$100-300",
      category: "Software",
    },
    {
      name: "Photography Workshop",
      description: "Learn advanced photography techniques",
      price: "$150-400",
      category: "Experiences",
    },
  ],
  Technology: [
    {
      name: "Smart Home Device",
      description: "Voice-controlled smart assistant",
      price: "$50-150",
      category: "Electronics",
    },
    {
      name: "Wireless Charging Station",
      description: "Multi-device charging hub",
      price: "$30-80",
      category: "Electronics",
    },
    {
      name: "Tech Organizer Bag",
      description: "Organized storage for gadgets",
      price: "$25-50",
      category: "Accessories",
    },
  ],
  Travel: [
    {
      name: "Travel Gear Set",
      description: "Luggage organizers and travel accessories",
      price: "$40-100",
      category: "Travel",
    },
    {
      name: "Travel Experience Gift Card",
      description: "Credit for flights, hotels, or experiences",
      price: "$100-500",
      category: "Experiences",
    },
    {
      name: "Travel Journal",
      description: "Beautiful journal for travel memories",
      price: "$15-35",
      category: "Stationery",
    },
  ],
}

function generateFallbackSuggestions(
  loveLanguage: string,
  interests: string[],
  relationship: string,
): GiftSuggestion[] {
  const suggestions: GiftSuggestion[] = []

  // Get love language based suggestions
  const loveLanguageGifts = LOVE_LANGUAGE_GIFTS[loveLanguage as keyof typeof LOVE_LANGUAGE_GIFTS] || []

  // Get interest based suggestions
  const interestGifts: any[] = []
  interests.forEach((interest) => {
    const gifts = INTEREST_GIFTS[interest as keyof typeof INTEREST_GIFTS] || []
    interestGifts.push(...gifts)
  })

  // Combine and create suggestions
  const allGifts = [...loveLanguageGifts, ...interestGifts]

  // Select top 3 unique suggestions
  const uniqueGifts = allGifts
    .filter((gift, index, self) => index === self.findIndex((g) => g.name === gift.name))
    .slice(0, 3)

  return uniqueGifts.map((gift, index) => ({
    name: gift.name,
    description: gift.description,
    price: gift.price,
    category: gift.category,
    confidence: Math.max(85 - index * 5, 70), // Decreasing confidence
    reasoning: `Perfect match for someone who values ${loveLanguage.toLowerCase()} and enjoys ${interests.join(", ").toLowerCase()}.`,
  }))
}

function calculateRelationshipBonus(relationship: string): number {
  const bonuses = {
    "Romantic Partner": 10,
    Spouse: 10,
    "Best Friend": 8,
    "Family Member": 7,
    "Close Friend": 6,
    Colleague: 3,
    Acquaintance: 1,
  }
  return bonuses[relationship as keyof typeof bonuses] || 0
}

export async function POST(request: NextRequest) {
  try {
    const data: QuestionnaireData = await request.json()

    // Validate required fields
    if (!data.recipientName || !data.relationship || !data.loveLanguage || !data.interests?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store questionnaire session
    const supabase = createAdminClient()
    const { error: sessionError } = await supabase.from("gift_questionnaire_sessions").insert({
      session_id: sessionId,
      recipient_name: data.recipientName,
      relationship: data.relationship,
      birthday: data.birthday,
      love_language: data.loveLanguage,
      interests: data.interests,
      hobbies: data.hobbies,
      completed_at: new Date().toISOString(),
    })

    if (sessionError) {
      console.error("Session storage error:", sessionError)
      // Continue with AI generation even if storage fails
    }

    let suggestions: GiftSuggestion[] = []

    try {
      // Generate AI suggestions
      const prompt = `Generate 3 personalized gift suggestions for:
      - Recipient: ${data.recipientName}
      - Relationship: ${data.relationship}
      - Love Language: ${data.loveLanguage}
      - Interests: ${data.interests.join(", ")}
      ${data.hobbies ? `- Additional hobbies: ${data.hobbies}` : ""}
      ${data.birthday ? `- Birthday: ${data.birthday}` : ""}

      For each gift, provide:
      1. Name (concise, appealing)
      2. Description (1-2 sentences)
      3. Price range (realistic estimate)
      4. Category
      5. Confidence score (70-100)
      6. Reasoning (why this matches their profile)

      Focus on gifts that align with their love language and interests. Consider the relationship context.
      
      Return as JSON array with this structure:
      [{"name": "...", "description": "...", "price": "...", "category": "...", "confidence": 95, "reasoning": "..."}]`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.7,
      })

      // Parse AI response - fix the regex syntax error
      const jsonStart = text.indexOf("[")
      const jsonEnd = text.lastIndexOf("]")

      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonText = text.substring(jsonStart, jsonEnd + 1)
        const aiSuggestions = JSON.parse(jsonText)

        // Add relationship bonus to confidence scores
        const relationshipBonus = calculateRelationshipBonus(data.relationship)
        suggestions = aiSuggestions.map((suggestion: any) => ({
          ...suggestion,
          confidence: Math.min(100, suggestion.confidence + relationshipBonus),
        }))
      }
    } catch (aiError) {
      console.error("AI generation error:", aiError)
    }

    // Fallback to curated suggestions if AI fails
    if (suggestions.length === 0) {
      suggestions = generateFallbackSuggestions(data.loveLanguage, data.interests, data.relationship)

      // Add relationship bonus
      const relationshipBonus = calculateRelationshipBonus(data.relationship)
      suggestions = suggestions.map((suggestion) => ({
        ...suggestion,
        confidence: Math.min(100, suggestion.confidence + relationshipBonus),
      }))
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence)

    return NextResponse.json({
      sessionId,
      suggestions,
      recipientName: data.recipientName,
      relationship: data.relationship,
      loveLanguage: data.loveLanguage,
      interests: data.interests,
    })
  } catch (error) {
    console.error("Gift questionnaire error:", error)
    return NextResponse.json({ error: "Failed to process questionnaire" }, { status: 500 })
  }
}
