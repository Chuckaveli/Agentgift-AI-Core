"use client"

<<<<<<< HEAD
import { createClient } from "@/lib/supabase/clients"
=======
import { getBrowserClient } from "@/lib/supabase/clients"
>>>>>>> origin/main
import { useEffect, useState } from "react"

export function useSupabase() {
  const [supabase] = useState(() => getBrowserClient())

  return supabase
}

export function useUser() {
  const supabase = useSupabase()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user, loading, supabase }
}

