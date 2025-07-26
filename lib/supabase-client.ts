// lib/supabase.ts

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

/**
 * Fetch all available AgentVoice personas from the `agent_voices` table.
 * Returns: Array of voice metadata (name, tone, animation file, etc.)
 */
export async function fetchAgentVoices() {
  const { data, error } = await supabase
    .from("agent_voices")
    .select("*")
    .order("voice_name")

  if (error) {
    console.error("❌ Error fetching agent voices:", error.message)
    return []
  }

  return data
}
