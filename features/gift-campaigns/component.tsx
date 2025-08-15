"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { TIERS, type UserTier } from "@/lib/global-logic"

interface CampaignTemplate {
  id: string
  name: string
  description: string
  type: string
  steps: CampaignStep[]
  requiredFeatures: string[]
  moodTags: string[]
  difficultyLevel: "beginner" | "intermediate" | "advanced"
  estimatedCostRange: string
  durationDays: number
  xpReward: number
  requiredTier: UserTier
  isPremium: boolean
}

interface CampaignStep {
  day: number
  title: string
  description: string
  features: string[]
}

interface UserCampaign {
  id: string
  campaignTemplateId: string
  currentStep: number
  progressData: Record<string, any>
  status: "active" | "paused" | "completed" | "abandoned"
  startedAt: Date
  completedAt?: Date
  notes?: string
}

interface GiftCampaignsProps {
  userTier: UserTier
  userId: string
  userCredits: number
  onCreditsUpdate: (credits: number) => void
}

const campaignTemplates: CampaignTemplate[] = [
  {
    id: "love-language-journey",
    name: "Love Language Journey",
    description: "A 5-day personalized gift experience based on your partner's love language",
    type: "love_language",
    steps: [
      {
        day: 1,
        title: "Discover Their Language",
        description: "Take the love language quiz together",
        features: ["gift-dna-quiz"],
      },
      {
        day: 2,
        title: "Words of Affirmation",
        description: "Create a personalized message reveal",
        features: ["gift-reveal-viewer"],
      },
      { day: 3, title: "Quality Time", description: "Plan a shared experience", features: ["emotion-tags"] },
      { day: 4, title: "Physical Touch", description: "Something cozy and comforting", features: ["agent-gifty"] },
      {
        day: 5,
        title: "Acts of Service",
        description: "Do something meaningful for them",
        features: ["reminder-scheduler"],
      },
    ],
    requiredFeatures: ["gift-dna-quiz", "gift-reveal-viewer"],
    moodTags: [],
    difficultyLevel: "beginner",
    estimatedCostRange: "",
    durationDays: 5,
    xpReward: 0,
    requiredTier: TIERS.BEGINNER,
    isPremium: false,
  },
]

// ** rest of code here **

