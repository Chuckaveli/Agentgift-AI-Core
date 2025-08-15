"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ChevronDown, Volume2, Heart, Cpu, Sparkles, Check, Mic } from "lucide-react"
import { usePersona } from "./persona-context"
import { cn } from "@/lib/utils"

interface PersonaSelectorProps {
  variant?: "dropdown" | "carousel" | "grid"
  size?: "sm" | "md" | "lg"
  showVoicePreview?: boolean
  showDescription?: boolean
  className?: string
}

export function PersonaSelector({
  variant = "dropdown",
  size = "md",
  showVoicePreview = true,
  showDescription = true,
  className,
}: PersonaSelectorProps) {
  const { currentPersona, setPersona, personas, isLoading } = usePersona()
  const [isPlaying, setIsPlaying] = useState<string | null>(null)

  const playVoicePreview = async (personaId: string) => {
    if (isPlaying === personaId) {
      setIsPlaying(null)
      return
    }

    setIsPlaying(personaId)

    // Simulate voice preview with ElevenLabs integration
    try {
      // In a real implementation, you would call ElevenLabs API here
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error("Voice preview failed:", error)
    } finally {
      setIsPlaying(null)
    }
  }

  const handlePersonaSelect = (personaId: string) => {
    setPersona(personaId)
  }

  const getPersonaIcon = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case "romance & relationships":
        return Heart
      case "tech & gadgets":
        return Cpu
      case "luxury & premium":
        return Sparkles
      default:
        return Heart
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          avatar: "h-8 w-8",
          text: "text-sm",
          badge: "text-xs",
          button: "h-8",
        }
      case "lg":
        return {
          avatar: "h-12 w-12",
          text: "text-lg",
          badge: "text-sm",
          button: "h-12",
        }
      default:
        return {
          avatar: "h-10 w-10",
          text: "text-base",
          badge: "text-xs",
          button: "h-10",
        }
    }
  }

  const sizeClasses = getSizeClasses()

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-between gap-2 bg-gradient-to-r",
              currentPersona?.theme.gradient,
              "text-white border-0 hover:opacity-90",
              sizeClasses.button,
              className,
            )}
          >
            <div className="flex items-center gap-2">
              <Avatar className={sizeClasses.avatar}>
                <AvatarImage src={currentPersona?.avatar || "/placeholder.svg"} alt={currentPersona?.name} />
                <AvatarFallback className="bg-white/20 text-white">{currentPersona?.name[0]}</AvatarFallback>
              </Avatar>
              <span className={cn("font-medium", sizeClasses.text)}>{currentPersona?.name}</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-2">
          {personas.map((persona) => {
            const Icon = getPersonaIcon(persona.specialty)
            return (
              <DropdownMenuItem
                key={persona.id}
                onClick={() => handlePersonaSelect(persona.id)}
                className="p-3 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-800"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={cn("p-1 rounded-full bg-gradient-to-r", persona.theme.gradient)}>
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage src={persona.avatar || "/placeholder.svg"} alt={persona.name} />
                      <AvatarFallback className="bg-white text-purple-600 font-bold">{persona.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{persona.name}</span>
                      <Icon className="h-4 w-4 text-gray-500" />
                      {currentPersona?.id === persona.id && <Check className="h-4 w-4 text-green-500" />}
                    </div>
                    {showDescription && <p className="text-sm text-gray-500 mt-1">{persona.specialty}</p>}
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {persona.tone}
                    </Badge>
                  </div>

                  {showVoicePreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        playVoicePreview(persona.id)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      {isPlaying === persona.id ? (
                        <div className="h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === "carousel") {
    return (
      <div className={cn("w-full max-w-md mx-auto", className)}>
        <Carousel className="w-full">
          <CarouselContent>
            {personas.map((persona) => {
              const Icon = getPersonaIcon(persona.specialty)
              const isSelected = currentPersona?.id === persona.id

              return (
                <CarouselItem key={persona.id}>
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-300 border-2",
                      isSelected ? "border-purple-500 shadow-lg scale-105" : "border-gray-200 hover:border-gray-300",
                    )}
                    onClick={() => handlePersonaSelect(persona.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={cn("mx-auto mb-4 p-2 rounded-full bg-gradient-to-r", persona.theme.gradient)}>
                        <Avatar className="h-16 w-16 border-4 border-white mx-auto">
                          <AvatarImage src={persona.avatar || "/placeholder.svg"} alt={persona.name} />
                          <AvatarFallback className="bg-white text-purple-600 font-bold text-xl">
                            {persona.name[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <h3 className="font-bold text-lg mb-2 flex items-center justify-center gap-2">
                        {persona.name}
                        <Icon className="h-5 w-5 text-gray-500" />
                      </h3>

                      {showDescription && <p className="text-sm text-gray-600 mb-3">{persona.specialty}</p>}

                      <Badge variant="secondary" className="mb-3">
                        {persona.tone}
                      </Badge>

                      {showVoicePreview && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            playVoicePreview(persona.id)
                          }}
                          className="w-full"
                        >
                          {isPlaying === persona.id ? (
                            <>
                              <div className="h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2" />
                              Playing...
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4 mr-2" />
                              Voice Preview
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    )
  }

  // Grid variant
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {personas.map((persona) => {
        const Icon = getPersonaIcon(persona.specialty)
        const isSelected = currentPersona?.id === persona.id

        return (
          <Card
            key={persona.id}
            className={cn(
              "cursor-pointer transition-all duration-300 border-2",
              isSelected ? "border-purple-500 shadow-lg" : "border-gray-200 hover:border-gray-300",
            )}
            onClick={() => handlePersonaSelect(persona.id)}
          >
            <CardContent className="p-4 text-center">
              <div className={cn("mx-auto mb-3 p-1 rounded-full bg-gradient-to-r", persona.theme.gradient)}>
                <Avatar className="h-12 w-12 border-2 border-white mx-auto">
                  <AvatarImage src={persona.avatar || "/placeholder.svg"} alt={persona.name} />
                  <AvatarFallback className="bg-white text-purple-600 font-bold">{persona.name[0]}</AvatarFallback>
                </Avatar>
              </div>

              <h3 className="font-medium mb-1 flex items-center justify-center gap-1">
                {persona.name}
                <Icon className="h-4 w-4 text-gray-500" />
                {isSelected && <Check className="h-4 w-4 text-green-500" />}
              </h3>

              {showDescription && <p className="text-xs text-gray-600 mb-2">{persona.specialty}</p>}

              <Badge variant="secondary" className="text-xs mb-2">
                {persona.tone}
              </Badge>

              {showVoicePreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    playVoicePreview(persona.id)
                  }}
                  className="h-6 w-6 p-0"
                >
                  {isPlaying === persona.id ? (
                    <div className="h-3 w-3 border border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

