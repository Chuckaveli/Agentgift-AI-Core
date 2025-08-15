"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/login")
  }, [router])

  return null
}

