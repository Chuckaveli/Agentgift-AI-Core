import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Client-side Supabase client
export const createClient = () => createClientComponentClient()

// Server-side Supabase client
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// Database types (you can generate these with `supabase gen types typescript --local`)
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          tier: string
          current_xp: number
          lifetime_xp: number
          level: number
          demo_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          tier?: string
          current_xp?: number
          lifetime_xp?: number
          level?: number
          demo_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          tier?: string
          current_xp?: number
          lifetime_xp?: number
          level?: number
          demo_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recipients: {
        Row: {
          id: string
          user_id: string
          name: string
          relationship: string
          age_range: string | null
          interests: string[] | null
          cultural_background: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          relationship: string
          age_range?: string | null
          interests?: string[] | null
          cultural_background?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          relationship?: string
          age_range?: string | null
          interests?: string[] | null
          cultural_background?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gift_suggestions: {
        Row: {
          id: string
          user_id: string
          recipient_id: string
          text: string
          rationale: string
          kind: string
          confidence_score: number
          cultural_appropriateness: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipient_id: string
          text: string
          rationale: string
          kind: string
          confidence_score?: number
          cultural_appropriateness?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipient_id?: string
          text?: string
          rationale?: string
          kind?: string
          confidence_score?: number
          cultural_appropriateness?: number
          created_at?: string
        }
      }
      xp_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          reason: string
          feature_used: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          reason: string
          feature_used?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          reason?: string
          feature_used?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
