"use client"

import { Lock } from "lucide-react"
import type { PersonaKey } from "@/lib/types"

export default function PersonaPicker({
  value,
  onChange,
  unlocked,
}: {
  value: PersonaKey
  onChange: (p: PersonaKey) => void
  unlocked: Record<PersonaKey, boolean>
}) {
  const items: { key: PersonaKey; label: string; hint: string }[] = [
    { key: "avelyn", label: "🌸 Avelyn", hint: "Warm · Story-rich" },
    { key: "galen", label: "🖤 Galen", hint: "Calm · Minimal" },
    { key: "zola", label: "💃 Zola", hint: "Gen Z · Witty" },
    { key: "mei", label: "🌹 Mei", hint: "Mandarin · Elegant" },
    { key: "arya", label: "🌞 Arya", hint: "Hindi · Graceful" },
  ]

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it) => {
        const locked = !unlocked[it.key as PersonaKey]
        const active = value === it.key
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => !locked && onChange(it.key)}
            className={`w-full text-left rounded-lg border p-3 transition ${
              active
                ? "border-fuchsia-500 shadow-[0_0_16px_rgba(168,85,247,0.25)]"
                : "border-gray-200 hover:border-gray-300"
            } ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{it.label}</span>
              {locked && <Lock className="h-4 w-4 text-gray-400" />}
            </div>
            <div className="text-xs text-gray-500">{it.hint}</div>
          </button>
        )
      })}
    </div>
  )
}
