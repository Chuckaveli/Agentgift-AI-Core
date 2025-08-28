// lib/assistants/telemetry.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server only
)

type Meta = Record<string, any>

export async function trackAssistantRun(
  assistantId: string,
  userId: string | null,
  status: 'success' | 'error' | 'timeout' | 'rate_limited',
  latencyMs?: number,
  meta: Meta = {}
) {
  await supabase.rpc('log_assistant_interaction', {
    p_user_id: userId,
    p_assistant_id: assistantId,
    p_status: status,
    p_latency_ms: latencyMs ?? null,
    p_meta: meta
  })
  await supabase.rpc('assistant_heartbeat', { p_assistant_id: assistantId })
}
