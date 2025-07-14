"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserTierGate } from "@/components/global/user-tier-gate"
import { LockedPreview } from "@/components/global/locked-preview"
import { CalendarIcon, Bell, Plus, Heart, GiftIcon as Gift2, Cake, Sparkles, Clock, User, Bot } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { TIERS, type UserTier, XPEngine, CreditSystem } from "@/lib/global-logic"
import { triggerXPGain, triggerBadgeUnlock } from "@/components/global/toast-badge-notifier"

interface Reminder {
  id: string
  recipientName: string
  recipientEmail?: string
  date: Date
  title: string
  type: "birthday" | "anniversary" | "holiday" | "just-because"
  priorityLevel: "low" | "medium" | "high" | "urgent"
  notes?: string
  aiRecommendedGift?: string
  isCompleted: boolean
  notificationSent: boolean
}

interface ReminderSchedulerProps {
  userTier: UserTier
  userId: string
  userCredits: number
  onCreditsUpdate: (credits: number) => void
}

const reminderTypeIcons = {
  birthday: <Cake className="w-4 h-4" />,
  anniversary: <Heart className="w-4 h-4" />,
  holiday: <Gift2 className="w-4 h-4" />,
  "just-because": <Sparkles className="w-4 h-4" />,
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export default function ReminderScheduler({ userTier, userId, userCredits, onCreditsUpdate }: ReminderSchedulerProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    date: new Date(),
    title: "",
    type: "birthday" as const,
    priorityLevel: "medium" as const,
    notes: "",
  })

  const hasProAccess = userTier === TIERS.PRO_AGENT || userTier === TIERS.AGENT_00G

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = async () => {
    setIsLoading(true)
    try {
      // Simulate API call - in real app would fetch from Supabase
      const mockReminders: Reminder[] = [
        {
          id: "1",
          recipientName: "Sarah Johnson",
          recipientEmail: "sarah@example.com",
          date: new Date("2024-02-14"),
          title: "Valentine's Day Gift",
          type: "holiday",
          priorityLevel: "high",
          notes: "She loves chocolates and flowers",
          aiRecommendedGift: "Artisanal chocolate box with personalized note",
          isCompleted: false,
          notificationSent: false,
        },
        {
          id: "2",
          recipientName: "Mom",
          date: new Date("2024-03-15"),
          title: "Mom's Birthday",
          type: "birthday",
          priorityLevel: "urgent",
          notes: "Loves gardening and tea",
          isCompleted: false,
          notificationSent: false,
        },
      ]
      setReminders(mockReminders)
    } catch (error) {
      console.error("Error loading reminders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddReminder = async () => {
    if (!formData.recipientName || !formData.title) return

    setIsLoading(true)
    try {
      // Deduct credits for creating reminder
      const success = await CreditSystem.deductCredits(userId, 2, "Reminder created")
      if (!success) {
        alert("Insufficient credits")
        return
      }

      const newReminder: Reminder = {
        id: Date.now().toString(),
        ...formData,
        isCompleted: false,
        notificationSent: false,
      }

      setReminders((prev) => [...prev, newReminder])

      // Award XP
      await XPEngine.addXP(userId, 10, "Reminder created")
      triggerXPGain(10, "Reminder created")

      // Update credits
      onCreditsUpdate(userCredits - 2)

      // Reset form
      setFormData({
        recipientName: "",
        recipientEmail: "",
        date: new Date(),
        title: "",
        type: "birthday",
        priorityLevel: "medium",
        notes: "",
      })

      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Error adding reminder:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetAISuggestion = async (reminderId: string) => {
    if (!hasProAccess) return

    setIsLoading(true)
    try {
      // Deduct credits for AI suggestion
      const success = await CreditSystem.deductCredits(userId, 5, "AI gift suggestion")
      if (!success) {
        alert("Insufficient credits")
        return
      }

      // Simulate AI suggestion
      const suggestions = [
        "Personalized photo album with your favorite memories together",
        "Custom star map showing the night sky from a special date",
        "Subscription box matching their hobbies and interests",
        "Experience gift like a cooking class or wine tasting",
        "Handwritten letter collection from friends and family",
      ]

      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]

      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id === reminderId ? { ...reminder, aiRecommendedGift: randomSuggestion } : reminder,
        ),
      )

      // Award XP
      await XPEngine.addXP(userId, 15, "AI suggestion generated")
      triggerXPGain(15, "AI suggestion generated")

      // Update credits
      onCreditsUpdate(userCredits - 5)
    } catch (error) {
      console.error("Error getting AI suggestion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteReminder = async (reminderId: string) => {
    setReminders((prev) =>
      prev.map((reminder) => (reminder.id === reminderId ? { ...reminder, isCompleted: true } : reminder)),
    )

    // Award completion XP
    await XPEngine.addXP(userId, 25, "Reminder completed")
    triggerXPGain(25, "Reminder completed")

    // Check for badge unlock
    const completedCount = reminders.filter((r) => r.isCompleted).length + 1
    if (completedCount === 5) {
      triggerBadgeUnlock("Reminder Master", "Completed 5 gift reminders")
    }
  }

  const upcomingReminders = reminders
    .filter((r) => !r.isCompleted && r.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const completedReminders = reminders.filter((r) => r.isCompleted)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Smart Reminder Scheduler
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Never miss a special moment again with AI-powered gift reminders
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingReminders.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedReminders.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{reminders.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Add Reminder Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Reminders</h2>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    placeholder="Who is this gift for?"
                  />
                </div>

                <div>
                  <Label htmlFor="title">Gift Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Birthday Gift, Anniversary Surprise"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                        <SelectItem value="just-because">Just Because</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={formData.priorityLevel}
                      onValueChange={(value: any) => setFormData({ ...formData, priorityLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && setFormData({ ...formData, date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special details or preferences..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddReminder} disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Reminder"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Upcoming Reminders */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Reminders</h3>
          {upcomingReminders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming reminders</h3>
                <p className="text-gray-600 dark:text-gray-400">Create your first reminder to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingReminders.map((reminder) => (
                <Card key={reminder.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          {reminderTypeIcons[reminder.type]}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{reminder.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {reminder.recipientName}
                          </p>
                        </div>
                      </div>
                      <Badge className={priorityColors[reminder.priorityLevel]}>{reminder.priorityLevel}</Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {format(reminder.date, "PPP")}
                      </div>

                      {reminder.notes && <p className="text-sm text-gray-700 dark:text-gray-300">{reminder.notes}</p>}

                      {reminder.aiRecommendedGift && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Bot className="w-4 h-4 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-900 dark:text-purple-200">
                              AI Suggestion
                            </span>
                          </div>
                          <p className="text-sm text-purple-800 dark:text-purple-300">{reminder.aiRecommendedGift}</p>
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <UserTierGate
                          userTier={userTier}
                          requiredTier={TIERS.PRO_AGENT}
                          showPreview={false}
                          fallback={
                            <LockedPreview
                              featureName="AI Gift Suggestions"
                              requiredTier={TIERS.PRO_AGENT}
                              description="Get personalized gift recommendations"
                            />
                          }
                        >
                          {!reminder.aiRecommendedGift && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGetAISuggestion(reminder.id)}
                              disabled={isLoading}
                              className="text-purple-600 border-purple-200 hover:bg-purple-50"
                            >
                              <Bot className="w-4 h-4 mr-1" />
                              AI Suggest Gift
                            </Button>
                          )}
                        </UserTierGate>

                        <Button
                          size="sm"
                          onClick={() => handleCompleteReminder(reminder.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Mark Complete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Completed Reminders</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedReminders.map((reminder) => (
                <Card key={reminder.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        {reminderTypeIcons[reminder.type]}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{reminder.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{reminder.recipientName}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Completed
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
