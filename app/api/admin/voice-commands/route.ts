import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withAdmin } from '@/lib/with-admin';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function __orig_POST(request: NextRequest) {
  try {
    const { command } = await request.json()

    // Log the voice command
    const { data: voiceLog } = await supabase
      .from("voice_commands")
      .insert({
        admin_id: "admin-user-id", // In real app, get from auth
        command_text: command,
        execution_status: "pending",
      })
      .select()
      .single()

    // Parse the command using simple pattern matching
    const parsedIntent = parseVoiceCommand(command)

    if (parsedIntent.type === "create_feature") {
      try {
        // Generate slug from feature name
        const slug = parsedIntent.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")

        // Create the feature
        const { data: feature, error: createError } = await supabase
          .from("registered_features")
          .insert({
            name: parsedIntent.name,
            slug,
            description: parsedIntent.description || `AI-generated feature: ${parsedIntent.name}`,
            credit_cost: parsedIntent.creditCost || 1,
            xp_award: parsedIntent.xpAward || 25,
            tier_access: ["premium_spy"],
            ui_type: parsedIntent.uiType || "modal",
            is_active: true,
            usage_count: 0,
          })
          .select()
          .single()

        if (createError) throw createError

        // Update voice command status
        await supabase
          .from("voice_commands")
          .update({
            execution_status: "success",
            feature_created: slug,
            parsed_intent: parsedIntent,
          })
          .eq("id", voiceLog?.id)

        return NextResponse.json({
          success: true,
          message: `Feature "${parsedIntent.name}" created successfully!`,
          feature,
        })
      } catch (error) {
        // Update voice command with error
        await supabase
          .from("voice_commands")
          .update({
            execution_status: "failed",
            error_message: error instanceof Error ? error.message : "Unknown error",
          })
          .eq("id", voiceLog?.id)

        throw error
      }
    } else {
      await supabase
        .from("voice_commands")
        .update({
          execution_status: "failed",
          error_message: "Command not recognized",
        })
        .eq("id", voiceLog?.id)

      return NextResponse.json({
        success: false,
        message:
          "Sorry, I didn't understand that command. Try saying something like 'Create a new feature called Gift Timeline'",
      })
    }
  } catch (error) {
    console.error("Error processing voice command:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process voice command",
      },
      { status: 500 },
    )
  }
}

function parseVoiceCommand(command: string) {
  const lowerCommand = command.toLowerCase()

  // Pattern: "Create a new feature called [NAME]"
  const createFeatureMatch = lowerCommand.match(/create.*?feature.*?called\s+(.+?)(?:\.|$|that|which|it)/i)

  if (createFeatureMatch) {
    const name = createFeatureMatch[1].trim()

    // Extract additional parameters
    const modalMatch = lowerCommand.includes("modal")
    const quizMatch = lowerCommand.includes("quiz")
    const formMatch = lowerCommand.includes("form")

    const creditMatch = lowerCommand.match(/(\d+)\s*credits?/)
    const xpMatch = lowerCommand.match(/(\d+)\s*xp/)

    return {
      type: "create_feature",
      name: name.charAt(0).toUpperCase() + name.slice(1),
      uiType: modalMatch ? "modal" : quizMatch ? "quiz" : formMatch ? "form" : "tile",
      creditCost: creditMatch ? Number.parseInt(creditMatch[1]) : 1,
      xpAward: xpMatch ? Number.parseInt(xpMatch[1]) : 25,
      description: `Voice-generated feature: ${name}`,
    }
  }

  return { type: "unknown" }
}

const __orig_POST = withAdmin(__orig_POST);
export const POST = withAdmin(__orig_POST);
/* ADMIN_GUARDED */
