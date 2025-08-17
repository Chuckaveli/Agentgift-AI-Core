"use client"

const chips = [
  "Anniversary with a tight budget",
  "New manager welcome gift",
  "Make up for a missed date",
  "Non-material gesture for mom",
  "Something deeply personal",
]

export function SuggestionChips() {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <span
          key={c}
          className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200"
        >
          {c}
        </span>
      ))}
    </div>
  )
}

export default SuggestionChips
