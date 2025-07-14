"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Bell, Languages, TestTube } from "lucide-react"
import { useCulturalContext } from "@/components/cultural/cultural-context"
import { usePersona } from "@/components/persona/persona-context"

export default function SettingsPage() {
  const { currentLocale, culturalPreferences, setLocale } = useCulturalContext()
  const { currentPersona, personas, setPersona } = usePersona()

  const [settings, setSettings] = useState({
    culturalAdaptation: true,
    holidayReminders: true,
    culturalGiftSuggestions: true,
    localizedPersonas: true,
    autoDetectLocale: true,
    showCulturalTips: true,
    respectCulturalTaboos: true,
    enableHolidayXPBonus: true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // In a real app, save to Supabase user profile
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      localStorage.setItem("agentgift_cultural_settings", JSON.stringify(settings))
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetToDefaults = () => {
    setSettings({
      culturalAdaptation: true,
      holidayReminders: true,
      culturalGiftSuggestions: true,
      localizedPersonas: true,
      autoDetectLocale: true,
      showCulturalTips: true,
      respectCulturalTaboos: true,
      enableHolidayXPBonus: true,
    })
  }

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem("agentgift_cultural_settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Settings & Preferences
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Customize your AgentGift.ai experience</p>
        </div>

        <Tabs defaultValue="cultural" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cultural" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Cultural
            </TabsTrigger>
            <TabsTrigger value="personas" className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Personas
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cultural" className="space-y-6">
            {/* Cultural Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Cultural Intelligence Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium">Current Locale</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Your cultural and language preferences
                    </p>
                    <Badge variant="outline" className="text-sm">
                      {currentLocale} - {culturalPreferences?.locale}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-base font-medium">Current Persona</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your AI assistant personality</p>
                    <Badge variant="outline" className="text-sm">
                      {currentPersona?.name} - {currentPersona?.specialty}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Cultural Adaptation</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Adapt gift suggestions and UI based on your cultural background
                      </p>
                    </div>
                    <Switch
                      checked={settings.culturalAdaptation}
                      onCheckedChange={(checked) => handleSettingChange("culturalAdaptation", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Holiday Reminders</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified about upcoming cultural holidays and celebrations
                      </p>
                    </div>
                    <Switch
                      checked={settings.holidayReminders}
                      onCheckedChange={(checked) => handleSettingChange("holidayReminders", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Cultural Gift Suggestions</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive gift recommendations that respect cultural traditions
                      </p>
                    </div>
                    <Switch
                      checked={settings.culturalGiftSuggestions}
                      onCheckedChange={(checked) => handleSettingChange("culturalGiftSuggestions", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Localized Personas</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        AI personas adapt their tone and style to your cultural preferences
                      </p>
                    </div>
                    <Switch
                      checked={settings.localizedPersonas}
                      onCheckedChange={(checked) => handleSettingChange("localizedPersonas", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Auto-Detect Locale</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically detect your location and cultural preferences
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoDetectLocale}
                      onCheckedChange={(checked) => handleSettingChange("autoDetectLocale", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Cultural Tips & Guidance</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Show helpful cultural context and gift-giving etiquette
                      </p>
                    </div>
                    <Switch
                      checked={settings.showCulturalTips}
                      onCheckedChange={(checked) => handleSettingChange("showCulturalTips", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Respect Cultural Taboos</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Filter out culturally inappropriate or offensive gift suggestions
                      </p>
                    </div>
                    <Switch
                      checked={settings.respectCulturalTaboos}
                      onCheckedChange={(checked) => handleSettingChange("respectCulturalTaboos", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Holiday XP Bonuses</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Earn bonus XP when gifting during cultural holidays
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableHolidayXPBonus}
                      onCheckedChange={(checked) => handleSettingChange("enableHolidayXPBonus", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personas" className="space-y-6">
            {/* Persona Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-purple-600" />
                  AI Persona Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {personas.map((persona) => (
                    <div
                      key={persona.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        currentPersona?.id === persona.id
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setPersona(persona.id)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {persona.name[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold">{persona.name}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{persona.specialty}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>{/* Placeholder for Notification Settings */}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            {/* Testing Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-green-600" />
                  Testing Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>{/* Placeholder for Testing Settings */}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
