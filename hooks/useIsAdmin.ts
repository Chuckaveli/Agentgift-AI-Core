"use client"

import { useEffect, useState } from "react"

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/auth/is-admin", { credentials: "include" })
        if (!mounted) return
        if (res.ok) {
          const json = await res.json()
          setIsAdmin(Boolean(json?.isAdmin))
        } else {
          setIsAdmin(false)
        }
      } catch {
        setIsAdmin(false)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return { isAdmin, loading }
}
