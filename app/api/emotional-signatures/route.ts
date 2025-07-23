import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Make.com webhook endpoints for different triggers
const WEBHOOK_ENDPOINTS = {
  grief: "https://hook.make.com/agentgift-grief-trigger",
  joy: "https://hook.make.com/agentgift-joy-trigger",
  anxiety: "https://hook.make.com/agentgift-anxiety-trigger",
  general: "https://hook.make.com/agentgift-emotional-signature",
}

// Emotional signature processing logic
async function processEmotionalSignature(data: any) {
  try {
    // Insert into Supabase
    const { data: signature, error } = await supabase
      .from("emotional_signatures")
      .insert({
        source_type: data.source || "api",
        source_label: data.source_label,
        sender_email: data.sender_email,
        raw_content: data.raw_content,
        parsed_emotion: data.parsed_emotion,
        confidence_score: data.confidence_score,
        context_label: data.context_label,
        context_metadata: data.context_metadata,
        summary_snippet: data.summary_snippet,
        suggested_action: data.suggested_action,
        priority_level: data.priority_level || "medium",
        webhook_payload: data,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase insert error:", error)
      return { success: false, error: error.message }
    }

    // Determine webhook endpoint based on emotion and priority
    let webhookUrl = WEBHOOK_ENDPOINTS.general
    const emotion = data.parsed_emotion?.toLowerCase()
    const priority = data.priority_level
    const confidence = data.confidence_score

    if (emotion === "grief" && confidence >= 85) {
      webhookUrl = WEBHOOK_ENDPOINTS.grief
    } else if (emotion === "joy" && confidence >= 80) {
      webhookUrl = WEBHOOK_ENDPOINTS.joy
    } else if (emotion === "anxiety" && confidence >= 70) {
      webhookUrl = WEBHOOK_ENDPOINTS.anxiety
    }

    // Send to Make.com webhook
    const webhookPayload = {
      emotional_signature_id: signature.id,
      timestamp: signature.timestamp,
      source: signature.source_type,
      sender_email: signature.sender_email,
      emotion: signature.parsed_emotion,
      confidence: signature.confidence_score,
      context: signature.context_label,
      summary: signature.summary_snippet,
      suggested_action: signature.suggested_action,
      priority: signature.priority_level,
      integration_triggers: {
        lumience: signature.suggested_action?.includes("LUMIENCE") || false,
        bondcraft: signature.suggested_action?.includes("BondCraft") || false,
        gift_loop: signature.suggested_action?.includes("Gift Loop") || false,
      },
    }

    // Log the webhook attempt
    const webhookStart = Date.now()

    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AgentGift-Source": "emotional-signature-engine",
        },
        body: JSON.stringify(webhookPayload),
      })

      const executionTime = Date.now() - webhookStart
      const responseData = await webhookResponse.text()

      // Log the integration attempt
      await supabase.from("integration_logs").insert({
        integration_type: "make_com",
        action_type: "webhook_sent",
        emotional_signature_id: signature.id,
        request_payload: webhookPayload,
        response_payload: { status: webhookResponse.status, body: responseData },
        status: webhookResponse.ok ? "success" : "failed",
        error_message: webhookResponse.ok ? null : `HTTP ${webhookResponse.status}: ${responseData}`,
        execution_time_ms: executionTime,
      })

      return {
        success: true,
        signature_id: signature.id,
        webhook_sent: webhookResponse.ok,
        webhook_status: webhookResponse.status,
      }
    } catch (webhookError) {
      console.error("Webhook error:", webhookError)

      // Log the failed webhook attempt
      await supabase.from("integration_logs").insert({
        integration_type: "make_com",
        action_type: "webhook_sent",
        emotional_signature_id: signature.id,
        request_payload: webhookPayload,
        status: "failed",
        error_message: webhookError.message,
        execution_time_ms: Date.now() - webhookStart,
      })

      return {
        success: true, // Signature was saved, webhook failed
        signature_id: signature.id,
        webhook_sent: false,
        webhook_error: webhookError.message,
      }
    }
  } catch (error) {
    console.error("Processing error:", error)
    return { success: false, error: error.message }
  }
}

