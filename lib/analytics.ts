interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  userId?: string
  sessionId?: string
  timestamp?: string
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
    const eventData: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
        timestamp: new Date().toISOString(),
      },
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    }

    // Send to multiple providers
    await Promise.allSettled([
      this.sendToMake(eventData),
      this.sendToSupabase(eventData),
      this.sendToConsole(eventData),
    ])
  }

  private async sendToMake(eventData: AnalyticsEvent) {
    try {
      if (!process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL) return

      await fetch("/api/analytics/make", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })
    } catch (error) {
      console.error("Make analytics error:", error)
    }
  }

  private async sendToSupabase(eventData: AnalyticsEvent) {
    try {
      await fetch("/api/analytics/supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })
    } catch (error) {
      console.error("Supabase analytics error:", error)
    }
  }

  private sendToConsole(eventData: AnalyticsEvent) {
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Analytics Event:", eventData)
    }
  }

  // Conversion funnel tracking methods
  async trackLandingPageView(utmParams?: Record<string, string>) {
    await this.track("landing_page_view", {
      page: "landing",
      utm_source: utmParams?.utm_source,
      utm_medium: utmParams?.utm_medium,
      utm_campaign: utmParams?.utm_campaign,
      referrer: typeof window !== "undefined" ? document.referrer : "",
    })
  }

  async trackQuestionnaireStarted() {
    await this.track("questionnaire_started", {
      step: "modal_opened",
    })
  }

  async trackQuestionnaireStep(step: number, data: Record<string, any>) {
    await this.track("questionnaire_step", {
      step,
      step_data: data,
    })
  }

  async trackQuestionnaireCompleted(results: Record<string, any>) {
    await this.track("questionnaire_completed", {
      results,
      completion_time: Date.now(),
    })
  }

  async trackCTAClicked(source: string) {
    await this.track("cta_clicked", {
      source,
      button_text: "Get My Gift Recommendations",
    })
  }

  async trackAuthPageView(view: "signin" | "signup", context?: Record<string, any>) {
    await this.track("auth_page_view", {
      view,
      context,
    })
  }

  async trackSignupStarted() {
    await this.track("signup_started", {
      method: "form_interaction",
    })
  }

  async trackSignupCompleted(method: string) {
    await this.track("signup_completed", {
      method,
      completion_time: Date.now(),
    })
  }

  async trackDashboardArrived(isNewUser = false) {
    await this.track("dashboard_arrived", {
      is_new_user: isNewUser,
      arrival_time: Date.now(),
    })
  }

  async trackFeatureClick(feature: string, location: string) {
    await this.track("feature_click", {
      feature,
      location,
    })
  }
}

// Singleton instance
export const analytics = new Analytics()
