"use client"

import { createClient } from "@/lib/supabase-client"
import { useEffect, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"

export function useSupabase() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const client = createClient()
      setSupabase(client)

      // Test the connection
      client.auth.getSession().then(({ error }: { error: any }) => {
        if (error) {
          setError(error.message)
          setIsConnected(false)
        } else {
          setIsConnected(true)
          setError(null)
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize Supabase client")
      setIsConnected(false)
    }
  }, [])

  const retry = () => {
    setError(null)
    try {
      const client = createClient()
      setSupabase(client)
      setIsConnected(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize Supabase client")
      setIsConnected(false)
    }
  }

  return {
    supabase,
    isConnected,
    error,
    retry,
  }
}
