"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Sparkles } from "lucide-react"
import { AIConciergeChat } from "./ai-concierge-chat"

export function ConciergeTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
        size="icon"
      >
        <div className="relative">
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <Sparkles className="h-3 w-3 absolute -top-1 -right-1 animate-pulse" />
        </div>
      </Button>

      <AIConciergeChat isOpen={isOpen} onClose={() => setIsOpen(false)} initialAgent="avelyn" />
    </>
  )
}
