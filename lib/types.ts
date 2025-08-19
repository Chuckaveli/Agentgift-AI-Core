export type Tier = "Free" | "Pro" | "Pro+"

export type PersonaKey = "avelyn" | "galen" | "zola" | "mei" | "arya"

export interface DatabaseUserProfile {
  id: string
  tier: Tier
  xp_level: number
  love_language: string | null
  life_path_number: number | null
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface EmotionalSignal {
  label: string
  lottie: string
  tooltip: string
  status: "active" | "dim" | "locked"
}
