import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key",
)

export interface PersonaCulturalAdaptation {
  id: string
  persona_id: string
  locale: string
  cultural_tone: string
  intro_message: string
  gift_rationale_style: string
  voice_characteristics: {
    pace: "slow" | "medium" | "fast"
    formality: "casual" | "formal" | "respectful"
    emotion_level: "reserved" | "balanced" | "expressive"
    family_focus: boolean
    tradition_emphasis: boolean
  }
  cultural_context: {
    gift_giving_philosophy: string
    relationship_importance: string
    celebration_style: string
    respect_hierarchy: boolean
    group_vs_individual: "group" | "individual" | "balanced"
  }
  created_at: string
  updated_at: string
}

// Default cultural adaptations for personas
const DEFAULT_CULTURAL_ADAPTATIONS: Record<string, PersonaCulturalAdaptation[]> = {
  avelyn: [
    {
      id: "avelyn-en-us",
      persona_id: "avelyn",
      locale: "en-US",
      cultural_tone: "warm, direct, emotionally expressive",
      intro_message:
        "Hi there! I'm Avelyn, and I'm absolutely thrilled to help you find the perfect romantic gift! Let's make someone's heart skip a beat! 💕",
      gift_rationale_style: "emotion-forward with personal stories and romantic impact",
      voice_characteristics: {
        pace: "medium",
        formality: "casual",
        emotion_level: "expressive",
        family_focus: false,
        tradition_emphasis: false,
      },
      cultural_context: {
        gift_giving_philosophy: "Express your feelings boldly and authentically",
        relationship_importance: "Individual romantic connection is paramount",
        celebration_style: "Grand gestures and surprise moments",
        respect_hierarchy: false,
        group_vs_individual: "individual",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "avelyn-hi-in",
      persona_id: "avelyn",
      locale: "hi-IN",
      cultural_tone: "respectful, family-conscious, emotionally rich",
      intro_message:
        "Namaste! I'm Avelyn, and I understand the beautiful complexity of relationships in our culture. Let's find a gift that honors both your heart and your family's values! 🙏",
      gift_rationale_style: "family-inclusive with cultural sensitivity and tradition respect",
      voice_characteristics: {
        pace: "medium",
        formality: "respectful",
        emotion_level: "expressive",
        family_focus: true,
        tradition_emphasis: true,
      },
      cultural_context: {
        gift_giving_philosophy: "Honor relationships while respecting family and tradition",
        relationship_importance: "Balance individual love with family harmony",
        celebration_style: "Meaningful gestures that include extended family",
        respect_hierarchy: true,
        group_vs_individual: "balanced",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "avelyn-zh-cn",
      persona_id: "avelyn",
      locale: "zh-CN",
      cultural_tone: "thoughtful, symbolic, harmonious",
      intro_message:
        "你好! I'm Avelyn, and I believe in the power of meaningful symbols in love. Let's find a gift that speaks through thoughtful gestures and lasting significance! 🌸",
      gift_rationale_style: "symbolic meaning with long-term relationship harmony focus",
      voice_characteristics: {
        pace: "slow",
        formality: "respectful",
        emotion_level: "balanced",
        family_focus: true,
        tradition_emphasis: true,
      },
      cultural_context: {
        gift_giving_philosophy: "Gifts should symbolize lasting commitment and harmony",
        relationship_importance: "Relationships build family legacy and social harmony",
        celebration_style: "Thoughtful, symbolic gestures with deep meaning",
        respect_hierarchy: true,
        group_vs_individual: "group",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  galen: [
    {
      id: "galen-en-us",
      persona_id: "galen",
      locale: "en-US",
      cultural_tone: "confident, innovative, results-focused",
      intro_message:
        "Hey! I'm Galen, your tech-savvy gift strategist. Ready to blow their mind with some cutting-edge innovation? Let's find something that'll make them say 'wow!' 🚀",
      gift_rationale_style: "feature-focused with innovation impact and practical benefits",
      voice_characteristics: {
        pace: "fast",
        formality: "casual",
        emotion_level: "balanced",
        family_focus: false,
        tradition_emphasis: false,
      },
      cultural_context: {
        gift_giving_philosophy: "Innovation and functionality create lasting value",
        relationship_importance: "Shared interests and future-building together",
        celebration_style: "Surprise with the latest and greatest technology",
        respect_hierarchy: false,
        group_vs_individual: "individual",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "galen-zh-cn",
      persona_id: "galen",
      locale: "zh-CN",
      cultural_tone: "respectful, precision-focused, quality-conscious",
      intro_message:
        "您好! I'm Galen, and I believe technology should enhance life's important moments. Let's find something innovative yet meaningful for your special person! 🎯",
      gift_rationale_style: "quality-focused with long-term value and family benefit emphasis",
      voice_characteristics: {
        pace: "medium",
        formality: "respectful",
        emotion_level: "reserved",
        family_focus: true,
        tradition_emphasis: false,
      },
      cultural_context: {
        gift_giving_philosophy: "Technology should serve relationships and family harmony",
        relationship_importance: "Gifts that benefit the whole family unit",
        celebration_style: "Thoughtful innovation that shows care and planning",
        respect_hierarchy: true,
        group_vs_individual: "group",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  zola: [
    {
      id: "zola-en-us",
      persona_id: "zola",
      locale: "en-US",
      cultural_tone: "sophisticated, exclusive, aspirational",
      intro_message:
        "Darling, I'm Zola, and I have exquisite taste in luxury experiences. Let's find something absolutely divine that reflects your impeccable standards! ✨",
      gift_rationale_style: "luxury-focused with exclusivity and status symbol emphasis",
      voice_characteristics: {
        pace: "slow",
        formality: "formal",
        emotion_level: "reserved",
        family_focus: false,
        tradition_emphasis: false,
      },
      cultural_context: {
        gift_giving_philosophy: "Luxury is about creating unforgettable experiences",
        relationship_importance: "Shared appreciation for the finer things in life",
        celebration_style: "Exclusive, premium experiences that create lasting memories",
        respect_hierarchy: false,
        group_vs_individual: "individual",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "zola-zh-cn",
      persona_id: "zola",
      locale: "zh-CN",
      cultural_tone: "refined, respectful, heritage-conscious",
      intro_message:
        "您好! I'm Zola, and I appreciate the finest traditions and craftsmanship. Let's find something that honors both luxury and cultural heritage! 🏮",
      gift_rationale_style: "heritage luxury with cultural significance and family prestige focus",
      voice_characteristics: {
        pace: "slow",
        formality: "respectful",
        emotion_level: "reserved",
        family_focus: true,
        tradition_emphasis: true,
      },
      cultural_context: {
        gift_giving_philosophy: "True luxury honors tradition while embracing refinement",
        relationship_importance: "Gifts that elevate family status and show respect",
        celebration_style: "Elegant traditions that honor cultural heritage",
        respect_hierarchy: true,
        group_vs_individual: "group",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
}

export class PersonaCulturalAdaptationService {
  static async getAdaptedPersona(personaId: string, userLocale: string): Promise<PersonaCulturalAdaptation | null> {
    try {
      // First, try to get from database
      const { data, error } = await supabase
        .from("persona_cultural_adaptations")
        .select("*")
        .eq("persona_id", personaId)
        .eq("locale", userLocale)
        .single()

      if (data && !error) {
        return data
      }

      // Fallback to default adaptations
      const defaultAdaptations = DEFAULT_CULTURAL_ADAPTATIONS[personaId]
      if (defaultAdaptations) {
        const adaptation = defaultAdaptations.find((a) => a.locale === userLocale)
        if (adaptation) {
          return adaptation
        }

        // Try language-only match (e.g., 'en' from 'en-GB')
        const languageCode = userLocale.split("-")[0]
        const languageMatch = defaultAdaptations.find((a) => a.locale.startsWith(languageCode))
        if (languageMatch) {
          return languageMatch
        }
      }

      // Final fallback - return first available adaptation for this persona
      if (defaultAdaptations && defaultAdaptations.length > 0) {
        return defaultAdaptations[0]
      }

      return null
    } catch (error) {
      console.error("Error getting adapted persona:", error)
      return null
    }
  }

  static async getAllAdaptationsForPersona(personaId: string): Promise<PersonaCulturalAdaptation[]> {
    try {
      const { data, error } = await supabase
        .from("persona_cultural_adaptations")
        .select("*")
        .eq("persona_id", personaId)
        .order("locale")

      if (error) {
        // Fallback to defaults
        return DEFAULT_CULTURAL_ADAPTATIONS[personaId] || []
      }

      // Merge with defaults for any missing locales
      const dbAdaptations = data || []
      const defaultAdaptations = DEFAULT_CULTURAL_ADAPTATIONS[personaId] || []

      const allAdaptations = [...dbAdaptations]
      for (const defaultAdaptation of defaultAdaptations) {
        if (!dbAdaptations.find((a) => a.locale === defaultAdaptation.locale)) {
          allAdaptations.push(defaultAdaptation)
        }
      }

      return allAdaptations
    } catch (error) {
      console.error("Error getting persona adaptations:", error)
      return DEFAULT_CULTURAL_ADAPTATIONS[personaId] || []
    }
  }

  static async createCustomAdaptation(adaptation: Omit<PersonaCulturalAdaptation, "id" | "created_at" | "updated_at">) {
    try {
      const { data, error } = await supabase
        .from("persona_cultural_adaptations")
        .insert({
          ...adaptation,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating custom adaptation:", error)
      throw error
    }
  }

  static generateCulturalPrompt(adaptation: PersonaCulturalAdaptation, giftContext: string): string {
    const { cultural_tone, gift_rationale_style, cultural_context, voice_characteristics } = adaptation

    const prompt = `You are an AI gift advisor with the following cultural adaptation:

CULTURAL TONE: ${cultural_tone}
GIFT RATIONALE STYLE: ${gift_rationale_style}

VOICE CHARACTERISTICS:
- Pace: ${voice_characteristics.pace}
- Formality: ${voice_characteristics.formality}
- Emotion Level: ${voice_characteristics.emotion_level}
- Family Focus: ${voice_characteristics.family_focus ? "Yes" : "No"}
- Tradition Emphasis: ${voice_characteristics.tradition_emphasis ? "Yes" : "No"}

CULTURAL CONTEXT:
- Gift Philosophy: ${cultural_context.gift_giving_philosophy}
- Relationship Importance: ${cultural_context.relationship_importance}
- Celebration Style: ${cultural_context.celebration_style}
- Respect Hierarchy: ${cultural_context.respect_hierarchy ? "Yes" : "No"}
- Focus: ${cultural_context.group_vs_individual}

GIFT CONTEXT: ${giftContext}

Please provide gift recommendations that align with these cultural values and communication style.`

    return prompt
  }
}
