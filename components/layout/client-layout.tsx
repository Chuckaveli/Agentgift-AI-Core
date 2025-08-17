import type React from "react"
import { MessageCircle, Github, Twitter, Instagram, Linkedin, Gift, Sparkles, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-background">{/* Navigation */}</header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-background text-foreground">
        {/* Social Media Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <a href="https://github.com/agentgift" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="https://discord.gg/FVDQPDvkEH" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
            </a>
          </Button>
          {/* Other Social Media Buttons */}
          <Button variant="ghost" size="sm" asChild>
            <a href="https://twitter.com/agentgift" target="_blank" rel="noopener noreferrer">
              <Twitter className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="https://instagram.com/agentgift" target="_blank" rel="noopener noreferrer">
              <Instagram className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="https://linkedin.com/in/agentgift" target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="https://example.com/gift" target="_blank" rel="noopener noreferrer">
              <Gift className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="https://example.com/sparkles" target="_blank" rel="noopener noreferrer">
              <Sparkles className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="https://example.com/heart" target="_blank" rel="noopener noreferrer">
              <Heart className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="https://example.com/star" target="_blank" rel="noopener noreferrer">
              <Star className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </footer>
    </div>
  )
}
