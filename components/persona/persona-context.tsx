"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase-client"
import { PersonaCulturalAdaptationService, type PersonaCulturalAdaptation } from "@/lib/persona-cultural-adaptation"
import { useCulturalContext } from "@/components/cultural/cultural-context"

// Initialize Supabase client
const supabase = createClient()

export interface PersonaTheme {
  primary: string
  secondary: string
  accent: string
  gradient: string
  background: string
  text: string
}

export interface Persona {
  id: string
  name: string
  specialty: string
  tone: string
  avatar: string
  voiceId: string // ElevenLabs voice ID
  description: string
  theme: PersonaTheme
  chatPrompt: string
  contentPrompt: string
  isActive: boolean
  // Cultural adaptation fields
  culturalAdaptation?: PersonaCulturalAdaptation
  adaptedIntroMessage?: string
  adaptedTone?: string
}

interface PersonaContextType {
  currentPersona: Persona | null
  personas: Persona[]
  setPersona: (personaId: string) => Promise<void>
  isLoading: boolean
  error: string | null
  refreshPersonas: () => Promise<void>
  getCulturalPrompt: (giftContext: string) => string
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined)

// Default personas with themes and voice configurations
const defaultPersonas: Persona[] = [
  {
    id: "avelyn",
    name: "Avelyn",
    specialty: "Romance & Relationships",
    tone: "Warm, empathetic, romantic",
    avatar: "/placeholder.svg?height=40&width=40&text=A",
    voiceId: "21m00Tcm4TlvDq8ikWAM", // ElevenLabs voice ID
    description: "Specializes in romantic gifts and relationship advice with a warm, caring approach.",
    theme: {
      primary: "#ec4899",
      secondary: "#f9a8d4",
      accent: "#be185d",
      gradient: "from-pink-500 to-rose-500",
      background: "from-pink-50 to-rose-50",
      text: "text-pink-900",
    },
    chatPrompt:
      "You are Avelyn, a warm and empathetic AI assistant specializing in romantic gifts and relationships. You speak with care, understanding, and genuine emotion. Help users find meaningful gifts that express love and connection.",
    contentPrompt:
      "Write in Avelyn's warm, romantic voice. Focus on emotional connections, meaningful gestures, and the power of thoughtful gifting in relationships.",
    isActive: true,
  },
  {
    id: "galen",
    name: "Galen",
    specialty: "Tech & Gadgets",
    tone: "Smart, analytical, trendy",
    avatar: "/placeholder.svg?height=40&width=40&text=G",
    voiceId: "29vD33N1CtxCmqQRPOHJ", // ElevenLabs voice ID
    description: "Expert in technology gifts and gadgets with a smart, forward-thinking perspective.",
    theme: {
      primary: "#3b82f6",
      secondary: "#93c5fd",
      accent: "#1d4ed8",
      gradient: "from-blue-500 to-cyan-500",
      background: "from-blue-50 to-cyan-50",
      text: "text-blue-900",
    },
    chatPrompt:
      "You are Galen, a tech-savvy AI assistant who loves gadgets and innovation. You're analytical, precise, and always up-to-date with the latest technology trends. Help users find cutting-edge gifts and tech solutions.",
    contentPrompt:
      "Write in Galen's smart, analytical voice. Focus on innovation, functionality, and the latest tech trends. Be precise and informative while maintaining enthusiasm for technology.",
    isActive: true,
  },
  {
    id: "zola",
    name: "Zola",
    specialty: "Luxury & Premium",
    tone: "Sophisticated, exclusive, refined",
    avatar: "/placeholder.svg?height=40&width=40&text=Z",
    voiceId: "EXAVITQu4vr4xnSDxMaL", // ElevenLabs voice ID
    description: "Curator of luxury and premium gifts with sophisticated taste and exclusive access.",
    theme: {
      primary: "#8b5cf6",
      secondary: "#c4b5fd",
      accent: "#7c3aed",
      gradient: "from-purple-500 to-indigo-500",
      background: "from-purple-50 to-indigo-50",
      text: "text-purple-900",
    },
    chatPrompt:
      "You are Zola, a sophisticated AI assistant with exquisite taste in luxury and premium gifts. You speak with elegance, refinement, and deep knowledge of high-end products and experiences.",
    contentPrompt:
      "Write in Zola's sophisticated, refined voice. Focus on luxury, exclusivity, and premium experiences. Use elegant language and showcase deep knowledge of high-end products.",
    isActive: true,
  },
]

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null)
  const [personas, setPersonas] = useState<Persona[]>(defaultPersonas)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentLocale } = useCulturalContext()

  // Load user's preferred persona from Supabase
  useEffect(() => {
    loadUserPersona()
  }, [])

  // Update persona cultural adaptation when locale changes
  useEffect(() => {
    if (currentPersona && currentLocale) {
      updatePersonaCulturalAdaptation(currentPersona.id, currentLocale)
    }
  }, [currentLocale])

  const loadUserPersona = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // In a real implementation, you would get the current user
      // const { data: { user } } = await supabase.auth.getUser()

      // For demo purposes, we'll use localStorage as fallback
      const savedPersonaId = localStorage.getItem("agentgift_preferred_persona")

      if (savedPersonaId) {
        const persona = personas.find((p) => p.id === savedPersonaId)
        if (persona) {
          await setPersonaWithCulturalAdaptation(persona)
        } else {
          // Fallback to first persona
          await setPersonaWithCulturalAdaptation(personas[0])
        }
      } else {
        // Default to first persona
        await setPersonaWithCulturalAdaptation(personas[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load persona")
      // Fallback to first persona on error
      await setPersonaWithCulturalAdaptation(personas[0])
    } finally {
      setIsLoading(false)
    }
  }

  const setPersonaWithCulturalAdaptation = async (persona: Persona) => {
    try {
      // Get cultural adaptation for current locale
      const adaptation = await PersonaCulturalAdaptationService.getAdaptedPersona(persona.id, currentLocale)

      const adaptedPersona: Persona = {
        ...persona,
        culturalAdaptation: adaptation || undefined,
        adaptedIntroMessage: adaptation?.intro_message || persona.description,
        adaptedTone: adaptation?.cultural_tone || persona.tone,
      }

      setCurrentPersona(adaptedPersona)
      applyPersonaTheme(adaptedPersona)
    } catch (err) {
      console.error("Error setting persona with cultural adaptation:", err)
      setCurrentPersona(persona)
      applyPersonaTheme(persona)
    }
  }

  const updatePersonaCulturalAdaptation = async (personaId: string, locale: string) => {
    if (!currentPersona) return

    try {
      const adaptation = await PersonaCulturalAdaptationService.getAdaptedPersona(personaId, locale)

      const updatedPersona: Persona = {
        ...currentPersona,
        culturalAdaptation: adaptation || undefined,
        adaptedIntroMessage: adaptation?.intro_message || currentPersona.description,
        adaptedTone: adaptation?.cultural_tone || currentPersona.tone,
      }

      setCurrentPersona(updatedPersona)
    } catch (err) {
      console.error("Error updating persona cultural adaptation:", err)
    }
  }

  const setPersona = async (personaId: string) => {
    try {
      const persona = personas.find((p) => p.id === personaId)
      if (!persona) {
        throw new Error("Persona not found")
      }

      await setPersonaWithCulturalAdaptation(persona)

      // Save to localStorage (in real app, save to Supabase user profile)
      localStorage.setItem("agentgift_preferred_persona", personaId)

      // In a real implementation, save to Supabase
      // const { data: { user } } = await supabase.auth.getUser()
      // if (user) {
      //   await supabase
      //     .from('user_profiles')
      //     .update({ preferred_persona: personaId })
      //     .eq('user_id', user.id)
      // }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set persona")
    }
  }

  const applyPersonaTheme = (persona: Persona) => {
    // Apply CSS custom properties for dynamic theming
    const root = document.documentElement
    root.style.setProperty("--persona-primary", persona.theme.primary)
    root.style.setProperty("--persona-secondary", persona.theme.secondary)
    root.style.setProperty("--persona-accent", persona.theme.accent)

    // Dispatch custom event for components that need to react to persona changes
    window.dispatchEvent(
      new CustomEvent("personaChanged", {
        detail: { persona },
      }),
    )
  }

  const refreshPersonas = async () => {
    try {
      setIsLoading(true)
      // In a real implementation, fetch from Supabase
      // const { data, error } = await supabase
      //   .from('personas')
      //   .select('*')
      //   .eq('is_active', true)

      // For now, use default personas
      setPersonas(defaultPersonas)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh personas")
    } finally {
      setIsLoading(false)
    }
  }

  const getCulturalPrompt = (giftContext: string): string => {
    if (currentPersona?.culturalAdaptation) {
      return PersonaCulturalAdaptationService.generateCulturalPrompt(currentPersona.culturalAdaptation, giftContext)
    }

    // Fallback to default prompt
    return `${currentPersona?.chatPrompt || ""}\n\nGift Context: ${giftContext}`
  }

  const value: PersonaContextType = {
    currentPersona,
    personas,
    setPersona,
    isLoading,
    error,
    refreshPersonas,
    getCulturalPrompt,
  }

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
}

export function usePersona() {
  const context = useContext(PersonaContext)
  if (context === undefined) {
    throw new Error("usePersona must be used within a PersonaProvider")
  }
  return context
}

// Hook for getting persona-specific prompts for OpenAI
export function usePersonaPrompts() {
  const { currentPersona, getCulturalPrompt } = usePersona()

  return {
    getChatPrompt: () => currentPersona?.chatPrompt || "",
    getContentPrompt: () => currentPersona?.contentPrompt || "",
    getCulturalPrompt,
    getVoiceId: () => currentPersona?.voiceId || "",
    getTheme: () => currentPersona?.theme || defaultPersonas[0].theme,
    getAdaptedIntroMessage: () => currentPersona?.adaptedIntroMessage || currentPersona?.description || "",
    getAdaptedTone: () => currentPersona?.adaptedTone || currentPersona?.tone || "",
  }
}
