export type Tier = "Free" | "Pro" | "Pro+"

export type PersonaKey = "avelyn" | "galen" | "zola" | "mei" | "arya"

export type DatabaseUserProfile = {
  id: string
  tier: Tier
  xp_level: number
  love_language: string | null
  life_path_number: number | null
}

export interface Message {
  role: "user" | "assistant"
  content: string
}

export interface ConciergeContext {
  tier: Tier
  xp_level: number
  love_language: string | null
  life_path_number: number | null
}

export interface ConciergeRequest {
  persona: PersonaKey
  context: ConciergeContext
  messages: Message[]
}

export interface ConciergeResponse {
  reply: string
  ideas?: Array<{
    title: string
    description: string
    reasoning: string
  }>
  meta?: Record<string, any>
}
