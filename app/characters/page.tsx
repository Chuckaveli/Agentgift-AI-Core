"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Star, Crown, Zap, Heart, Sparkles, Search } from "lucide-react"
import { useFeatureAccess } from "@/hooks/use-feature-access"

interface Character {
  id: string
  name: string
  tagline: string
  icon: string
  category: "starter" | "premium" | "legendary" | "seasonal" | "special"
  unlockLevel: number
  unlockCondition: string
  unlockMethod: "level" | "achievement" | "purchase" | "event" | "referral"
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic"
  specialty: string
  personality: string[]
  isUnlocked: boolean
  unlockedAt?: string
  description: string
  stats: {
    empathy: number
    intelligence: number
    creativity: number
    humor: number
  }
}

// Sample character data
const characters: Character[] = [
  {
    id: "avelyn",
    name: "Avelyn",
    tagline: "Keeper of Hearts & Romantic Secrets",
    icon: "💕",
    category: "starter",
    unlockLevel: 1,
    unlockCondition: "Available from start",
    unlockMethod: "level",
    rarity: "common",
    specialty: "Romance & Relationships",
    personality: ["Warm", "Empathetic", "Romantic", "Caring"],
    isUnlocked: true,
    unlockedAt: "2024-01-15",
    description:
      "Avelyn specializes in matters of the heart, helping you find the perfect romantic gifts and gestures that speak volumes about your love.",
    stats: { empathy: 95, intelligence: 80, creativity: 85, humor: 70 },
  },
  {
    id: "galen",
    name: "Galen",
    tagline: "Tech Wizard & Innovation Oracle",
    icon: "🤖",
    category: "starter",
    unlockLevel: 1,
    unlockCondition: "Available from start",
    unlockMethod: "level",
    rarity: "common",
    specialty: "Technology & Gadgets",
    personality: ["Analytical", "Innovative", "Precise", "Forward-thinking"],
    isUnlocked: true,
    unlockedAt: "2024-01-15",
    description:
      "Galen is your go-to expert for all things tech, from the latest gadgets to cutting-edge innovations that will amaze any tech enthusiast.",
    stats: { empathy: 60, intelligence: 98, creativity: 90, humor: 75 },
  },
  {
    id: "zola",
    name: "Zola",
    tagline: "Curator of Luxury & Refined Taste",
    icon: "👑",
    category: "premium",
    unlockLevel: 10,
    unlockCondition: "Reach Level 10",
    unlockMethod: "level",
    rarity: "rare",
    specialty: "Luxury & Premium Gifts",
    personality: ["Sophisticated", "Exclusive", "Refined", "Elegant"],
    isUnlocked: true,
    unlockedAt: "2024-02-01",
    description:
      "Zola brings sophistication and exclusivity to your gifting, with access to premium and luxury items that make unforgettable impressions.",
    stats: { empathy: 75, intelligence: 88, creativity: 92, humor: 65 },
  },
  {
    id: "phoenix",
    name: "Phoenix",
    tagline: "Master of Last-Minute Magic",
    icon: "🔥",
    category: "premium",
    unlockLevel: 25,
    unlockCondition: "Complete 50 gift recommendations",
    unlockMethod: "achievement",
    rarity: "epic",
    specialty: "Emergency & Last-Minute Gifts",
    personality: ["Quick-thinking", "Resourceful", "Energetic", "Reliable"],
    isUnlocked: false,
    description:
      "Phoenix specializes in saving the day when you need the perfect gift at the last minute, with lightning-fast solutions and creative alternatives.",
    stats: { empathy: 80, intelligence: 85, creativity: 95, humor: 88 },
  },
  {
    id: "sage",
    name: "Sage",
    tagline: "Wisdom Keeper & Tradition Guardian",
    icon: "🧙‍♂️",
    category: "legendary",
    unlockLevel: 50,
    unlockCondition: "Reach Agent 00G tier",
    unlockMethod: "purchase",
    rarity: "legendary",
    specialty: "Traditional & Cultural Gifts",
    personality: ["Wise", "Thoughtful", "Cultural", "Respectful"],
    isUnlocked: false,
    description:
      "Sage brings deep cultural knowledge and traditional wisdom to help you find gifts that honor heritage, customs, and meaningful traditions.",
    stats: { empathy: 90, intelligence: 95, creativity: 80, humor: 70 },
  },
  {
    id: "nova",
    name: "Nova",
    tagline: "Trendsetter & Social Media Savant",
    icon: "⭐",
    category: "seasonal",
    unlockLevel: 15,
    unlockCondition: "Share 10 gifts on social media",
    unlockMethod: "achievement",
    rarity: "rare",
    specialty: "Trending & Viral Gifts",
    personality: ["Trendy", "Social", "Energetic", "Influential"],
    isUnlocked: false,
    description:
      "Nova keeps you ahead of the curve with the latest trending gifts and viral sensations that will make you the talk of social media.",
    stats: { empathy: 70, intelligence: 82, creativity: 98, humor: 92 },
  },
  {
    id: "echo",
    name: "Echo",
    tagline: "Memory Weaver & Nostalgia Expert",
    icon: "🎭",
    category: "special",
    unlockLevel: 30,
    unlockCondition: "Create 25 personalized gift stories",
    unlockMethod: "achievement",
    rarity: "epic",
    specialty: "Nostalgic & Memory-Based Gifts",
    personality: ["Sentimental", "Thoughtful", "Creative", "Emotional"],
    isUnlocked: false,
    description:
      "Echo specializes in gifts that capture memories and create lasting emotional connections through personalized and nostalgic experiences.",
    stats: { empathy: 98, intelligence: 75, creativity: 90, humor: 65 },
  },
  {
    id: "frost",
    name: "Frost",
    tagline: "Winter Wonderland Specialist",
    icon: "❄️",
    category: "seasonal",
    unlockLevel: 5,
    unlockCondition: "Active during Winter 2024",
    unlockMethod: "event",
    rarity: "rare",
    specialty: "Holiday & Winter Gifts",
    personality: ["Festive", "Cozy", "Magical", "Cheerful"],
    isUnlocked: false,
    description:
      "Frost brings the magic of winter holidays to your gifting, specializing in cozy, festive, and seasonally perfect presents.",
    stats: { empathy: 85, intelligence: 70, creativity: 88, humor: 80 },
  },
  {
    id: "blaze",
    name: "Blaze",
    tagline: "Adventure Seeker & Experience Creator",
    icon: "🏔️",
    category: "premium",
    unlockLevel: 20,
    unlockCondition: "Book 5 experience gifts",
    unlockMethod: "achievement",
    rarity: "epic",
    specialty: "Adventure & Experience Gifts",
    personality: ["Adventurous", "Bold", "Inspiring", "Active"],
    isUnlocked: false,
    description:
      "Blaze specializes in thrilling experiences and adventure gifts that create unforgettable memories and push boundaries.",
    stats: { empathy: 75, intelligence: 80, creativity: 95, humor: 85 },
  },
  {
    id: "mystic",
    name: "Mystic",
    tagline: "Fortune Teller & Cosmic Guide",
    icon: "🔮",
    category: "legendary",
    unlockLevel: 100,
    unlockCondition: "Refer 50 friends",
    unlockMethod: "referral",
    rarity: "mythic",
    specialty: "Spiritual & Mystical Gifts",
    personality: ["Mysterious", "Intuitive", "Spiritual", "Wise"],
    isUnlocked: false,
    description:
      "Mystic brings cosmic wisdom and spiritual insight to help you find gifts that align with the universe and touch the soul.",
    stats: { empathy: 88, intelligence: 92, creativity: 85, humor: 60 },
  },
]

