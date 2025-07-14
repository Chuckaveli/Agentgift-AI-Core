"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, CalendarIcon, Edit, Trash2, Building, Star, Gift, Users } from "lucide-react"
import { format } from "date-fns"

interface CustomHoliday {
  id: string
  name: string
  date: string
  description: string
  gift_traditions: string[]
  color_themes: string[]
  xp_bonus_multiplier: number
  is_company_wide: boolean
  created_by: string
  created_at: string
}

export default function BusinessCustomHolidaysPage() {
  const [holidays, setHolidays] = useState<CustomHoliday[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<CustomHoliday | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
    gift_traditions: "",
    color_themes: "",
    xp_bonus_multiplier: 1.5,
    is_company_wide: true,
  })

  useEffect(() => {
    loadCustomHolidays()
  }, [])

  const loadCustomHolidays = async () => {
    // In a real app, fetch from Supabase
    const mockHolidays: CustomHoliday[] = [
      {
        id: "1",
        name: "Company Anniversary",
        date: "2024-03-15",
        description: "Celebrating 10 years of innovation and growth",
        gift_traditions: ["team_gifts", "recognition_awards", "celebration_lunch"],
        color_themes: ["blue", "gold", "white"],
        xp_bonus_multiplier: 2.0,
        is_company_wide: true,
        created_by: "admin",
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Innovation Week",
        date: "2024-04-22",
        description: "Week-long celebration of creativity and innovation",
        gift_traditions: ["tech_gadgets", "books", "creative_tools"],
        color_themes: ["purple", "green", "silver"],
        xp_bonus_multiplier: 1.8,
        is_company_wide: true,
        created_by: "admin",
        created_at: "2024-01-01T00:00:00Z",
      },
    ]
    setHolidays(mockHolidays)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newHoliday: CustomHoliday = {
      id: Date.now().toString(),
      name: formData.name,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      description: formData.description,
      gift_traditions: formData.gift_traditions.split(",").map((t) => t.trim()),
      color_themes: formData.color_themes.split(",").map((c) => c.trim()),
      xp_bonus_multiplier: formData.xp_bonus_multiplier,
      is_company_wide: formData.is_company_wide,
      created_by: "current_user",
      created_at: new Date().toISOString(),
    }

    if (editingHoliday) {
      setHolidays((prev) =>
        prev.map((h) => (h.id === editingHoliday.id ? { ...newHoliday, id: editingHoliday.id } : h)),
      )
      setEditingHoliday(null)
    } else {
      setHolidays((prev) => [...prev, newHoliday])
    }

    // Reset form
    setFormData({
      name: "",
      date: "",
      description: "",
      gift_traditions: "",
      color_themes: "",
      xp_bonus_multiplier: 1.5,
      is_company_wide: true,
    })
    setSelectedDate(undefined)
    setIsCreating(false)
  }

  const handleEdit = (holiday: CustomHoliday) => {
    setEditingHoliday(holiday)
    setFormData({
      name: holiday.name,
      date: holiday.date,
      description: holiday.description,
      gift_traditions: holiday.gift_traditions.join(", "),
      color_themes: holiday.color_themes.join(", "),
      xp_bonus_multiplier: holiday.xp_bonus_multiplier,
      is_company_wide: holiday.is_company_wide,
    })
    setSelectedDate(new Date(holiday.date))
    setIsCreating(true)
  }

  const handleDelete = (holidayId: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== holidayId))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Custom Company Holidays
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage your organization's special celebrations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{holidays.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Holidays</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {holidays.filter((h) => h.is_company_wide).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Company-Wide</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.max(...holidays.map((h) => h.xp_bonus_multiplier), 0).toFixed(1)}x
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Max XP Bonus</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {holidays.reduce((acc, h) => acc + h.gift_traditions.length, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Gift Traditions</div>
            </CardContent>
          </Card>
        </div>

        {/* Create/Edit Form */}
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                {editingHoliday ? "Edit Holiday" : "Create New Holiday"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Holiday Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Company Anniversary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the significance of this holiday..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gift_traditions">Gift Traditions</Label>
                    <Input
                      id="gift_traditions"
                      value={formData.gift_traditions}
                      onChange={(e) => setFormData((prev) => ({ ...prev, gift_traditions: e.target.value }))}
                      placeholder="team_gifts, awards, celebration_items"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Separate multiple traditions with commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color_themes">Color Themes</Label>
                    <Input
                      id="color_themes"
                      value={formData.color_themes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, color_themes: e.target.value }))}
                      placeholder="blue, gold, white"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Separate multiple colors with commas</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="xp_bonus">XP Bonus Multiplier</Label>
                    <Select
                      value={formData.xp_bonus_multiplier.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, xp_bonus_multiplier: Number.parseFloat(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.2">1.2x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="1.8">1.8x</SelectItem>
                        <SelectItem value="2.0">2.0x</SelectItem>
                        <SelectItem value="2.5">2.5x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scope">Scope</Label>
                    <Select
                      value={formData.is_company_wide.toString()}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, is_company_wide: value === "true" }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Company-Wide</SelectItem>
                        <SelectItem value="false">Department Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {editingHoliday ? "Update Holiday" : "Create Holiday"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false)
                      setEditingHoliday(null)
                      setFormData({
                        name: "",
                        date: "",
                        description: "",
                        gift_traditions: "",
                        color_themes: "",
                        xp_bonus_multiplier: 1.5,
                        is_company_wide: true,
                      })
                      setSelectedDate(undefined)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Add Holiday Button */}
        {!isCreating && (
          <div className="text-center">
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Holiday
            </Button>
          </div>
        )}

        {/* Holidays List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {holidays.map((holiday) => (
            <Card key={holiday.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{holiday.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(holiday)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(holiday.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {new Date(holiday.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm">{holiday.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Gift Traditions</h4>
                  <div className="flex flex-wrap gap-1">
                    {holiday.gift_traditions.map((tradition, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tradition.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Color Themes</h4>
                  <div className="flex gap-2">
                    {holiday.color_themes.map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {holiday.xp_bonus_multiplier}x XP
                  </Badge>
                  <div className="flex items-center gap-1">
                    {holiday.is_company_wide ? (
                      <Building className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Users className="w-4 h-4 text-green-600" />
                    )}
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {holiday.is_company_wide ? "Company-Wide" : "Department"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {holidays.length === 0 && !isCreating && (
          <Card className="text-center py-12">
            <CardContent>
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Custom Holidays Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first company holiday to start building your organization's gift-giving culture.
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Holiday
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
