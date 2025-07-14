"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Plus,
  Settings,
  Eye,
  EyeOff,
  Edit,
  BarChart3,
  Mic,
  MicOff,
  Sparkles,
  Zap,
  Users,
  TrendingUp,
  Package,
} from "lucide-react"

interface RegisteredFeature {
  id: string
  slug: string
  name: string
  description: string
  credit_cost: number
  xp_award: number
  tier_access: string[]
  ui_type: string
  is_active: boolean
  show_locked_preview: boolean
  show_on_homepage: boolean
  hide_from_free_tier: boolean
  usage_count: number
  created_at: string
}

interface FeatureTemplate {
  id: string
  name: string
  description: string
  ui_type: string
  default_credit_cost: number
  default_xp_award: number
}

const TIER_OPTIONS = [
  { value: "free_agent", label: "Free Agent" },
  { value: "premium_spy", label: "Premium Spy" },
  { value: "pro_agent", label: "Pro Agent" },
  { value: "agent_00g", label: "Agent 00G" },
  { value: "small_biz", label: "Small Business" },
  { value: "enterprise", label: "Enterprise" },
]

const UI_TYPES = [
  { value: "tile", label: "Dashboard Tile", icon: "🎯" },
  { value: "modal", label: "Modal Dialog", icon: "🪟" },
  { value: "quiz", label: "Interactive Quiz", icon: "❓" },
  { value: "viewer", label: "Content Viewer", icon: "👁️" },
  { value: "form", label: "Input Form", icon: "📝" },
  { value: "carousel", label: "Swipe Carousel", icon: "🎠" },
  { value: "game", label: "Mini Game", icon: "🎮" },
]

