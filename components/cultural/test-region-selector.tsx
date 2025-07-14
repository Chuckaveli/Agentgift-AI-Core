"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Globe, TestTube, RefreshCw, Users, Zap } from "lucide-react"
import { useCulturalContext } from "./cultural-context"
import { usePersona } from "@/components/persona/persona-context"
import { toast } from "sonner"

interface TestRegion {
  code: string
  name: string
  flag: string
  description: string
  testScenarios: string[]
  expectedPersonaBehavior: {
    avelyn: string
    galen: string
    zola: string
  }
}

const TEST_REGIONS: TestRegion[] = [
  {
    code: "en-US",
    name: "United States",
    flag: "🇺🇸",
    description: "Direct, expressive, individual-focused culture",
    testScenarios: [
      "Valentine's Day romantic gift",
      "Birthday surprise for best friend",
      "Anniversary celebration planning",
      "Holiday tech gift for family",
    ],
    expectedPersonaBehavior: {
      avelyn: "Bold, expressive, emotion-forward approach with grand gesture suggestions",
      galen: "Fast-paced, innovation-focused, latest tech trends emphasis",
      zola: "Exclusive luxury experiences, aspirational lifestyle focus",
    },
  },
  {
    code: "hi-IN",
    name: "India (Hindi)",
    flag: "🇮🇳",
    description: "Family-conscious, respectful, tradition-rich culture",
    testScenarios: [
      "Diwali family celebration gifts",
      "Wedding anniversary with family approval",
      "Festival gifts for extended family",
      "Respectful romantic gesture",
    ],
    expectedPersonaBehavior: {
      avelyn: "Family-inclusive, culturally sensitive, tradition-respecting approach",
      galen: "Quality-focused, family-benefit emphasis, respectful tone",
      zola: "Heritage luxury, cultural significance, family prestige focus",
    },
  },
  {
    code: "zh-CN",
    name: "China (Simplified)",
    flag: "🇨🇳",
    description: "Harmony-focused, symbolic, group-oriented culture",
    testScenarios: [
      "Chinese New Year family gifts",
      "Symbolic romantic gesture",
      "Business relationship building",
      "Long-term commitment expression",
    ],
    expectedPersonaBehavior: {
      avelyn: "Symbolic meaning, harmony focus, long-term relationship building",
      galen: "Quality and precision, family harmony, thoughtful innovation",
      zola: "Heritage craftsmanship, cultural significance, refined traditions",
    },
  },
  {
    code: "ja-JP",
    name: "Japan",
    flag: "🇯🇵",
    description: "Respectful, detail-oriented, harmony-preserving culture",
    testScenarios: [
      "Omiyage (souvenir) selection",
      "Respectful romantic approach",
      "Seasonal gift-giving (Oseibo/Ochugen)",
      "Workplace relationship gifts",
    ],
    expectedPersonaBehavior: {
      avelyn: "Subtle, respectful, harmony-preserving romantic approach",
      galen: "Precision, quality, thoughtful functionality emphasis",
      zola: "Refined craftsmanship, attention to detail, cultural respect",
    },
  },
  {
    code: "de-DE",
    name: "Germany",
    flag: "🇩🇪",
    description: "Direct, practical, quality-focused culture",
    testScenarios: [
      "Christmas market traditional gifts",
      "Practical romantic gestures",
      "Quality-focused celebrations",
      "Efficient gift-giving approach",
    ],
    expectedPersonaBehavior: {
      avelyn: "Practical romance, quality over quantity, sincere expressions",
      galen: "Engineering excellence, practical innovation, quality focus",
      zola: "Craftsmanship quality, traditional luxury, refined practicality",
    },
  },
  {
    code: "fr-FR",
    name: "France",
    flag: "🇫🇷",
    description: "Elegant, sophisticated, art-appreciating culture",
    testScenarios: [
      "Romantic Parisian-style gifts",
      "Sophisticated celebration planning",
      "Art and culture appreciation",
      "Elegant lifestyle expressions",
    ],
    expectedPersonaBehavior: {
      avelyn: "Sophisticated romance, artistic expression, elegant gestures",
      galen: "Design-focused innovation, aesthetic technology, refined functionality",
      zola: "Haute couture luxury, artistic heritage, sophisticated elegance",
    },
  },
]

