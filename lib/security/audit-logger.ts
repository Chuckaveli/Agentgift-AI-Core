import { createClient } from "@/lib/supabase-server"

export interface AuditLogEntry {
  event: string
  actor: string
  target?: string
  ip: string
  userAgent: string
  success: boolean
  metadata?: Record<string, any>
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createClient()

    await supabase.from("audit_logs").insert({
      event: entry.event,
      actor: entry.actor,
      target: entry.target,
      ip: entry.ip,
      user_agent: entry.userAgent,
      success: entry.success,
      metadata: entry.metadata,
      created_at: new Date().toISOString(),
    })

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Audit Log]", entry)
    }

    // Send critical events to monitoring service
    if (isCriticalEvent(entry.event)) {
      await sendSecurityAlert(entry)
    }
  } catch (error) {
    console.error("Failed to log audit event:", error)
  }
}

function isCriticalEvent(event: string): boolean {
  const criticalEvents = [
    "admin.user.delete",
    "admin.config.change",
    "auth.failed.multiple",
    "data.export",
    "permission.escalation",
  ]

  return criticalEvents.some((critical) => event.startsWith(critical))
}

async function sendSecurityAlert(entry: AuditLogEntry): Promise<void> {
  // Send to Discord webhook
  if (process.env.DISCORD_SECURITY_WEBHOOK) {
    try {
      await fetch(process.env.DISCORD_SECURITY_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🚨 **Security Alert**\n\`\`\`json\n${JSON.stringify(entry, null, 2)}\n\`\`\``,
        }),
      })
    } catch (error) {
      console.error("Failed to send security alert:", error)
    }
  }
}

// Helper to get request metadata
export function getRequestMetadata(req: Request): {
  ip: string
  userAgent: string
} {
  const forwarded = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIp || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"

  return { ip, userAgent }
}
