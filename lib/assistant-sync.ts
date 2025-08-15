"use server"

import { env } from "@/lib/env.server"
import { createClient } from "@/lib/supabase-client"
import { AGENTGIFT_ASSISTANTS, type AssistantSyncData } from "@/lib/assistant-registry"

export const syncAssistantsToRegistry = async (assistants?: AssistantSyncData[]): Promise<any> => {
  try {
    const supabase = createClient()

    const assistantsToSync = assistants || AGENTGIFT_ASSISTANTS

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured")
    }

    const projectId = supabaseUrl.replace("https://", "").split(".")[0]
    const edgeFunctionUrl = `https://${projectId}.functions.supabase.co/sync_assistants`

    console.log("[AGAI SYNC] Starting assistant registry sync...", {
      assistants_count: assistantsToSync.length,
      edge_function_url: edgeFunctionUrl,
    })

    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(assistantsToSync),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("[AGAI SYNC ERROR]", result.error)
      throw new Error(`Assistant sync failed: ${result.error}`)
    }

    console.log("[AGAI SYNC SUCCESS]", {
      synced_count: result.synced_count,
      error_count: result.error_count,
      timestamp: result.timestamp,
    })

    if (result.errors && result.errors.length > 0) {
      console.warn("[AGAI SYNC WARNINGS]", result.errors)
    }

    return result
  } catch (error) {
    console.error("[AGAI SYNC ERROR]", error)
    throw error
  }
}

export const fetchAssistantRegistry = async (): Promise<any> => {
  try {
    const supabase = createClient()

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured")
    }

    const projectId = supabaseUrl.replace("https://", "").split(".")[0]
    const edgeFunctionUrl = `https://${projectId}.functions.supabase.co/sync_assistants`

    const response = await fetch(edgeFunctionUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Failed to fetch assistant registry: ${result.error}`)
    }

    return result
  } catch (error) {
    console.error("[AGAI FETCH ERROR]", error)
    throw error
  }
}