export function TestRegionSelector() {
  const { currentLocale, setLocale } = useCulturalContext()
  const { currentPersona, setPersona, personas } = usePersona()
  const [selectedTestRegion, setSelectedTestRegion] = useState<string>(currentLocale)
  const [isTestMode, setIsTestMode] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  const handleRegionChange = async (regionCode: string) => {
    setSelectedTestRegion(regionCode)
    if (isTestMode) {
      await setLocale(regionCode)
      toast.success(`Test region switched to ${TEST_REGIONS.find((r) => r.code === regionCode)?.name}`)
    }
  }

  const toggleTestMode = async (enabled: boolean) => {
    setIsTestMode(enabled)
    if (enabled) {
      await setLocale(selectedTestRegion)
      toast.success("Test mode enabled - Cultural adaptations active")
    } else {
      // Reset to user's actual locale
      const userLocale = navigator.language || "en-US"
      await setLocale(userLocale)
      toast.info("Test mode disabled - Restored to actual locale")
    }
  }

  const runPersonaTest = async (personaId: string, scenario: string) => {
    try {
      const testRegion = TEST_REGIONS.find((r) => r.code === selectedTestRegion)
      if (!testRegion) return

      // Switch to test persona
      await setPersona(personaId)

      // Simulate getting culturally adapted response
      const testResult = {
        persona: personaId,
        region: selectedTestRegion,
        scenario,
        expectedBehavior:
          testRegion.expectedPersonaBehavior[personaId as keyof typeof testRegion.expectedPersonaBehavior],
        timestamp: new Date().toISOString(),
        adaptedIntroMessage: currentPersona?.adaptedIntroMessage,
        adaptedTone: currentPersona?.adaptedTone,
      }

      setTestResults((prev) => ({
        ...prev,
        [`${personaId}-${selectedTestRegion}-${Date.now()}`]: testResult,
      }))

      toast.success(`Test completed for ${personas.find((p) => p.id === personaId)?.name} in ${testRegion.name}`)
    } catch (error) {
      toast.error("Test failed - check console for details")
      console.error("Persona test error:", error)
    }
  }

  const clearTestResults = () => {
    setTestResults({})
    toast.info("Test results cleared")
  }

  const selectedRegion = TEST_REGIONS.find((r) => r.code === selectedTestRegion)

  return (
    <div className="space-y-6">
      {/* Test Mode Toggle */}
      <Card className="border-2 border-dashed border-orange-200 bg-orange-50 dark:bg-orange-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <TestTube className="w-5 h-5" />
            Cultural Experience Test Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Enable Test Mode</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Override your actual locale to test cultural adaptations
              </p>
            </div>
            <Switch checked={isTestMode} onCheckedChange={toggleTestMode} />
          </div>

          {isTestMode && (
            <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TestTube className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-800 dark:text-orange-200">Test Mode Active</span>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Cultural adaptations are now using the selected test region instead of your actual location.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Region Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Test Region Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-medium mb-2 block">Current Test Region</Label>
              <Select value={selectedTestRegion} onValueChange={handleRegionChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEST_REGIONS.map((region) => (
                    <SelectItem key={region.code} value={region.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{region.flag}</span>
                        <span>{region.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {region.code}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium mb-2 block">Current Persona</Label>
              <div className="flex items-center gap-2 p-2 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                  {currentPersona?.name[0]}
                </div>
                <div>
                  <p className="font-medium">{currentPersona?.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{currentPersona?.adaptedTone}</p>
                </div>
              </div>
            </div>
          </div>

          {selectedRegion && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{selectedRegion.flag}</span>
                <h3 className="font-semibold">{selectedRegion.name}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{selectedRegion.description}</p>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Test Scenarios:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRegion.testScenarios.map((scenario, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {scenario}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Persona Testing */}
      {isTestMode && selectedRegion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Persona Cultural Adaptation Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {personas.map((persona) => (
                <div key={persona.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-r ${persona.theme.gradient} flex items-center justify-center text-white font-bold`}
                    >
                      {persona.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{persona.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{persona.specialty}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Expected Behavior:</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {
                        selectedRegion.expectedPersonaBehavior[
                          persona.id as keyof typeof selectedRegion.expectedPersonaBehavior
                        ]
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    {selectedRegion.testScenarios.map((scenario, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs bg-transparent"
                        onClick={() => runPersonaTest(persona.id, scenario)}
                      >
                        Test: {scenario}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                Test Results
              </div>
              <Button variant="outline" size="sm" onClick={clearTestResults}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Clear Results
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(testResults).map(([key, result]) => (
                <div key={key} className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{result.persona}</Badge>
                      <span className="text-lg">{TEST_REGIONS.find((r) => r.code === result.region)?.flag}</span>
                      <span className="text-sm font-medium">{result.region}</span>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Scenario: </span>
                      <span className="text-sm">{result.scenario}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Adapted Intro: </span>
                      <span className="text-sm italic">{result.adaptedIntroMessage}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Cultural Tone: </span>
                      <span className="text-sm">{result.adaptedTone}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Expected Behavior: </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{result.expectedBehavior}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
