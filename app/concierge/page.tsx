"use client"

import { useEffect, useMemo, useState } from "react"
import ConciergeChat from "@/components/concierge/ConciergeChat"
import PersonaPicker from "@/components/concierge/PersonaPicker"
import Orb from "@/components/concierge/Orb"
import SuggestionChips from "@/components/concierge/SuggestionChips"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { DatabaseUserProfile, PersonaKey, Tier } from "@/lib/types"

// ⬇️ NEW: lightweight Lottie status component (use the one I shared earlier)
// If you placed it at components/concierge/LottieStatus.tsx:
import LottieStatus from "@/components/concierge/LottieStatus"

type LottieState = "idle" | "userListening" | "aiThinking" | "aiSpeaking"

export default function ConciergePage() {
  const supabase = useMemo(() => createClientComponentClient(), [])
  const [profile, setProfile] = useState<DatabaseUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [persona, setPersona] = useState<PersonaKey>("avelyn")

  // ⬇️ NEW: Lottie status state (no separate hook file needed)
  const [status, setStatus] = useState<LottieState>("idle")

  // Event handlers you can pass to ConciergeChat
  const onInputFocus = () => setStatus("userListening")
  const onInputChange = () => setStatus("userListening")
  const onSubmit = () => setStatus("aiThinking")
  const onFirstToken = () => setStatus("aiSpeaking")
  const onStreamEnd = () => setTimeout(() => setStatus("idle"), 600)
  const onError = () => setStatus("idle")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          // Not signed-in → soft demo mode
          setProfile({
            id: "anon",
            tier: "Free",
            xp_level: 0,
            love_language: null,
            life_path_number: null,
          })
          return
        }
        const { data, error } = await supabase
          .from("user_profiles")
          .select("id,tier,xp_level,love_language,life_path_number")
          .eq("user_id", user.id)
          .single()
        if (!mounted) return
        if (error) {
          console.warn("[concierge] profile fetch warn:", error.message)
          setProfile({
            id: user.id,
            tier: "Free",
            xp_level: 0,
            love_language: null,
            life_path_number: null,
          })
        } else {
          setProfile({
            id: data.id,
            tier: (data.tier as Tier) ?? "Free",
            xp_level: data.xp_level ?? 0,
            love_language: data.love_language,
            life_path_number: data.life_path_number,
          })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [supabase])

  const unlocked = {
    avelyn: true,
    galen: true,
    zola: (profile?.xp_level ?? 0) >= 10,
    mei: (profile?.xp_level ?? 0) >= 20,
    arya: (profile?.xp_level ?? 0) >= 40,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/60 border-b border-white/40">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-md grid place-items-center">
              <span className="text-white text-lg">🎁</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Concierge Core</h1>
              <p className="text-xs text-gray-500 -mt-1">Emotion-aware gifting assistant</p>
            </div>
          </div>
          {!loading && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Tier</span>
              <span className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow">
                {profile?.tier ?? "Free"}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left rail: Orbs */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900">Emotional Signals</h2>
            <p className="text-sm text-gray-500 mb-4">Concierge lights up what it knows.</p>

            <div className="grid grid-cols-2 gap-3">
              <Orb
                label="Love Language"
                status={profile?.love_language ? "active" : "dim"}
                lottie="/lottie/love_language.json"
                tooltip={profile?.love_language ?? "Add in profile"}
              />
              <Orb
                label="Numerology"
                status={profile?.life_path_number ? "active" : "dim"}
                lottie="/lottie/numerology.json"
                tooltip={
                  profile?.life_path_number ? `Life Path #${profile?.life_path_number}` : "Sync date of birth"
                }
              />
              <Orb
                label="Emotion Tag"
                status="active"
                lottie="/lottie/emotion_tag.json"
                tooltip="Set during a session"
              />
              <Orb
                label="Relationship"
                status="active"
                lottie="/lottie/relationship.json"
                tooltip="Partner · Family · Friend"
              />
              <Orb
                label="Tier / XP"
                status={(profile?.tier ?? "Free") === "Pro+" ? "active" : "dim"}
                lottie="/lottie/tier.json"
                tooltip={`XP ${profile?.xp_level ?? 0}`}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Persona</h3>
            <PersonaPicker value={persona} onChange={setPersona} unlocked={unlocked} />
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Quick ideas</h3>
            <SuggestionChips />
          </div>
        </aside>

        {/* Right: Status + Chat */}
        <section className="lg:col-span-2 space-y-4">
          {/* ⬇️ NEW: the 3-state Lottie status bar */}
          <LottieStatus state={status} className="mb-2" />

          {/* Pass the handlers if your ConciergeChat supports them.
              If not yet, add these props in that component to flip the status at the right moments. */}
          <ConciergeChat
            persona={persona}
            profile={profile}
            // optional wiring for animation control:
            onInputFocus={onInputFocus}
            onInputChange={onInputChange}
            onSubmitMessage={onSubmit}
            onFirstToken={onFirstToken}
            onStreamEnd={onStreamEnd}
            onError={onError}
          />
        </section>
      </main>
    </div>
  )
}
