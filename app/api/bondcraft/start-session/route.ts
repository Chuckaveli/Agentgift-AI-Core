import { type NextRequest, NextResponse } from "next/server"
const RITUAL_TEMPLATES = {
  "Long-Distance": {
    "Poetic & Romantic": [
      {
        title: "Sunday 60-Second Voice Note Tradition",
        description:
          "Every Sunday, send a 60-second voice note sharing your week's most beautiful moment, creating an audio diary of your love across the miles.",
        emotional_benefit:
          "Maintains intimate connection through voice, creating anticipation and emotional presence despite physical distance.",
        frequency: "Weekly",
        difficulty: "Easy",
        category: "Communication",
      },
      {
        title: "Synchronized Sunset Ritual",
        description:
          "Watch the sunset together via video call, sharing three things you're grateful for while the sky paints your love story in colors.",
        emotional_benefit:
          "Creates shared experiences and gratitude practice, fostering connection through nature's beauty.",
        frequency: "Weekly",
        difficulty: "Easy",
        category: "Shared Experience",
      },
    ],
    "Cheeky & Playful": [
      {
        title: "Emoji Gifting Codewords",
        description:
          "Create secret emoji combinations that represent different gifts or surprises, sending coded messages throughout the day that only you two understand.",
        emotional_benefit:
          "Builds playful intimacy and inside jokes, creating a private language that strengthens your bond.",
        frequency: "Daily",
        difficulty: "Easy",
        category: "Communication",
      },
    ],
  },
  "Healing & Rebuilding": {
    "Soulful & Deep": [
      {
        title: "Trust Rebuilding Check-ins",
        description:
          "Weekly 20-minute conversations where you share one fear, one hope, and one appreciation, creating safe space for vulnerability and growth.",
        emotional_benefit:
          "Rebuilds trust through consistent vulnerability and emotional safety, fostering deeper understanding.",
        frequency: "Weekly",
        difficulty: "Advanced",
        category: "Emotional Healing",
      },
    ],
  },
  "New Romance": [
    {
      title: "Discovery Question Game",
      description:
        "Each date, ask each other one deep question you've never asked before and really listen to the answer.",
      emotional_benefit: "Accelerates emotional intimacy and understanding in early relationship stages",
      frequency: "Per Date",
      difficulty: "Easy",
      category: "Discovery",
    },
    {
      title: "First Times Journal",
      description:
        'Keep a shared journal documenting all your "firsts" together with photos and feelings about each experience.',
      emotional_benefit: "Creates lasting memories and celebrates the excitement of new experiences",
      frequency: "Ongoing",
      difficulty: "Medium",
      category: "Memory Making",
    },
    {
      title: "Surprise Skill Share",
      description: "Each week, teach each other something you're good at - a recipe, a song, a skill, or a hobby.",
      emotional_benefit: "Builds admiration and creates opportunities for playful learning together",
      frequency: "Weekly",
      difficulty: "Medium",
      category: "Learning",
    },
    {
      title: "Future Dreams Mapping",
      description:
        "Create a visual map of your individual and shared dreams, updating it as you learn more about each other.",
      emotional_benefit: "Aligns future visions and creates excitement about shared possibilities",
      frequency: "Monthly",
      difficulty: "Advanced",
      category: "Future Planning",
    },
    {
      title: "Emoji Love Language",
      description:
        "Develop your own emoji code for different feelings and use it throughout the day to stay connected.",
      emotional_benefit: "Creates playful intimacy and unique communication style",
      frequency: "Daily",
      difficulty: "Easy",
      category: "Communication",
    },
  ],
  "Married Life": [
    {
      title: "Weekly Marriage Check-In",
      description:
        "Every Sunday evening, spend 20 minutes discussing what worked well this week and what you want to improve.",
      emotional_benefit: "Maintains relationship health through regular, structured communication",
      frequency: "Weekly",
      difficulty: "Medium",
      category: "Maintenance",
    },
    {
      title: "Date Night Jar",
      description:
        "Fill a jar with 52 different date ideas. Pull one out each week and commit to making it happen, no matter how busy life gets.",
      emotional_benefit: "Ensures consistent quality time and prevents relationship from becoming routine",
      frequency: "Weekly",
      difficulty: "Easy",
      category: "Romance",
    },
    {
      title: "Appreciation Text Ritual",
      description:
        "Every Tuesday and Friday, send a specific text about something your spouse did that you appreciated.",
      emotional_benefit: "Combats taking each other for granted and reinforces positive behaviors",
      frequency: "Twice Weekly",
      difficulty: "Easy",
      category: "Appreciation",
    },
    {
      title: "Monthly Adventure Challenge",
      description: "Each month, try something completely new together - a class, restaurant, activity, or destination.",
      emotional_benefit: "Keeps relationship fresh and creates shared growth experiences",
      frequency: "Monthly",
      difficulty: "Medium",
      category: "Adventure",
    },
    {
      title: "Love Note Surprise System",
      description:
        "Hide love notes in unexpected places for your spouse to find throughout the week - lunch box, car, pillow, etc.",
      emotional_benefit: "Adds spontaneous romance and joy to daily routines",
      frequency: "Weekly",
      difficulty: "Easy",
      category: "Surprise",
    },
  ],
  "Playful & Fun": [
    {
      title: "Weekly Silly Challenge",
      description:
        "Each week, create a fun challenge for each other - dance battle, cooking competition, or creative contest.",
      emotional_benefit: "Maintains playfulness and creates laughter-filled memories",
      frequency: "Weekly",
      difficulty: "Medium",
      category: "Play",
    },
    {
      title: "Meme Exchange Ritual",
      description: "Send each other a meme every day that reminds you of them or makes you think they'd laugh.",
      emotional_benefit: "Keeps communication light and shows you think of each other throughout the day",
      frequency: "Daily",
      difficulty: "Easy",
      category: "Humor",
    },
    {
      title: "Adventure Dice Game",
      description:
        "Create dice with different activities, locations, and treats. Roll them monthly to plan spontaneous adventures.",
      emotional_benefit: "Adds excitement and unpredictability to your time together",
      frequency: "Monthly",
      difficulty: "Medium",
      category: "Adventure",
    },
    {
      title: "Compliment Competition",
      description:
        "Each day, try to give each other increasingly creative and specific compliments. Keep score playfully.",
      emotional_benefit: "Builds each other up while maintaining competitive fun",
      frequency: "Daily",
      difficulty: "Easy",
      category: "Appreciation",
    },
    {
      title: "Photo Scavenger Hunt",
      description:
        'Create monthly photo challenges for each other to complete and share - "find something that reminds you of me".',
      emotional_benefit: "Encourages creativity and thoughtfulness in a playful format",
      frequency: "Monthly",
      difficulty: "Medium",
      category: "Creativity",
    },
  ],
  "Deep & Soulful": [
    {
      title: "Soul Question Sunday",
      description:
        "Every Sunday, ask each other a deep question about life, values, dreams, or spirituality and really explore the answers together.",
      emotional_benefit: "Deepens emotional and spiritual connection through meaningful dialogue",
      frequency: "Weekly",
      difficulty: "Advanced",
      category: "Deep Connection",
    },
    {
      title: "Meditation & Reflection Ritual",
      description: "Spend 15 minutes in quiet reflection together, then share one insight or feeling that came up.",
      emotional_benefit: "Creates shared spiritual practice and emotional awareness",
      frequency: "Weekly",
      difficulty: "Medium",
      category: "Spirituality",
    },
    {
      title: "Growth Goal Partnership",
      description:
        "Choose personal growth goals and support each other's journey with weekly check-ins and encouragement.",
      emotional_benefit: "Supports individual development while strengthening partnership",
      frequency: "Weekly",
      difficulty: "Advanced",
      category: "Growth",
    },
    {
      title: "Gratitude & Intention Setting",
      description:
        "Each morning, share three gratitudes and set an intention for how you want to love each other that day.",
      emotional_benefit: "Starts each day with appreciation and conscious loving intention",
      frequency: "Daily",
      difficulty: "Medium",
      category: "Mindfulness",
    },
    {
      title: "Legacy Letter Exchange",
      description:
        "Once a quarter, write letters to each other about the legacy you want to create together and your deepest hopes.",
      emotional_benefit: "Connects daily love to larger life purpose and shared meaning",
      frequency: "Quarterly",
      difficulty: "Advanced",
      category: "Purpose",
    },
  ],
  "Busy Professionals": [
    {
      title: "Calendar Love Blocks",
      description:
        'Schedule 15-minute "love blocks" in your calendars three times a week for undivided attention to each other.',
      emotional_benefit: "Ensures consistent connection despite busy schedules",
      frequency: "Three times weekly",
      difficulty: "Easy",
      category: "Time Management",
    },
    {
      title: "Commute Connection Call",
      description:
        "Use commute time for a daily check-in call to share highlights, challenges, and support for the day ahead.",
      emotional_benefit: "Maximizes limited time and provides daily emotional support",
      frequency: "Daily",
      difficulty: "Easy",
      category: "Communication",
    },
    {
      title: "Weekend Ritual Protection",
      description:
        "Protect 2 hours every weekend as sacred relationship time - no work, phones, or other commitments allowed.",
      emotional_benefit: "Creates guaranteed quality time and work-life boundaries",
      frequency: "Weekly",
      difficulty: "Medium",
      category: "Boundaries",
    },
    {
      title: "Success Celebration System",
      description:
        "Create a system to immediately celebrate each other's work wins, no matter how small, with specific rituals.",
      emotional_benefit: "Ensures career success enhances rather than competes with relationship",
      frequency: "As needed",
      difficulty: "Easy",
      category: "Support",
    },
    {
      title: "Stress Relief Tag Team",
      description:
        "Develop signals for when you need support and specific ways to help each other decompress from work stress.",
      emotional_benefit: "Turns relationship into a source of stress relief rather than additional pressure",
      frequency: "As needed",
      difficulty: "Medium",
      category: "Support",
    },
  ],
  "Creative Partnership": [
    {
      title: "Weekly Creative Challenge",
      description:
        "Each week, choose a creative medium and create something together - art, music, writing, or crafts.",
      emotional_benefit: "Builds shared creative expression and collaborative joy",
      frequency: "Weekly",
      difficulty: "Medium",
      category: "Creativity",
    },
    {
      title: "Inspiration Exchange Ritual",
      description:
        "Share one thing that inspired you each day and explore how it might influence your creative work together.",
      emotional_benefit: "Keeps creative energy flowing and builds shared artistic vision",
      frequency: "Daily",
      difficulty: "Easy",
      category: "Inspiration",
    },
    {
      title: "Creative Date Adventures",
      description:
        "Monthly visits to galleries, concerts, or creative spaces followed by discussions about what moved you.",
      emotional_benefit: "Feeds creative souls while creating shared aesthetic experiences",
      frequency: "Monthly",
      difficulty: "Medium",
      category: "Adventure",
    },
    {
      title: "Collaborative Project Ritual",
      description:
        "Always have one ongoing creative project you're working on together - a song, story, art piece, or performance.",
      emotional_benefit: "Creates shared goals and celebrates combined creative talents",
      frequency: "Ongoing",
      difficulty: "Advanced",
      category: "Collaboration",
    },
    {
      title: "Creative Appreciation Practice",
      description:
        "Each week, create something small (poem, drawing, song) that expresses your appreciation for your partner.",
      emotional_benefit: "Combines creative expression with relationship appreciation",
      frequency: "Weekly",
      difficulty: "Medium",
      category: "Appreciation",
    },
  ],
}

