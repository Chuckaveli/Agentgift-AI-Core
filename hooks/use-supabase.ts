"use client"

import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useEffect, useState } from "react"

export const useUser = () => {
  const [user, setUser] = useState<any>(null)
  const supabaseClient = useSupabaseClient()

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()
      setUser(user)
    }

    fetchUser()
  }, [supabaseClient])

  return user
}
