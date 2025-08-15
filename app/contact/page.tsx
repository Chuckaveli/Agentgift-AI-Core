"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Clock, Send, MessageSquare, Phone, MapPin } from "lucide-react"
import { toast } from "sonner"

const departments = [
  {
    id: "magic",
    name: "Main Support",
    email: "magic@agentgift.ai",
    description: "General inquiries and main support",
    icon: "🛟",
    responseTime: "12-24 hours",
    priority: "high",
  },
  {
    id: "rescue",
    name: "Gift Recovery",
    email: "rescue@agentgift.ai",
    description: "Support, troubleshooting, failed gift recovery",
    icon: "🛟",
    responseTime: "24-48 hours",
    priority: "urgent",
  },
  {
    id: "signals",
    name: "Marketing & Campaigns",
    email: "signals@agentgift.ai",
    description: "Marketing, launches, campaigns",
    icon: "📡",
    responseTime: "1-2 business days",
    priority: "medium",
  },
  {
    id: "receipts",
    name: "Billing & Finance",
    email: "receipts@agentgift.ai",
    description: "Billing, invoice questions, vendor confirmations",
    icon: "💰",
    responseTime: "1-2 business days",
    priority: "high",
  },
  {
    id: "allies",
    name: "Partnerships",
    email: "allies@agentgift.ai",
    description: "Partnerships, influencer collabs, affiliate outreach",
    icon: "🤝",
    responseTime: "2-3 business days",
    priority: "medium",
  },
  {
    id: "elite",
    name: "VIP Concierge",
    email: "elite@agentgift.ai",
    description: "VIP/Pro+ concierge support, high-tier users",
    icon: "🥂",
    responseTime: "4-8 hours",
    priority: "urgent",
  },
  {
    id: "intel",
    name: "Content & Intelligence",
    email: "intel@agentgift.ai",
    description: "Newsletter, blog drops, AI-powered gift tips",
    icon: "🧠",
    responseTime: "2-3 business days",
    priority: "low",
  },
]

const priorityColors = {
  urgent: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-blue-100 text-blue-800 border-blue-200",
  low: "bg-gray-100 text-gray-800 border-gray-200",
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    subject: "",
    message: "",
    priority: "medium",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success("Message sent successfully! We'll get back to you soon.", {
        description: `Your message has been forwarded to ${departments.find((d) => d.id === formData.department)?.name || "our team"}.`,
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        department: "",
        subject: "",
        message: "",
        priority: "medium",
      })
    } catch (error) {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedDepartment = departments.find((d) => d.id === formData.department)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question, need support, or want to partner with us? Choose the right department below and we'll get
            back to you quickly.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll route your message to the right team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Department Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleInputChange("department", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select the best department for your inquiry" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            <div className="flex items-center gap-2">
                              <span>{dept.icon}</span>
                              <span>{dept.name}</span>
                              <Badge
                                variant="outline"
                                className={`ml-auto text-xs ${priorityColors[dept.priority as keyof typeof priorityColors]}`}
                              >
                                {dept.responseTime}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedDepartment && (
                      <p className="text-sm text-gray-600 mt-1">{selectedDepartment.description}</p>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Brief description of your inquiry"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Please provide as much detail as possible..."
                      rows={6}
                      required
                    />
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - General inquiry</SelectItem>
                        <SelectItem value="medium">Medium - Standard support</SelectItem>
                        <SelectItem value="high">High - Important issue</SelectItem>
                        <SelectItem value="urgent">Urgent - Critical problem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Department Quick Reference */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Our Departments</CardTitle>
                <CardDescription>Quick reference for choosing the right contact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {departments.map((dept, index) => (
                  <div key={dept.id}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{dept.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{dept.name}</h4>
                          <Badge
                            variant="outline"
                            className={`text-xs ${priorityColors[dept.priority as keyof typeof priorityColors]}`}
                          >
                            {dept.responseTime}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{dept.description}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{dept.email}</span>
                        </div>
                      </div>
                    </div>
                    {index < departments.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Other Ways to Reach Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="font-medium text-sm">Phone Support</p>
                    <p className="text-xs text-gray-600">Coming soon for Pro+ users</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="font-medium text-sm">Headquarters</p>
                    <p className="text-xs text-gray-600">Remote-first company</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="font-medium text-sm">Response Times</p>
                    <p className="text-xs text-gray-600">Vary by department & priority</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Need Quick Answers?</h3>
                <p className="text-sm text-purple-100 mb-4">
                  Check our FAQ section for instant answers to common questions.
                </p>
                <Button variant="secondary" size="sm" className="w-full">
                  View FAQ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

