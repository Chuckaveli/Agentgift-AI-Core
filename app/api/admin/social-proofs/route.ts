import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "demo-key",
)

export async function GET(request: NextRequest) {
  try {
    // Fetch all social proof submissions with user details
    const { data: submissions, error } = await supabase
      .from("social_proofs")
      .select(`
        *,
        user_profiles!inner(
          id,
          name,
          email
        )
      `)
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Error fetching submissions:", error)
      return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
    }

    // Transform data for admin panel
    const transformedSubmissions = submissions.map((submission) => ({
      ...submission,
      user_name: submission.user_profiles.name,
      user_email: submission.user_profiles.email,
    }))

    return NextResponse.json({ submissions: transformedSubmissions })
  } catch (error) {
    console.error("Error in GET /api/admin/social-proofs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { submission_id, action, admin_notes, admin_user_id } = body

    if (!submission_id || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    // Get submission details
    const { data: submission, error: fetchError } = await supabase
      .from("social_proofs")
      .select("*")
      .eq("id", submission_id)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    const newStatus = action === "approve" ? "approved" : "rejected"
    const xpToAward = action === "approve" ? 25 : 0

    // Update submission status
    const { error: updateError } = await supabase
      .from("social_proofs")
      .update({
        status: newStatus,
        xp_awarded: xpToAward,
        admin_notes,
        reviewed_by: admin_user_id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submission_id)

    if (updateError) {
      console.error("Error updating submission:", updateError)
      return NextResponse.json({ error: "Failed to update submission" }, { status: 500 })
    }

    // If approved, award XP to user
    if (action === "approve" && xpToAward > 0) {
      const { error: xpError } = await supabase.rpc("add_user_xp", {
        user_id: submission.user_id,
        xp_amount: xpToAward,
        reason: `Social media post approved: ${submission.platform}`,
      })

      if (xpError) {
        console.error("Error adding XP:", xpError)
      }

      // Check for badge unlock based on approved posts count
      const { data: approvedCount } = await supabase
        .from("social_proofs")
        .select("id", { count: "exact" })
        .eq("user_id", submission.user_id)
        .eq("status", "approved")

      // Award seasonal badge after 3 approved posts
      if (approvedCount && approvedCount >= 3) {
        const { data: userProfile } = await supabase
          .from("user_profiles")
          .select("badges")
          .eq("id", submission.user_id)
          .single()

        const seasonalBadge = "social_media_hero"

        if (userProfile && !userProfile.badges.includes(seasonalBadge)) {
          await supabase
            .from("user_profiles")
            .update({
              badges: [...userProfile.badges, seasonalBadge],
            })
            .eq("id", submission.user_id)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Submission ${action}d successfully`,
      xp_awarded: xpToAward,
    })
  } catch (error) {
    console.error("Error in PATCH /api/admin/social-proofs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
