"use client"

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp?: string
  session_id?: string
  user_id?: string
}

class Analytics {
  private sessionId: string
  private userId: string | null = null

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async track(event: string, properties: Record<string, any> = {}) {
    const eventData: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: typeof window !== "undefined" ? window.location.href : "",
        referrer: typeof window !== "undefined" ? document.referrer : "",
        user_agent: typeof window !== "undefined" ? navigator.userAgent : "",
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.userId,
    }

    // Console logging for debugging
    console.log("Analytics Event:", eventData)

    // Send to multiple providers
    await Promise.allSettled([this.sendToMake(eventData), this.sendToSupabase(eventData)])
  }

  async trackSignupStart(method: string) {
    await this.track("signup_started", {
      method,
      conversion_step: "signup_start",
    })
  }

  async trackSignupComplete(userId: string, method: string) {
    this.userId = userId
    await this.track("signup_completed", {
      method,
      user_id: userId,
      conversion_step: "signup_complete",
    })
  }

  async trackDashboardArrival(isNewUser = false) {
    await this.track("dashboard_arrived", {
      is_new_user: isNewUser,
      conversion_step: "dashboard_arrival",
    })
  }

  private async sendToMake(eventData: AnalyticsEvent) {
    try {
      const response = await fetch("/api/analytics/make", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error(`Make.com webhook failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Make.com analytics error:", error)
    }
  }

  private async sendToSupabase(eventData: AnalyticsEvent) {
    try {
      const response = await fetch("/api/analytics/supabase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error(`Supabase analytics failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Supabase analytics error:", error)
    }
  }
}

// Export singleton instance
export const analytics = new Analytics()

// Hook for React components
export function useAnalytics() {
  return analytics
}