export default function FeatureBuilderPage() {
  const [features, setFeatures] = useState<RegisteredFeature[]>([])
  const [templates, setTemplates] = useState<FeatureTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("start-from-scratch")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    credit_cost: 1,
    xp_award: 25,
    tier_access: ["premium_spy"],
    ui_type: "tile",
    show_locked_preview: true,
    show_on_homepage: false,
    hide_from_free_tier: false,
  })

  // Analytics state
  const [analytics, setAnalytics] = useState({
    total_features: 0,
    active_features: 0,
    total_usage: 0,
    top_features: [],
  })

  useEffect(() => {
    fetchFeatures()
    fetchTemplates()
    fetchAnalytics()
  }, [])

  const fetchFeatures = async () => {
    try {
      const response = await fetch("/api/admin/features")
      const data = await response.json()
      setFeatures(data.features || [])
    } catch (error) {
      toast.error("Failed to load features")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/admin/feature-templates")
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error("Failed to load templates:", error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/feature-analytics")
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to load analytics:", error)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleCreateFeature = async () => {
    if (!formData.name.trim()) {
      toast.error("Feature name is required")
      return
    }

    const slug = generateSlug(formData.name)

    try {
      const response = await fetch("/api/admin/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          slug,
          template_id: selectedTemplate || null,
        }),
      })

      if (response.ok) {
        toast.success("Feature created successfully!")
        setFormData({
          name: "",
          description: "",
          credit_cost: 1,
          xp_award: 25,
          tier_access: ["premium_spy"],
          ui_type: "tile",
          show_locked_preview: true,
          show_on_homepage: false,
          hide_from_free_tier: false,
        })
        setSelectedTemplate("start-from-scratch")
        fetchFeatures()
        fetchAnalytics()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create feature")
      }
    } catch (error) {
      toast.error("Failed to create feature")
    }
  }

  const toggleFeatureStatus = async (featureId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/features/${featureId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (response.ok) {
        toast.success(`Feature ${!isActive ? "activated" : "deactivated"}`)
        fetchFeatures()
      } else {
        toast.error("Failed to update feature")
      }
    } catch (error) {
      toast.error("Failed to update feature")
    }
  }

  const startVoiceCommand = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Voice commands not supported in this browser")
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsVoiceActive(true)
      toast.info("Listening for voice command...")
    }

    recognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript
      toast.info(`Processing: "${command}"`)

      try {
        const response = await fetch("/api/admin/voice-commands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command }),
        })

        const result = await response.json()
        if (result.success) {
          toast.success("Voice command executed successfully!")
          fetchFeatures()
        } else {
          toast.error(result.message || "Failed to process voice command")
        }
      } catch (error) {
        toast.error("Failed to process voice command")
      }
    }

    recognition.onerror = () => {
      toast.error("Voice recognition error")
      setIsVoiceActive(false)
    }

    recognition.onend = () => {
      setIsVoiceActive(false)
    }

    recognition.start()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Feature Builder System</h1>
            <p className="text-gray-600 dark:text-gray-400">Create and manage AI-powered gifting tools without code</p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button
              onClick={startVoiceCommand}
              variant={isVoiceActive ? "destructive" : "outline"}
              className="flex items-center gap-2"
            >
              {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isVoiceActive ? "Stop Listening" : "Voice Command"}
            </Button>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total_features}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Features</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.active_features}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Features</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total_usage}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Usage</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round((analytics.active_features / Math.max(analytics.total_features, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Rate</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Feature
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Manage Features
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Create Feature Tab */}
          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Feature Creation Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    New Feature Builder
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Template Selection */}
                  <div>
                    <Label htmlFor="template">Start from Template (Optional)</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template or start from scratch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="start-from-scratch">Start from Scratch</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} - {template.ui_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Basic Info */}
                  <div>
                    <Label htmlFor="name">Feature Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Gift Memory Jar"
                    />
                    {formData.name && <p className="text-sm text-gray-500 mt-1">Slug: {generateSlug(formData.name)}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of what this feature does"
                      rows={3}
                    />
                  </div>

                  {/* UI Type */}
                  <div>
                    <Label>UI Type</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {UI_TYPES.map((type) => (
                        <Button
                          key={type.value}
                          variant={formData.ui_type === type.value ? "default" : "outline"}
                          onClick={() => setFormData({ ...formData, ui_type: type.value })}
                          className="justify-start"
                        >
                          <span className="mr-2">{type.icon}</span>
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Credit Cost & XP Award */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="credit_cost">Credit Cost</Label>
                      <Input
                        id="credit_cost"
                        type="number"
                        min="0"
                        value={formData.credit_cost}
                        onChange={(e) =>
                          setFormData({ ...formData, credit_cost: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="xp_award">XP Award</Label>
                      <Input
                        id="xp_award"
                        type="number"
                        min="0"
                        value={formData.xp_award}
                        onChange={(e) => setFormData({ ...formData, xp_award: Number.parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  {/* Tier Access */}
                  <div>
                    <Label>Tier Access</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {TIER_OPTIONS.map((tier) => (
                        <div key={tier.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={tier.value}
                            checked={formData.tier_access.includes(tier.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  tier_access: [...formData.tier_access, tier.value],
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  tier_access: formData.tier_access.filter((t) => t !== tier.value),
                                })
                              }
                            }}
                          />
                          <Label htmlFor={tier.value} className="text-sm">
                            {tier.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show_locked_preview">Show Locked Preview</Label>
                      <Switch
                        id="show_locked_preview"
                        checked={formData.show_locked_preview}
                        onCheckedChange={(checked) => setFormData({ ...formData, show_locked_preview: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show_on_homepage">Show on Homepage</Label>
                      <Switch
                        id="show_on_homepage"
                        checked={formData.show_on_homepage}
                        onCheckedChange={(checked) => setFormData({ ...formData, show_on_homepage: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="hide_from_free_tier">Hide from Free Tier</Label>
                      <Switch
                        id="hide_from_free_tier"
                        checked={formData.hide_from_free_tier}
                        onCheckedChange={(checked) => setFormData({ ...formData, hide_from_free_tier: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={handleCreateFeature} className="w-full" size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Deploy Feature
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    Feature Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">
                        {UI_TYPES.find((t) => t.value === formData.ui_type)?.icon || "🎯"}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{formData.name || "Feature Name"}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {formData.description || "Feature description will appear here"}
                    </p>
                    <div className="flex justify-center gap-2 mb-4">
                      <Badge variant="secondary">{formData.credit_cost} Credits</Badge>
                      <Badge variant="secondary">+{formData.xp_award} XP</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      UI Type: {UI_TYPES.find((t) => t.value === formData.ui_type)?.label}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manage Features Tab */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Feature Management</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading features...</div>
                ) : features.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No features created yet. Create your first feature!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{feature.name}</h3>
                            <Badge variant={feature.is_active ? "default" : "secondary"}>
                              {feature.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {feature.show_on_homepage && <Badge variant="outline">Homepage</Badge>}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{feature.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{feature.credit_cost} Credits</span>
                            <span>+{feature.xp_award} XP</span>
                            <span>{feature.usage_count} Uses</span>
                            <span>/{feature.slug}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFeatureStatus(feature.id, feature.is_active)}
                          >
                            {feature.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Feature: {feature.name}</DialogTitle>
                              </DialogHeader>
                              <div className="text-center py-8 text-gray-500">
                                Feature editing interface coming soon...
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">Detailed analytics dashboard coming soon...</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">Feature performance metrics coming soon...</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
