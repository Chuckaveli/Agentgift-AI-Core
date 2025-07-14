"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client with fallback values for build time
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"

  return createClient(supabaseUrl, supabaseAnonKey)
}

interface CompanyData {
  id: string
  name: string
  xp: number
  level: number
  badges: number
  employees: number
}

export function useSupabase() {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call with mock data
    const fetchCompanyData = async () => {
      try {
        setLoading(true)

        // Check if we have real Supabase credentials
        const hasRealCredentials =
          process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://demo.supabase.co"

        if (!hasRealCredentials) {
          // Use mock data when no real credentials
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const mockData: CompanyData = {
            id: "1",
            name: "AgentGift.ai",
            xp: 9200,
            level: 9,
            badges: 156,
            employees: 247,
          }

          setCompanyData(mockData)
          setLoading(false)
          return
        }

        // Real Supabase call would go here
        const supabase = createSupabaseClient()
        // ... real implementation
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyData()
  }, [])

  const updateCompanyXP = async (newXP: number) => {
    try {
      // In a real app, this would update Supabase
      if (companyData) {
        setCompanyData({
          ...companyData,
          xp: newXP,
          level: Math.floor(newXP / 1000),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update XP")
    }
  }

  return {
    companyData,
    loading,
    error,
    updateCompanyXP,
    supabase: createSupabaseClient(),
  }
}
