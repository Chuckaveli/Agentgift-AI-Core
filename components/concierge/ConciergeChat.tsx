"use client"

import { useEffect, useRef, useState } from "react"
import type { DatabaseUserProfile, PersonaKey, Message } from "@/lib/types"

export default function ConciergeChat({
  persona,
  profile,
}: {
  persona: PersonaKey
  profile: DatabaseUserProfile | null
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Concierge. Tell me about the person and the vibe—I'll craft a perfect gift idea with the *why* behind it.",
    },
  ])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  async function send() {
    if (!input.trim()) return
    const next = [...messages, { role: "user", content: input.trim() } as Message]
    setMessages(next)
    setInput("")
    setSending(true)

    try {
      const res = await fetch("/api/concierge/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          // Send only non-sensitive context (server enforces)
          context: {
            tier: profile?.tier ?? "Free",
            xp_level: profile?.xp_level ?? 0,
            love_language: profile?.love_language,
            life_path_number: profile?.life_path_number,
          },
          messages: next,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Chat error")

      setMessages((m) => [...m, { role: "assistant", content: data.reply }])
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "I ran into a wire I shouldn't cross. Try again in a moment—if it persists, I'll notify ops.",
        },
      ])
      console.error("[concierge] chat error:", e?.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 h-[calc(100vh-220px)] flex flex-col">
      <div ref={scroller} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              m.role === "user"
                ? "ml-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "bg-gray-50 border border-gray-100 text-gray-800"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the person, occasion, vibe…"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
        />
        <button
          onClick={send}
          disabled={sending}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow hover:opacity-95 disabled:opacity-60"
        >
          {sending ? "Thinking…" : "Send"}
        </button>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Persona: <span className="font-medium">{persona}</span> · Tier visual gates only—final limits enforced on
        server.
      </div>
    </div>
  )
}
