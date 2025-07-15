'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/dashboard`, // Works in Vercel prod
      },
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <h1 className="text-lg font-semibold animate-pulse">🎯 Redirecting to your mission...</h1>
    </div>
  )
}
