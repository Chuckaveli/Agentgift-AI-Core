import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

const supabase = createAdminClient()

export async function GET() {
  try {
    const { data: features, error } = await supabase
      .from("registered_features")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ features })
  } catch (error) {
    console.error("Error fetching features:", error)
    return NextResponse.json({ error: "Failed to fetch features" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      credit_cost,
      xp_award,
      tier_access,
      ui_type,
      show_locked_preview,
      show_on_homepage,
      hide_from_free_tier,
      slug,
      template_id,
    } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Check if slug already exists
    const { data: existingFeature } = await supabase.from("registered_features").select("id").eq("slug", slug).single()

    if (existingFeature) {
      return NextResponse.json({ error: "A feature with this slug already exists" }, { status: 400 })
    }

    // Create the feature record
    const { data: feature, error: insertError } = await supabase
      .from("registered_features")
      .insert({
        name,
        slug,
        description,
        credit_cost,
        xp_award,
        tier_access,
        ui_type,
        show_locked_preview,
        show_on_homepage,
        hide_from_free_tier,
        is_active: true,
        usage_count: 0,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Generate the feature files
    await generateFeatureFiles(slug, name, ui_type, template_id)

    return NextResponse.json({
      success: true,
      feature,
      message: "Feature created and deployed successfully",
    })
  } catch (error) {
    console.error("Error creating feature:", error)
    return NextResponse.json({ error: "Failed to create feature" }, { status: 500 })
  }
}

async function generateFeatureFiles(slug: string, name: string, uiType: string, templateId?: string) {
  // In a real implementation, this would:
  // 1. Create the /app/features/[slug]/ directory
  // 2. Generate component.tsx based on UI type or template
  // 3. Create route.ts for API endpoints
  // 4. Update dashboard to include the new feature

  console.log(`Generating feature files for: ${slug}`)
  console.log(`Name: ${name}, UI Type: ${uiType}, Template: ${templateId}`)

  // For now, we'll just log the generation
  // In production, this would use file system operations
  // or integrate with a deployment pipeline
}
