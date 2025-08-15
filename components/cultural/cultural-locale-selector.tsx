"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown, Globe, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCulturalContext, type CulturalLocale } from "./cultural-context"

interface CulturalLocaleSelectorProps {
  className?: string
  variant?: "button" | "compact" | "full"
  showRegions?: boolean
  showCurrency?: boolean
  showTimezone?: boolean
}

export function CulturalLocaleSelector({
  className,
  variant = "button",
  showRegions = true,
  showCurrency = false,
  showTimezone = false,
}: CulturalLocaleSelectorProps) {
  const { currentLocale, setCurrentLocale, availableLocales, isLoading } = useCulturalContext()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Group locales by region
  const localesByRegion = availableLocales.reduce(
    (acc, locale) => {
      if (!acc[locale.region]) {
        acc[locale.region] = []
      }
      acc[locale.region].push(locale)
      return acc
    },
    {} as Record<string, CulturalLocale[]>,
  )

  // Filter locales based on search term
  const filteredLocales = availableLocales.filter(
    (locale) =>
      locale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locale.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locale.region.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleLocaleSelect = (locale: CulturalLocale) => {
    setCurrentLocale(locale)
    setOpen(false)
    setSearchTerm("")
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-6 h-6 bg-muted animate-pulse rounded" />
        <div className="w-24 h-4 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  // Compact variant - just flag and code
  if (variant === "compact") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-2 px-2", className)}
            aria-label={`Current locale: ${currentLocale.name}`}
          >
            <span className="text-lg">{currentLocale.flag}</span>
            <span className="text-xs font-mono">{currentLocale.code}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <LocaleCommandList
            locales={filteredLocales}
            currentLocale={currentLocale}
            onSelect={handleLocaleSelect}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showRegions={showRegions}
          />
        </PopoverContent>
      </Popover>
    )
  }

  // Button variant - flag, name, and dropdown
  if (variant === "button") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("justify-between gap-2", className)}
            aria-label={`Current locale: ${currentLocale.name}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentLocale.flag}</span>
              <span className="truncate">{currentLocale.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <LocaleCommandList
            locales={filteredLocales}
            currentLocale={currentLocale}
            onSelect={handleLocaleSelect}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showRegions={showRegions}
          />
        </PopoverContent>
      </Popover>
    )
  }

  // Full variant - detailed dialog
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("justify-between gap-2", className)}>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{currentLocale.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Cultural & Language Settings
          </DialogTitle>
          <DialogDescription>
            Choose your preferred language, region, and cultural settings for a personalized gifting experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Selection */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <Label className="text-sm font-medium">Current Selection</Label>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl">{currentLocale.flag}</span>
              <div>
                <div className="font-medium">{currentLocale.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span>Region: {currentLocale.region}</span>
                  {showCurrency && currentLocale.currency && <span>Currency: {currentLocale.currency}</span>}
                  {showTimezone && currentLocale.timezone && <span>Timezone: {currentLocale.timezone}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search languages, countries, or regions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Locale List */}
          <div className="max-h-96 overflow-auto">
            {showRegions ? (
              <div className="space-y-4">
                {Object.entries(localesByRegion).map(([region, locales]) => {
                  const filteredRegionLocales = locales.filter(
                    (locale) =>
                      locale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      locale.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      region.toLowerCase().includes(searchTerm.toLowerCase()),
                  )

                  if (filteredRegionLocales.length === 0) return null

                  return (
                    <div key={region}>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm">{region}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {filteredRegionLocales.length}
                        </Badge>
                      </div>
                      <div className="grid gap-1">
                        {filteredRegionLocales.map((locale) => (
                          <LocaleItem
                            key={locale.code}
                            locale={locale}
                            isSelected={locale.code === currentLocale.code}
                            onSelect={() => handleLocaleSelect(locale)}
                            showCurrency={showCurrency}
                            showTimezone={showTimezone}
                          />
                        ))}
                      </div>
                      <Separator className="mt-3" />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="grid gap-1">
                {filteredLocales.map((locale) => (
                  <LocaleItem
                    key={locale.code}
                    locale={locale}
                    isSelected={locale.code === currentLocale.code}
                    onSelect={() => handleLocaleSelect(locale)}
                    showCurrency={showCurrency}
                    showTimezone={showTimezone}
                  />
                ))}
              </div>
            )}

            {filteredLocales.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No locales found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Command list component for popover variants
function LocaleCommandList({
  locales,
  currentLocale,
  onSelect,
  searchTerm,
  onSearchChange,
  showRegions,
}: {
  locales: CulturalLocale[]
  currentLocale: CulturalLocale
  onSelect: (locale: CulturalLocale) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  showRegions: boolean
}) {
  const localesByRegion = locales.reduce(
    (acc, locale) => {
      if (!acc[locale.region]) {
        acc[locale.region] = []
      }
      acc[locale.region].push(locale)
      return acc
    },
    {} as Record<string, CulturalLocale[]>,
  )

  return (
    <Command>
      <CommandInput placeholder="Search locales..." value={searchTerm} onValueChange={onSearchChange} />
      <CommandList>
        <CommandEmpty>No locales found.</CommandEmpty>
        {showRegions ? (
          Object.entries(localesByRegion).map(([region, regionLocales]) => (
            <CommandGroup key={region} heading={region}>
              {regionLocales.map((locale) => (
                <CommandItem
                  key={locale.code}
                  value={`${locale.name} ${locale.country} ${locale.region}`}
                  onSelect={() => onSelect(locale)}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg">{locale.flag}</span>
                  <span className="flex-1">{locale.name}</span>
                  {locale.code === currentLocale.code && <Check className="h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          ))
        ) : (
          <CommandGroup>
            {locales.map((locale) => (
              <CommandItem
                key={locale.code}
                value={`${locale.name} ${locale.country} ${locale.region}`}
                onSelect={() => onSelect(locale)}
                className="flex items-center gap-2"
              >
                <span className="text-lg">{locale.flag}</span>
                <span className="flex-1">{locale.name}</span>
                {locale.code === currentLocale.code && <Check className="h-4 w-4" />}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}

// Individual locale item component
function LocaleItem({
  locale,
  isSelected,
  onSelect,
  showCurrency,
  showTimezone,
}: {
  locale: CulturalLocale
  isSelected: boolean
  onSelect: () => void
  showCurrency?: boolean
  showTimezone?: boolean
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted/50",
        isSelected && "bg-primary/10 border border-primary/20",
      )}
    >
      <span className="text-xl">{locale.flag}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{locale.name}</div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>{locale.region}</span>
          {showCurrency && locale.currency && (
            <>
              <span>•</span>
              <span>{locale.currency}</span>
            </>
          )}
          {showTimezone && locale.timezone && (
            <>
              <span>•</span>
              <span className="truncate">{locale.timezone}</span>
            </>
          )}
        </div>
      </div>
      {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
    </button>
  )
}

