import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Webhook URL for Make.com integration
const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL || ""

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const emotion = searchParams.get("emotion")
    const context = searchParams.get("context")
    const source = searchParams.get("source")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const minConfidence = searchParams.get("minConfidence")
      ? Number.parseFloat(searchParams.get("minConfidence") || "0")
      : null

    // Build query
    let query = supabase
      .from("emotional_signatures")
      .select(`
        id,
        timestamp,
        source_label,
        sender_email,
        parsed_emotion,
        confidence_score,
        context_label,
        summary_snippet,
        raw_content,
        suggested_action,
        priority_level,
        processed,
        webhook_sent
      `)
      .order("timestamp", { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    // Apply filters if provided
    if (emotion) query = query.eq("parsed_emotion", emotion)
    if (context) query = query.eq("context_label", context)
    if (source) query = query.eq("source_label", source)
    if (startDate) query = query.gte("timestamp", startDate)
    if (endDate) query = query.lte("timestamp", endDate)
    if (minConfidence) query = query.gte("confidence_score", minConfidence)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching emotional signatures:", error)
      return NextResponse.json({ error: "Failed to fetch emotional signatures" }, { status: 500 })
    }

    return NextResponse.json({
      data,
      count,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Unexpected error in emotional signatures API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { source_label, sender_email, parsed_emotion, confidence_score, context_label, summary_snippet } = body

    if (
      !source_label ||
      !sender_email ||
      !parsed_emotion ||
      confidence_score === undefined ||
      !context_label ||
      !summary_snippet
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert new emotional signature
    const { data: signatureData, error: signatureError } = await supabase
      .from("emotional_signatures")
      .insert({
        source_label,
        sender_email,
        parsed_emotion,
        confidence_score,
        context_label,
        summary_snippet,
        raw_content: body.raw_content || null,
        suggested_action: body.suggested_action || null,
        priority_level: body.priority_level || "medium",
        context_metadata: body.context_metadata || null,
        webhook_payload: body,
      })
      .select("id, timestamp")
      .single()

    if (signatureError) {
      console.error("Error creating emotional signature:", signatureError)
      return NextResponse.json({ error: "Failed to create emotional signature" }, { status: 500 })
    }

    // Determine suggested action based on emotion and context
    let actionType = "none"
    let actionDetails = null

    if (parsed_emotion === "Grief" || parsed_emotion === "Anxiety" || parsed_emotion === "Sadness") {
      if (confidence_score >= 75) {
        actionType = "route_to_lumience"
        actionDetails = `High confidence ${parsed_emotion.toLowerCase()} detection requires empathetic response. Routing to LUMIENCE™ for personalized comfort gift recommendation.`
      }
    } else if (parsed_emotion === "Joy" || parsed_emotion === "Love" || parsed_emotion === "Excitement") {
      if (confidence_score >= 80) {
        actionType = "flag_for_bondcraft"
        actionDetails = `High ${parsed_emotion.toLowerCase()} detection around ${context_label.toLowerCase()} context. Perfect opportunity for BondCraft™ ritual suggestion to enhance celebration.`
      }
    }

    if (context_label === "Breakup" || context_label === "Illness" || context_label === "Loss") {
      actionType = "sync_to_gift_loop"
      actionDetails = `${context_label} context detected. Adding to Just-Because Gift Loop for timely comfort gift suggestion.`
    }

    // Update the signature with suggested action if determined
    if (actionType !== "none") {
      await supabase
        .from("emotional_signatures")
        .update({
          suggested_action: actionDetails,
        })
        .eq("id", signatureData.id)
    }

    // Send webhook to Make.com if URL is configured
    if (makeWebhookUrl) {
      try {
        const webhookPayload = {
          event: "new_emotional_signature",
          data: {
            id: signatureData.id,
            timestamp: signatureData.timestamp,
            source: source_label,
            email: sender_email,
            emotion: parsed_emotion,
            confidence: confidence_score,
            context: context_label,
            summary: summary_snippet,
            suggested_action:
              actionType !== "none"
                ? {
                    type: actionType,
                    details: actionDetails,
                  }
                : null,
          },
        }

        const webhookResponse = await fetch(makeWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-AgentGift-Source": "emotional-signature-engine",
          },
          body: JSON.stringify(webhookPayload),
        })

        // Log webhook result
        await supabase.from("integration_logs").insert({
          integration_type: "make_com",
          action_type: "webhook_sent",
          emotional_signature_id: signatureData.id,
          request_payload: webhookPayload,
          response_payload: {
            status: webhookResponse.status,
            body: await webhookResponse.text(),
          },
          status: webhookResponse.ok ? "success" : "failed",
          execution_time_ms: 0,
        })

        // Update signature webhook status
        await supabase
          .from("emotional_signatures")
          .update({
            webhook_sent: true,
            processed: webhookResponse.ok,
          })
          .eq("id", signatureData.id)
      } catch (webhookError) {
        console.error("Error sending webhook:", webhookError)

        // Log webhook failure
        await supabase.from("integration_logs").insert({
          integration_type: "make_com",
          action_type: "webhook_sent",
          emotional_signature_id: signatureData.id,
          request_payload: { event: "new_emotional_signature", signature_id: signatureData.id },
          status: "failed",
          error_message: String(webhookError),
          execution_time_ms: 0,
        })
      }
    }

    return NextResponse.json({
      success: true,
      id: signatureData.id,
      suggested_action:
        actionType !== "none"
          ? {
              type: actionType,
              details: actionDetails,
            }
          : null,
    })
  } catch (error) {
    console.error("Unexpected error in emotional signatures API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Missing signature ID" }, { status: 400 })
    }

    // Update emotional signature
    const { data, error } = await supabase
      .from("emotional_signatures")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating emotional signature:", error)
      return NextResponse.json({ error: "Failed to update emotional signature" }, { status: 500 })
    }

    // Log the manual update
    await supabase.from("integration_logs").insert({
      integration_type: "supabase",
      action_type: "manual_override",
      emotional_signature_id: id,
      request_payload: updates,
      status: "success",
    })

    // Send webhook to Make.com if URL is configured and there's a change in suggested action
    if (makeWebhookUrl && updates.suggested_action) {
      try {
        const webhookPayload = {
          event: "signature_updated",
          data: {
            id,
            updates,
            updated_at: new Date().toISOString(),
          },
        }

        const webhookResponse = await fetch(makeWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-AgentGift-Source": "emotional-signature-engine",
            "X-AgentGift-Action": "manual_update",
          },
          body: JSON.stringify(webhookPayload),
        })

        // Log webhook result
        await supabase.from("integration_logs").insert({
          integration_type: "make_com",
          action_type: "webhook_sent",
          emotional_signature_id: id,
          request_payload: webhookPayload,
          response_payload: {
            status: webhookResponse.status,
            body: await webhookResponse.text(),
          },
          status: webhookResponse.ok ? "success" : "failed",
          execution_time_ms: 0,
        })
      } catch (webhookError) {
        console.error("Error sending webhook:", webhookError)

        // Log webhook failure
        await supabase.from("integration_logs").insert({
          integration_type: "make_com",
          action_type: "webhook_sent",
          emotional_signature_id: id,
          request_payload: { event: "signature_updated", signature_id: id },
          status: "failed",
          error_message: String(webhookError),
          execution_time_ms: 0,
        })
      }
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Unexpected error in emotional signatures API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing signature ID" }, { status: 400 })
    }

    // Delete emotional signature
    const { error } = await supabase.from("emotional_signatures").delete().eq("id", id)

    if (error) {
      console.error("Error deleting emotional signature:", error)
      return NextResponse.json({ error: "Failed to delete emotional signature" }, { status: 500 })
    }

    // Log the deletion
    await supabase.from("integration_logs").insert({
      integration_type: "supabase",
      action_type: "delete_signature",
      emotional_signature_id: id,
      status: "success",
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Unexpected error in emotional signatures API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