const rarityColors = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-yellow-600",
  mythic: "from-pink-400 to-pink-600",
}

const rarityBadgeColors = {
  common: "bg-gray-100 text-gray-800 border-gray-300",
  rare: "bg-blue-100 text-blue-800 border-blue-300",
  epic: "bg-purple-100 text-purple-800 border-purple-300",
  legendary: "bg-yellow-100 text-yellow-800 border-yellow-300",
  mythic: "bg-pink-100 text-pink-800 border-pink-300",
}

const categoryIcons = {
  starter: <Star className="h-4 w-4" />,
  premium: <Crown className="h-4 w-4" />,
  legendary: <Sparkles className="h-4 w-4" />,
  seasonal: <Zap className="h-4 w-4" />,
  special: <Heart className="h-4 w-4" />,
}

export default function CharactersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filteredCharacters, setFilteredCharacters] = useState(characters)
  const { hasAccess } = useFeatureAccess("character_collection")

  useEffect(() => {
    let filtered = characters

    if (searchTerm) {
      filtered = filtered.filter(
        (character) =>
          character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          character.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
          character.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((character) => character.category === selectedCategory)
    }

    setFilteredCharacters(filtered)
  }, [searchTerm, selectedCategory])

  const handleCharacterClick = (character: Character) => {
    if (character.isUnlocked) {
      // Future: Navigate to character detail page
      console.log("Opening character details for:", character.name)
    } else {
      // Show unlock requirements
      console.log("Character locked:", character.unlockCondition)
    }
  }

  const getUnlockButton = (character: Character) => {
    if (character.isUnlocked) return null

    switch (character.unlockMethod) {
      case "level":
        return (
          <Button size="sm" variant="outline" className="mt-2 bg-transparent">
            Reach Level {character.unlockLevel}
          </Button>
        )
      case "purchase":
        return (
          <Button
            size="sm"
            className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Upgrade Tier
          </Button>
        )
      case "achievement":
        return (
          <Button size="sm" variant="outline" className="mt-2 bg-transparent">
            Complete Achievement
          </Button>
        )
      case "event":
        return (
          <Button size="sm" variant="outline" className="mt-2 bg-transparent">
            Wait for Event
          </Button>
        )
      case "referral":
        return (
          <Button size="sm" variant="outline" className="mt-2 bg-transparent">
            Refer Friends
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-4">
            Character Collection
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover and unlock unique AI personas, each with their own specialty and personality. Build your collection
            and access exclusive gifting expertise.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{characters.filter((c) => c.isUnlocked).length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Unlocked</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{characters.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {
                  characters
                    .filter((c) => c.rarity === "legendary" || c.rarity === "mythic")
                    .filter((c) => c.isUnlocked).length
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Legendary+</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((characters.filter((c) => c.isUnlocked).length / characters.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search characters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="starter">Starter</TabsTrigger>
              <TabsTrigger value="premium">Premium</TabsTrigger>
              <TabsTrigger value="legendary">Legendary</TabsTrigger>
              <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
              <TabsTrigger value="special">Special</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCharacters.map((character) => (
            <Card
              key={character.id}
              className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                character.isUnlocked
                  ? "bg-white dark:bg-gray-800 border-2 border-transparent hover:border-purple-300"
                  : "bg-gray-100 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700"
              }`}
              onClick={() => handleCharacterClick(character)}
            >
              <CardContent className="p-6">
                {/* Character Icon */}
                <div className="relative mb-4">
                  <div
                    className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl ${
                      character.isUnlocked
                        ? `bg-gradient-to-br ${rarityColors[character.rarity]} text-white shadow-lg`
                        : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    } ${!character.isUnlocked ? "grayscale" : ""}`}
                  >
                    {character.isUnlocked ? character.icon : "🔒"}
                  </div>

                  {/* Rarity Badge */}
                  <Badge className={`absolute -top-2 -right-2 text-xs ${rarityBadgeColors[character.rarity]} border`}>
                    {character.rarity.charAt(0).toUpperCase() + character.rarity.slice(1)}
                  </Badge>

                  {/* Category Icon */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border">
                      {categoryIcons[character.category]}
                    </div>
                  </div>

                  {/* Lock Overlay */}
                  {!character.isUnlocked && (
                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Character Info */}
                <div className="text-center">
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      character.isUnlocked ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {character.name}
                  </h3>

                  <p
                    className={`text-sm mb-3 ${
                      character.isUnlocked ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {character.tagline}
                  </p>

                  <div
                    className={`text-xs mb-3 ${
                      character.isUnlocked ? "text-gray-600 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {character.specialty}
                  </div>

                  {/* Personality Tags */}
                  {character.isUnlocked && (
                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                      {character.personality.slice(0, 2).map((trait) => (
                        <Badge key={trait} variant="secondary" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Unlock Status */}
                  {character.isUnlocked ? (
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ Unlocked {character.unlockedAt && `• ${new Date(character.unlockedAt).toLocaleDateString()}`}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{character.unlockCondition}</div>
                      {getUnlockButton(character)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCharacters.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No characters found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Feature Access Gate */}
        {!hasAccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardContent className="p-6 text-center">
                <Lock className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="text-xl font-bold mb-2">Character Collection Locked</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Upgrade to Premium Spy or higher to unlock the full character collection and build your AI persona
                  team.
                </p>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
