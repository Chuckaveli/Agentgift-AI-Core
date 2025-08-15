"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { UniversalAIPluginLoader } from "@/components/universal/universal-ai-plugin-loader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, Bot, Mic } from "lucide-react"

export default function UniversalAIPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            Universal AI Plugin Loader™
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Auto-load, tag, and organize all AI assistants, voice personas, and third-party AI plugins across the
          AgentGift.ai Giftverse ecosystem with universal plug-and-play compatibility.
        </p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Auto-Sync Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✓</div>
            <p className="text-xs text-green-600">Real-time registry sync</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">RLS</div>
            <p className="text-xs text-blue-600">JWT + Tier validation</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Assistants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">11+</div>
            <p className="text-xs text-purple-600">Active & registered</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Voice Personas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">4</div>
            <p className="text-xs text-orange-600">ElevenLabs integrated</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🧩 Auto-Tagging System</CardTitle>
            <CardDescription>Intelligent classification and organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline">user-facing</Badge>
              <Badge variant="outline">internal</Badge>
              <Badge variant="outline">voice</Badge>
              <Badge variant="outline">logic</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Every assistant automatically tagged by type, tier access, XP requirements, and voice capabilities.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎙️ Multi-API Integration</CardTitle>
            <CardDescription>Seamless third-party connections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-1">
              <Badge className="bg-green-500 text-white">ElevenLabs</Badge>
              <Badge className="bg-blue-500 text-white">DeepInfra</Badge>
              <Badge className="bg-purple-500 text-white">Groq</Badge>
              <Badge className="bg-orange-500 text-white">xAI</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Voice, vision, emotion, and enhanced LLM responses automatically routed to appropriate services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📦 Universal Deployment</CardTitle>
            <CardDescription>Zero-config plug-and-play</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-1">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Auto-Refresh</Badge>
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">XP Sync</Badge>
            </div>
            <p className="text-sm text-gray-600">
              New assistants automatically register, validate, and deploy with full ecosystem integration.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Plugin Loader */}
      <UniversalAIPluginLoader showAdminControls={true} autoRefresh={true} />
    </div>
  )
}

