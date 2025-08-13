export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          tier: string | null
          plan: string | null
          preferences: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          tier?: string | null
          plan?: string | null
          preferences?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          tier?: string | null
          plan?: string | null
          preferences?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          user_id: string
          thread_id: string
          role: "user" | "assistant" | "system"
          content: string
          request_id: string | null
          status: "queued" | "processing" | "completed" | "failed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          thread_id: string
          role: "user" | "assistant" | "system"
          content: string
          request_id?: string | null
          status?: "queued" | "processing" | "completed" | "failed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          thread_id?: string
          role?: "user" | "assistant" | "system"
          content?: string
          request_id?: string | null
          status?: "queued" | "processing" | "completed" | "failed"
          created_at?: string
          updated_at?: string
        }
      }
      chat_threads: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          type: string
          payload: Record<string, any>
          status: "queued" | "running" | "done" | "error" | "cancelled"
          retry_count: number
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          payload: Record<string, any>
          status?: "queued" | "running" | "done" | "error" | "cancelled"
          retry_count?: number
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          payload?: Record<string, any>
          status?: "queued" | "running" | "done" | "error" | "cancelled"
          retry_count?: number
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tts_requests: {
        Row: {
          id: string
          user_id: string
          message_id: string
          voice_id: string
          status: "queued" | "processing" | "completed" | "failed"
          audio_url: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message_id: string
          voice_id: string
          status?: "queued" | "processing" | "completed" | "failed"
          audio_url?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message_id?: string
          voice_id?: string
          status?: "queued" | "processing" | "completed" | "failed"
          audio_url?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feature_usage: {
        Row: {
          id: string
          user_id: string
          feature_id: string
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feature_id: string
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          feature_id?: string
          metadata?: Record<string, any> | null
          created_at?: string
        }
      }
      saved_gifts: {
        Row: {
          id: string
          user_id: string
          gift_id: string | null
          gift_name: string
          recipient_name: string | null
          occasion: string | null
          price: number | null
          notes: string | null
          status: "idea" | "researching" | "decided" | "purchased" | "delivered"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gift_id?: string | null
          gift_name: string
          recipient_name?: string | null
          occasion?: string | null
          price?: number | null
          notes?: string | null
          status?: "idea" | "researching" | "decided" | "purchased" | "delivered"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gift_id?: string | null
          gift_name?: string
          recipient_name?: string | null
          occasion?: string | null
          price?: number | null
          notes?: string | null
          status?: "idea" | "researching" | "decided" | "purchased" | "delivered"
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_retry_count: {
        Args: {
          job_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
