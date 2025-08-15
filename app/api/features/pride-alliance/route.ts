import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

const supabase = createAdminClient()

// Pride Alliance XP rewards
const XP_REWARDS = {
  complete_pride_quest: 50,
  nominate_LGBTQ_friend: 30,
  join_ally_squad: 25,
  send_care_kit: 40,
  gift_drop_reaction: 15,
  seasonal_bonus_multiplier: 1.5,
}

// Seasonal quest availability
const SEASONAL_PERIODS = {
  pride_month: { start: "06-01", end: "07-31" },
  coming_out_day: { start: "10-01", end: "10-31" },
  trans_day_remembrance: { start: "11-15", end: "11-30" },
}

interface PrideAllianceRequest {
  action: "complete_quest" | "join_squad" | "send_care_kit" | "nominate_friend" | "get_quests" | "get_squads"
  userId: string
  data?: any
}

export async function POST(request: NextRequest) {
  try {
    const body: PrideAllianceRequest = await request.json()
    const { action, userId, data } = body

    switch (action) {
      case "complete_quest":
        return await handleCompleteQuest(userId, data)

      case "join_squad":
        return await handleJoinSquad(userId, data)

      case "send_care_kit":
        return await handleSendCareKit(userId, data)

      case "nominate_friend":
        return await handleNominateFriend(userId, data)

      case "get_quests":
        return await handleGetQuests(userId)

      case "get_squads":
        return await handleGetSquads(userId)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Pride Alliance API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleCompleteQuest(userId: string, questData: any) {
  const { questId, questType } = questData

  // Check if quest is available during current season
  const currentDate = new Date()
  const isSeasonallyAvailable = checkSeasonalAvailability(questType, currentDate)

  if (!isSeasonallyAvailable) {
    return NextResponse.json({ error: "Quest not available in current season" }, { status: 400 })
  }

  // Calculate XP reward with seasonal bonus
  const baseXP = XP_REWARDS.complete_pride_quest
  const seasonalMultiplier = isInPrideMonth(currentDate) ? XP_REWARDS.seasonal_bonus_multiplier : 1
  const totalXP = Math.floor(baseXP * seasonalMultiplier)

  // Record quest completion
  const { error: questError } = await supabase.from("pride_quest_completions").insert({
    user_id: userId,
    quest_id: questId,
    quest_type: questType,
    xp_earned: totalXP,
    completed_at: new Date().toISOString(),
  })

  if (questError) {
    console.error("Error recording quest completion:", questError)
    return NextResponse.json({ error: "Failed to record quest completion" }, { status: 500 })
  }

  // Update user XP
  await updateUserXP(userId, totalXP, `Completed Pride Quest: ${questId}`)

  // Check for badge unlocks
  const badgeUnlocked = await checkPrideBadgeUnlocks(userId)

  return NextResponse.json({
    success: true,
    xpEarned: totalXP,
    seasonalBonus: seasonalMultiplier > 1,
    badgeUnlocked,
  })
}

async function handleJoinSquad(userId: string, squadData: any) {
  const { squadId } = squadData

  // Check if user is already in squad
  const { data: existingMembership } = await supabase
    .from("ally_squad_members")
    .select("id")
    .eq("user_id", userId)
    .eq("squad_id", squadId)
    .single()

  if (existingMembership) {
    return NextResponse.json({ error: "Already a member of this squad" }, { status: 400 })
  }

  // Add user to squad
  const { error: membershipError } = await supabase.from("ally_squad_members").insert({
    user_id: userId,
    squad_id: squadId,
    joined_at: new Date().toISOString(),
  })

  if (membershipError) {
    console.error("Error joining squad:", membershipError)
    return NextResponse.json({ error: "Failed to join squad" }, { status: 500 })
  }

  // Award XP
  const xpEarned = XP_REWARDS.join_ally_squad
  await updateUserXP(userId, xpEarned, `Joined Ally Squad: ${squadId}`)

  // Update squad member count
  await supabase.rpc("increment_squad_member_count", { squad_id: squadId })

  return NextResponse.json({
    success: true,
    xpEarned,
    message: "Successfully joined ally squad!",
  })
}

async function handleSendCareKit(userId: string, careKitData: any) {
  const { templateId, recipientName, personalMessage, deliveryMethod } = careKitData

  // Record care kit creation
  const { error: careKitError } = await supabase.from("pride_care_kits").insert({
    user_id: userId,
    template_id: templateId,
    recipient_name: recipientName,
    personal_message: personalMessage,
    delivery_method: deliveryMethod,
    created_at: new Date().toISOString(),
  })

  if (careKitError) {
    console.error("Error creating care kit:", careKitError)
    return NextResponse.json({ error: "Failed to create care kit" }, { status: 500 })
  }

  // Award XP
  const xpEarned = XP_REWARDS.send_care_kit
  await updateUserXP(userId, xpEarned, "Sent Coming-Out Care Kit")

  // Check for compassion badges
  const badgeUnlocked = await checkCompassionBadges(userId)

  return NextResponse.json({
    success: true,
    xpEarned,
    badgeUnlocked,
    message: "Care kit sent successfully!",
  })
}

async function handleNominateFriend(userId: string, nominationData: any) {
  const { nomineeName, reason, giftCategory } = nominationData

  // Record nomination
  const { error: nominationError } = await supabase.from("pride_nominations").insert({
    nominator_id: userId,
    nominee_name: nomineeName,
    nomination_reason: reason,
    preferred_gift_category: giftCategory,
    created_at: new Date().toISOString(),
    status: "pending",
  })

  if (nominationError) {
    console.error("Error creating nomination:", nominationError)
    return NextResponse.json({ error: "Failed to create nomination" }, { status: 500 })
  }

  // Award XP
  const xpEarned = XP_REWARDS.nominate_LGBTQ_friend
  await updateUserXP(userId, xpEarned, "Nominated LGBTQ+ Friend")

  return NextResponse.json({
    success: true,
    xpEarned,
    message: "Nomination submitted successfully!",
  })
}

async function handleGetQuests(userId: string) {
  // Get user's completed quests
  const { data: completedQuests } = await supabase
    .from("pride_quest_completions")
    .select("quest_id, quest_type, completed_at")
    .eq("user_id", userId)

  // Get available quests based on current season
  const currentDate = new Date()
  const availableQuests = getSeasonalQuests(currentDate)

  // Mark completed quests
  const questsWithProgress = availableQuests.map((quest) => ({
    ...quest,
    completed: completedQuests?.some((cq) => cq.quest_id === quest.id) || false,
    completedAt: completedQuests?.find((cq) => cq.quest_id === quest.id)?.completed_at,
  }))

  return NextResponse.json({
    success: true,
    quests: questsWithProgress,
    seasonalInfo: getSeasonalInfo(currentDate),
  })
}

async function handleGetSquads(userId: string) {
  // Get all ally squads with user membership status
  const { data: squads } = await supabase.from("ally_squads").select(`
      *,
      ally_squad_members!inner(user_id)
    `)

  const squadsWithMembership =
    squads?.map((squad) => ({
      ...squad,
      isJoined: squad.ally_squad_members.some((member: any) => member.user_id === userId),
    })) || []

  return NextResponse.json({
    success: true,
    squads: squadsWithMembership,
  })
}

// Helper functions
async function updateUserXP(userId: string, xpAmount: number, reason: string) {
  // Update user profile XP
  const { error: xpError } = await supabase.rpc("add_user_xp", {
    user_id: userId,
    xp_amount: xpAmount,
    reason: reason,
  })

  if (xpError) {
    console.error("Error updating user XP:", xpError)
  }

  // Log XP transaction
  await supabase.from("xp_logs").insert({
    user_id: userId,
    xp_amount: xpAmount,
    reason: reason,
    created_at: new Date().toISOString(),
  })
}

function checkSeasonalAvailability(questType: string, currentDate: Date): boolean {
  const month = currentDate.getMonth() + 1
  const day = currentDate.getDate()
  const currentDateStr = `${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`

  // Pride month quests
  if (
    questType.includes("pride") &&
    currentDateStr >= SEASONAL_PERIODS.pride_month.start &&
    currentDateStr <= SEASONAL_PERIODS.pride_month.end
  ) {
    return true
  }

  // Coming out day quests
  if (
    questType.includes("coming_out") &&
    currentDateStr >= SEASONAL_PERIODS.coming_out_day.start &&
    currentDateStr <= SEASONAL_PERIODS.coming_out_day.end
  ) {
    return true
  }

  // Trans day of remembrance quests
  if (
    questType.includes("trans") &&
    currentDateStr >= SEASONAL_PERIODS.trans_day_remembrance.start &&
    currentDateStr <= SEASONAL_PERIODS.trans_day_remembrance.end
  ) {
    return true
  }

  // Year-round quests
  if (questType.includes("general") || questType.includes("ally")) {
    return true
  }

  return false
}

function isInPrideMonth(currentDate: Date): boolean {
  const month = currentDate.getMonth() + 1
  return month === 6 || month === 7 // June or July
}

function getSeasonalQuests(currentDate: Date) {
  const baseQuests = [
    {
      id: "pride-drops-quest",
      title: "🎉 Complete 3 Pride Drops",
      description: "Send 3 identity-affirming gifts this week",
      type: "pride_drops",
      xpReward: 50,
      maxProgress: 3,
      availableUntil: "2024-07-31",
    },
    {
      id: "ally-squad-quest",
      title: "🫂 Join an Ally Squad",
      description: "Connect with allies and complete a group mission",
      type: "ally_squad",
      xpReward: 25,
      maxProgress: 1,
      availableUntil: "2024-12-31",
    },
  ]

  // Add seasonal quests based on current date
  if (isInPrideMonth(currentDate)) {
    baseQuests.push({
      id: "pride-celebration-quest",
      title: "🏳️‍🌈 Pride Celebration Special",
      description: "Participate in Pride Month activities",
      type: "pride_celebration",
      xpReward: 75,
      maxProgress: 1,
      availableUntil: "2024-07-31",
    })
  }

  return baseQuests
}

function getSeasonalInfo(currentDate: Date) {
  const month = currentDate.getMonth() + 1

  if (month === 6 || month === 7) {
    return {
      season: "Pride Month",
      description: "Celebrate identity and love with enhanced XP rewards!",
      multiplier: XP_REWARDS.seasonal_bonus_multiplier,
      endDate: "2024-07-31",
    }
  }

  if (month === 10) {
    return {
      season: "Coming Out Day",
      description: "Support those sharing their authentic selves",
      specialFeatures: ["Enhanced care kit templates", "Coming out support resources"],
      endDate: "2024-10-31",
    }
  }

  if (month === 11) {
    return {
      season: "Trans Day of Remembrance",
      description: "Honor and support the transgender community",
      specialFeatures: ["Memorial support resources", "Trans-focused ally missions"],
      endDate: "2024-11-30",
    }
  }

  return {
    season: "Year-round Support",
    description: "Inclusive gifting available all year long",
    features: ["Identity-aware filters", "Ally squad missions", "Care kit creation"],
  }
}

async function checkPrideBadgeUnlocks(userId: string): Promise<string | null> {
  // Get user's quest completion count
  const { data: completions } = await supabase.from("pride_quest_completions").select("id").eq("user_id", userId)

  const completionCount = completions?.length || 0

  // Check for badge unlocks
  if (completionCount === 1) {
    await awardBadge(userId, "Pride Ally", "Completed your first Pride quest")
    return "Pride Ally"
  }

  if (completionCount === 5) {
    await awardBadge(userId, "Rainbow Warrior", "Completed 5 Pride quests")
    return "Rainbow Warrior"
  }

  if (completionCount === 10) {
    await awardBadge(userId, "Love is a Gift", "Completed 10 Pride quests - LGBTQ+ exclusive badge tier")
    return "Love is a Gift"
  }

  return null
}

async function checkCompassionBadges(userId: string): Promise<string | null> {
  // Get user's care kit count
  const { data: careKits } = await supabase.from("pride_care_kits").select("id").eq("user_id", userId)

  const careKitCount = careKits?.length || 0

  if (careKitCount === 1) {
    await awardBadge(userId, "Caring Heart", "Sent your first care kit")
    return "Caring Heart"
  }

  if (careKitCount === 5) {
    await awardBadge(userId, "Support Champion", "Sent 5 care kits")
    return "Support Champion"
  }

  return null
}

async function awardBadge(userId: string, badgeName: string, description: string) {
  await supabase.from("user_badges").insert({
    user_id: userId,
    badge_name: badgeName,
    badge_description: description,
    earned_at: new Date().toISOString(),
    category: "pride_alliance",
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  switch (action) {
    case "get_quests":
      return await handleGetQuests(userId)

    case "get_squads":
      return await handleGetSquads(userId)

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }
}