const REFLECTION_QUOTES = [
  "Love is not about how many days, months, or years you have been together. It's about how much you love each other every single day.",
  "The best relationships are the ones where you can be completely yourself and still be loved for who you are.",
  "True intimacy is when you can share your deepest thoughts without fear of judgment.",
  "Every relationship is a journey of discovery, where you learn not just about each other, but about yourselves.",
  "The strongest bonds are forged not in perfection, but in the willingness to grow together through imperfection.",
]

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const { user_id, relationship_dynamic, occasion, tone, user_tier } = await request.json()

    // Validate input
    if (!user_id || !relationship_dynamic || !occasion || !tone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user has already used their yearly session (for free users)
    if (user_tier === "free_agent") {
      const { data: existingSessions } = await supabase
        .from("bondcraft_sessions")
        .select("id")
        .eq("user_id", user_id)
        .gte("created_at", new Date(new Date().getFullYear(), 0, 1).toISOString())

      if (existingSessions && existingSessions.length > 0) {
        return NextResponse.json({ error: "Free users are limited to one session per calendar year" }, { status: 403 })
      }
    }

    // Generate rituals based on dynamic and tone
    const ritualTemplates = RITUAL_TEMPLATES[relationship_dynamic]?.[tone] || []
    const numRituals = user_tier === "free_agent" ? 1 : 5

    // If we don't have enough templates, generate some basic ones
    const rituals = []
    for (let i = 0; i < numRituals; i++) {
      if (ritualTemplates[i]) {
        rituals.push({
          id: `ritual_${i + 1}`,
          ...ritualTemplates[i],
        })
      } else {
        // Generate a basic ritual if we don't have a template
        rituals.push({
          id: `ritual_${i + 1}`,
          title: `Custom ${relationship_dynamic} Ritual ${i + 1}`,
          description: `A personalized ritual designed for your ${relationship_dynamic.toLowerCase()} relationship with a ${tone.toLowerCase()} approach.`,
          emotional_benefit: "Strengthens your unique bond through intentional connection practices.",
          frequency: "Weekly",
          difficulty: "Medium",
          category: "Custom",
        })
      }
    }

    // Create session in database
    const { data: session, error: sessionError } = await supabase
      .from("bondcraft_sessions")
      .insert({
        user_id,
        relationship_dynamic,
        occasion,
        tone,
        rituals: rituals,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (sessionError) {
      console.error("Error creating session:", sessionError)
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    return NextResponse.json({
      session,
      rituals,
      message: "BondCraft™ session started successfully",
    })
  } catch (error) {
    console.error("Error in start-session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
