import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

const supabase = createAdminClient()

// Helper function to extract hashtags from text
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g
  return text.match(hashtagRegex) || []
}

// Helper function to fetch post data using oEmbed/OpenGraph
async function fetchPostData(url: string, platform: string) {
  try {
    let apiUrl = ""

    switch (platform) {
      case "instagram":
        // Instagram oEmbed API
        apiUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`
        break
      case "twitter":
        // Twitter oEmbed API
        apiUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`
        break
      case "tiktok":
        // TikTok oEmbed API
        apiUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
        break
      default:
        throw new Error("Unsupported platform")
    }

    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch post data: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      title: data.title || "",
      author_name: data.author_name || "",
      thumbnail_url: data.thumbnail_url || "",
      html: data.html || "",
    }
  } catch (error) {
    console.error("Error fetching post data:", error)
    return null
  }
}

// Helper function to verify hashtags against campaign requirements
async function verifyHashtags(hashtags: string[], campaignId?: string) {
  if (!campaignId) {
    // Check for general AgentGift hashtags
    const requiredTags = ["#AgentGifted", "#agentgifted"]
    return hashtags.some((tag) => requiredTags.includes(tag.toLowerCase()))
  }

  const { data: campaign } = await supabase
    .from("social_campaigns")
    .select("required_hashtags, optional_hashtags")
    .eq("id", campaignId)
    .single()

  if (!campaign) return false

  // Check if all required hashtags are present
  const lowerHashtags = hashtags.map((tag) => tag.toLowerCase())
  const requiredMatch = campaign.required_hashtags.every((required) => lowerHashtags.includes(required.toLowerCase()))

  return requiredMatch
}

// Helper function to calculate confidence score for auto-approval
function calculateConfidenceScore(postData: any, hashtags: string[], hasRequiredTags: boolean): number {
  let score = 0

  // Base score for having required hashtags
  if (hasRequiredTags) score += 0.6

  // Score for having post data successfully fetched
  if (postData) score += 0.2

  // Score for having multiple relevant hashtags
  const relevantTags = hashtags.filter(
    (tag) =>
      tag.toLowerCase().includes("gift") || tag.toLowerCase().includes("agent") || tag.toLowerCase().includes("reveal"),
  )
  if (relevantTags.length >= 2) score += 0.2

  return Math.min(score, 1.0)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Fetch user's social proof submissions
    const { data: submissions, error } = await supabase
      .from("social_proofs")
      .select("*")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Error fetching submissions:", error)
      return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
    }

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Error in GET /api/social-proofs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, post_url, campaign_id, manual_caption, manual_hashtags, user_id } = body

    if (!platform || !post_url || !user_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch post data from social platform
    const postData = await fetchPostData(post_url, platform)

    // Extract hashtags from caption or use manual input
    let hashtags: string[] = []
    let captionText = ""

    if (postData && postData.title) {
      captionText = postData.title
      hashtags = extractHashtags(postData.title)
    }

    // Use manual inputs if auto-detection failed
    if (manual_caption && hashtags.length === 0) {
      captionText = manual_caption
      hashtags = extractHashtags(manual_caption)
    }

    if (manual_hashtags && manual_hashtags.length > 0) {
      hashtags = [...hashtags, ...manual_hashtags]
    }

    // Remove duplicates and ensure hashtags start with #
    hashtags = [...new Set(hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)))]

    // Verify hashtags against campaign requirements
    const hasRequiredTags = await verifyHashtags(hashtags, campaign_id)

    // Calculate confidence score for auto-approval
    const confidenceScore = calculateConfidenceScore(postData, hashtags, hasRequiredTags)
    const autoApprove = confidenceScore >= 0.8

    // Get campaign details for XP reward
    let xpReward = 25 // default
    let badgeReward = null

    if (campaign_id) {
      const { data: campaign } = await supabase
        .from("social_campaigns")
        .select("xp_reward, badge_reward, min_posts_for_badge")
        .eq("id", campaign_id)
        .single()

      if (campaign) {
        xpReward = campaign.xp_reward
        badgeReward = campaign.badge_reward
      }
    }

    // Create social proof record
    const { data: socialProof, error: insertError } = await supabase
      .from("social_proofs")
      .insert({
        user_id,
        platform,
        post_url,
        caption_text: captionText,
        hashtags,
        status: autoApprove ? "approved" : "pending",
        xp_awarded: autoApprove ? xpReward : 0,
        required_hashtags: campaign_id ? [] : ["#AgentGifted"], // Will be populated by trigger
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting social proof:", insertError)
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 })
    }

    let badgeUnlocked = false
    let badgeName = ""

    // If auto-approved, award XP and check for badge unlock
    if (autoApprove) {
      // Add XP to user
      const { error: xpError } = await supabase.rpc("add_user_xp", {
        user_id: user_id,
        xp_amount: xpReward,
        reason: `Social media post approved: ${platform}`,
      })

      if (xpError) {
        console.error("Error adding XP:", xpError)
      }

      // Check for badge unlock
      if (badgeReward) {
        const { data: approvedCount } = await supabase
          .from("social_proofs")
          .select("id", { count: "exact" })
          .eq("user_id", user_id)
          .eq("status", "approved")

        const { data: campaign } = await supabase
          .from("social_campaigns")
          .select("min_posts_for_badge")
          .eq("id", campaign_id)
          .single()

        if (approvedCount && campaign && approvedCount >= campaign.min_posts_for_badge) {
          // Check if user already has this badge
          const { data: userProfile } = await supabase.from("user_profiles").select("badges").eq("id", user_id).single()

          if (userProfile && !userProfile.badges.includes(badgeReward)) {
            // Award badge
            const { error: badgeError } = await supabase
              .from("user_profiles")
              .update({
                badges: [...userProfile.badges, badgeReward],
              })
              .eq("id", user_id)

            if (!badgeError) {
              badgeUnlocked = true
              badgeName = badgeReward.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      auto_approved: autoApprove,
      xp_awarded: autoApprove ? xpReward : 0,
      badge_unlocked: badgeUnlocked,
      badge_name: badgeName,
      confidence_score: confidenceScore,
      hashtags_found: hashtags,
      submission_id: socialProof.id,
    })
  } catch (error) {
    console.error("Error in POST /api/social-proofs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
