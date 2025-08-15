export interface MakeWebhookPayload {
  type: "message" | "tts" | "gift_search" | "feature_usage"
  data: Record<string, any>
  userId: string
  timestamp: string
}

import { env } from "@/lib/env.server"

export async function triggerMakeWebhook(
  type: MakeWebhookPayload["type"],
  data: Record<string, any>,
  userId?: string,
): Promise<void> {
  const webhookUrl = env.MAKE_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn("MAKE_WEBHOOK_URL not configured, skipping webhook trigger")
    return
  }

  const payload: MakeWebhookPayload = {
    type,
    data,
    userId: userId || "system",
    timestamp: new Date().toISOString(),
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AgentGift-BFF/1.0",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Make webhook failed: ${response.status} ${response.statusText}`)
    }

    console.log(`Make webhook triggered successfully for ${type}`)
  } catch (error) {
    console.error(`Failed to trigger Make webhook for ${type}:`, error)
    // Don't throw - webhook failures shouldn't break the main flow
  }
}

export async function triggerGiftSearchWebhook(searchQuery: string, userId: string): Promise<void> {
  return triggerMakeWebhook("gift_search", { query: searchQuery }, userId)
}

export async function triggerFeatureUsageWebhook(
  featureId: string,
  userId: string,
  metadata?: Record<string, any>,
): Promise<void> {
  return triggerMakeWebhook("feature_usage", { featureId, metadata }, userId)
}
