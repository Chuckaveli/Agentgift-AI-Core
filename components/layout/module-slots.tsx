"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import type React from "react"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, BarChart3, Users, MessageSquare, Zap, Settings, Activity } from "lucide-react"

interface ModuleSlotProps {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  children?: ReactNode
  onClick?: () => void
  className?: string
}

export function ModuleSlot({
  title,
  description,
  icon: Icon,
  badge,
  children,
  onClick,
  className = "",
}: ModuleSlotProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer ${className}`} onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-purple-600" />}
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardHeader>
      {children && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  )
}

// Pre-built module components
export function VoiceConciergeModule() {
  return (
    <ModuleSlot
      title="Voice Concierge"
      description="Talk to your AI gift assistant"
      icon={Mic}
      badge="Beta"
      onClick={() => console.log("Voice concierge activated")}
    >
      <Button size="sm" className="w-full">
        Start Voice Chat
      </Button>
    </ModuleSlot>
  )
}

export function AGTETrackerModule() {
  return (
    <ModuleSlot title="AGTE Tracker" description="AI Gift Tracking Engine" icon={BarChart3} badge="Pro">
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>Gifts Tracked</span>
          <span className="font-medium">24</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Success Rate</span>
          <span className="font-medium text-green-600">94%</span>
        </div>
      </div>
    </ModuleSlot>
  )
}

export function SocialToolsModule() {
  return (
    <ModuleSlot title="Social Tools" description="Share and discover gifts" icon={Users} badge="New">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
          Share
        </Button>
        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
          Discover
        </Button>
      </div>
    </ModuleSlot>
  )
}

export function QuickActionsModule() {
  const actions = [
    { label: "Find Gift", icon: Zap },
    { label: "Chat Support", icon: MessageSquare },
    { label: "Settings", icon: Settings },
    { label: "Analytics", icon: Activity },
  ]

  return (
    <ModuleSlot title="Quick Actions" description="Common tasks at your fingertips">
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.label}
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-xs bg-transparent"
            >
              <Icon className="h-3 w-3" />
              {action.label}
            </Button>
          )
        })}
      </div>
    </ModuleSlot>
  )
}

// Module container for organizing multiple modules
export function ModuleContainer({
  children,
  title,
  className = "",
}: {
  children: ReactNode
  title?: string
  className?: string
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && <h3 className="text-sm font-medium text-muted-foreground px-2">{title}</h3>}
      <div className="space-y-3">{children}</div>
    </div>
  )
}

