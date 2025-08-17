export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  userId?: string
  timestamp?: string
}

export interface ConversionEvent {
  step:
    | "questionnaire_started"
    | "questionnaire_completed"
    | "cta_clicked"
    | "signup_started"
    | "signup_completed"
    | "dashboard_arrived"
    | "onboarding_completed"
  userId?: string
  sessionId?: string
  metadata?: Record<string, any>
}

class Analytics {
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  async track(event: string, properties: Record<string, any> = {}) {
    const payload: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : undefined,
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      },
      userId: this.userId,
      timestamp: new Date().toISOString(),
    }

    // Send to multiple analytics providers
    await Promise.allSettled([this.sendToMake(payload), this.sendToSupabase(payload), this.sendToConsole(payload)])
  }

  async trackConversion(step: ConversionEvent["step"], metadata: Record<string, any> = {}) {
    const conversionEvent: ConversionEvent = {
      step,
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    }

    await this.track("conversion_funnel", {
      conversion_step: step,
      ...conversionEvent,
    })

    // Special handling for key conversion events
    switch (step) {
      case "signup_completed":
        await this.track("signup_success", metadata)
        break
      case "dashboard_arrived":
        await this.track("onboarding_complete", metadata)
        break
      case "cta_clicked":
        await this.track("cta_conversion", metadata)
        break
    }
  }

  private async sendToMake(payload: AnalyticsEvent) {
    try {
      await fetch("/api/analytics/make", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error("Failed to send analytics to Make:", error)
    }
  }

  private async sendToSupabase(payload: AnalyticsEvent) {
    try {
      await fetch("/api/analytics/supabase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error("Failed to send analytics to Supabase:", error)
    }
  }

  private sendToConsole(payload: AnalyticsEvent) {
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Analytics Event:", payload)
    }
  }

  // Questionnaire specific tracking
  async trackQuestionnaireStep(step: number, data: Record<string, any>) {
    await this.track("questionnaire_step", {
      step,
      ...data,
    })
  }

  async trackQuestionnaireComplete(results: Record<string, any>) {
    await this.trackConversion("questionnaire_completed", results)
  }

  async trackCTAClick(source: string, metadata: Record<string, any> = {}) {
    await this.trackConversion("cta_clicked", {
      source,
      ...metadata,
    })
  }

  async trackSignupStart(method: string) {
    await this.trackConversion("signup_started", {
      signup_method: method,
    })
  }

  async trackSignupComplete(userId: string, method: string) {
    this.setUserId(userId)
    await this.trackConversion("signup_completed", {
      userId,
      signup_method: method,
    })
  }

  async trackDashboardArrival(isNewUser: boolean, metadata: Record<string, any> = {}) {
    await this.trackConversion("dashboard_arrived", {
      is_new_user: isNewUser,
      ...metadata,
    })
  }
}

// Singleton instance
export const analytics = new Analytics()

// React hook for analytics
export function useAnalytics() {
  return analytics
}
