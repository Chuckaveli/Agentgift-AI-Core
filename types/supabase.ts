export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          tier: string
          credits: number
          xp: number
          level: number
          badges: string[]
          prestige_level: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          tier?: string
          credits?: number
          xp?: number
          level?: number
          badges?: string[]
          prestige_level?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          tier?: string
          credits?: number
          xp?: number
          level?: number
          badges?: string[]
          prestige_level?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feature_templates: {
        Row: {
          id: string
          name: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_active?: boolean
          created_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          reason: string
          balance_after: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          reason: string
          balance_after: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          reason?: string
          balance_after?: number
          created_at?: string
        }
      }
      xp_logs: {
        Row: {
          id: string
          user_id: string
          xp_amount: number
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          xp_amount: number
          reason: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          xp_amount?: number
          reason?: string
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
