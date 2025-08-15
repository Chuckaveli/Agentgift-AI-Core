"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Globe, Bell, Languages, TestTube, Save, RotateCcw } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      localStorage.setItem("agentgift_cultural_settings", JSON.stringify(settings))
      setIsSaved(true)
      toast.success("Settings saved successfully!")
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
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
    toast.info("Settings reset to defaults")
  }

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem("agentgift_cultural_settings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Error loading settings:", error)
      }
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
                      🇺🇸 en-US - United States
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-base font-medium">Current Persona</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your AI assistant personality</p>
                    <Badge variant="outline" className="text-sm">
                      🎁 Gift Concierge - Gifting Expert
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

                <Separator />

                <div className="flex gap-4">
                  <Button onClick={handleSaveSettings} disabled={isLoading} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {isLoading ? "Saving..." : isSaved ? "Saved!" : "Save Settings"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleResetToDefaults}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-purple-600" />
                  AI Persona Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Persona settings will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Notification settings will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-green-600" />
                  Testing Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Testing settings will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