// GET - Fetch emotional signatures with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const emotion = searchParams.get("emotion")
    const context = searchParams.get("context")
    const dateFilter = searchParams.get("date")

    let query = supabase
      .from("emotional_signatures")
      .select("*")
      .order("timestamp", { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (emotion && emotion !== "all") {
      query = query.eq("parsed_emotion", emotion)
    }

    if (context && context !== "all") {
      query = query.eq("context_label", context)
    }

    if (dateFilter && dateFilter !== "all") {
      const now = new Date()
      let startDate: Date

      switch (dateFilter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }

      query = query.gte("timestamp", startDate.toISOString())
    }

    const { data: signatures, error } = await query

    if (error) {
      console.error("Error fetching emotional signatures:", error)
      return NextResponse.json({ error: "Failed to fetch signatures" }, { status: 500 })
    }

    return NextResponse.json({ signatures: signatures || [] })
  } catch (error) {
    console.error("Error in emotional signatures API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new emotional signature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      source_label,
      sender_email,
      raw_content,
      parsed_emotion,
      confidence_score,
      context_label,
      summary_snippet,
      suggested_action,
      metadata,
    } = body

    // Validate required fields
    if (!source_label || !sender_email || !parsed_emotion || !context_label || !summary_snippet) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (confidence_score < 0 || confidence_score > 100) {
      return NextResponse.json({ error: "Confidence score must be between 0 and 100" }, { status: 400 })
    }

    // Insert new emotional signature
    const { data: signature, error: insertError } = await supabase
      .from("emotional_signatures")
      .insert({
        source_label,
        sender_email,
        raw_content,
        parsed_emotion,
        confidence_score,
        context_label,
        summary_snippet,
        suggested_action,
        metadata,
        processed: false,
        webhook_sent: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting emotional signature:", insertError)
      return NextResponse.json({ error: "Failed to create signature" }, { status: 500 })
    }

    // Send webhook to Make.com (async, don't wait for response)
    sendWebhookToMake(signature)

    // Update analytics
    await updateAnalytics(parsed_emotion, context_label, confidence_score)

    return NextResponse.json({ signature, success: true })
  } catch (error) {
    console.error("Error in emotional signatures POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendWebhookToMake(signature: any) {
  try {
    const webhookUrl = process.env.MAKE_WEBHOOK_URL
    if (!webhookUrl) {
      console.warn("Make.com webhook URL not configured")
      return
    }

    const payload = {
      signature_id: signature.id,
      timestamp: signature.timestamp,
      emotion: signature.parsed_emotion,
      context: signature.context_label,
      confidence: signature.confidence_score,
      sender_email: signature.sender_email,
      suggested_action: signature.suggested_action,
      summary: signature.summary_snippet,
      agentgift_routing: {
        system: getRoutingSystem(signature.context_label),
        priority: getContextPriority(signature.context_label),
        auto_trigger: signature.confidence_score >= 80,
      },
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()

    // Log webhook attempt
    await supabase.from("emotional_webhook_logs").insert({
      signature_id: signature.id,
      webhook_url: webhookUrl,
      payload,
      response_status: response.status,
      response_body: responseData,
      success: response.ok,
      retry_count: 0,
    })

    // Update signature webhook status
    await supabase
      .from("emotional_signatures")
      .update({
        webhook_sent: true,
        webhook_response: responseData,
        processed: response.ok,
      })
      .eq("id", signature.id)
  } catch (error) {
    console.error("Error sending webhook to Make.com:", error)

    // Log failed webhook
    await supabase.from("emotional_webhook_logs").insert({
      signature_id: signature.id,
      webhook_url: process.env.MAKE_WEBHOOK_URL || "",
      payload: { error: "Failed to send webhook" },
      response_status: 0,
      response_body: { error: error.message },
      success: false,
      retry_count: 0,
    })
  }
}

function getRoutingSystem(context: string): string {
  const routingMap: { [key: string]: string } = {
    Breakup: "LUMIENCE",
    Grief: "JUST_BECAUSE_LOOP",
    Anxiety: "LUMIENCE",
    Depression: "LUMIENCE",
    "Job Loss": "LUMIENCE",
    Graduation: "BONDCRAFT",
    Anniversary: "BONDCRAFT",
    Promotion: "BONDCRAFT",
    Birthday: "BONDCRAFT",
    Wedding: "BONDCRAFT",
    "New Baby": "BONDCRAFT",
    Celebration: "BONDCRAFT",
    Illness: "JUST_BECAUSE_LOOP",
    Moving: "JUST_BECAUSE_LOOP",
    Apology: "JUST_BECAUSE_LOOP",
  }

  return routingMap[context] || "GENERAL"
}

function getContextPriority(context: string): number {
  const priorityMap: { [key: string]: number } = {
    Breakup: 5,
    Grief: 5,
    Depression: 5,
    Anniversary: 4,
    Illness: 4,
    "Job Loss": 4,
    Wedding: 4,
    "New Baby": 4,
    Graduation: 3,
    Promotion: 3,
    Birthday: 3,
    Anxiety: 3,
    Apology: 3,
    Moving: 2,
    Celebration: 2,
  }

  return priorityMap[context] || 1
}

async function updateAnalytics(emotion: string, context: string, confidence: number) {
  try {
    const today = new Date().toISOString().split("T")[0]

    // Upsert analytics record
    await supabase.from("emotional_analytics").upsert(
      {
        date: today,
        emotion,
        context,
        count: 1,
        avg_confidence: confidence,
      },
      {
        onConflict: "date,emotion,context",
        ignoreDuplicates: false,
      },
    )
  } catch (error) {
    console.error("Error updating analytics:", error)
  }
}

// PUT - Update emotional signature (manual override)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Missing signature ID" }, { status: 400 })
    }

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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the manual override
    await supabase.from("integration_logs").insert({
      integration_type: "supabase",
      action_type: "manual_override",
      emotional_signature_id: id,
      request_payload: updates,
      status: "success",
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
