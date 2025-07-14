"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, Shield, Users, Briefcase, HelpCircle, Clock, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const departments = [
    {
      id: "support",
      name: "General Support",
      email: "support@agentgift.ai",
      icon: HelpCircle,
      description: "Account issues, feature questions, technical problems",
      responseTime: "24-48 hours",
    },
    {
      id: "business",
      name: "Business Inquiries",
      email: "business@agentgift.ai",
      icon: Briefcase,
      description: "Enterprise solutions, partnerships, bulk licensing",
      responseTime: "1-2 business days",
    },
    {
      id: "privacy",
      name: "Privacy & Security",
      email: "privacy@agentgift.ai",
      icon: Shield,
      description: "Data requests, privacy concerns, security reports",
      responseTime: "2-3 business days",
    },
    {
      id: "community",
      name: "Community & Social",
      email: "community@agentgift.ai",
      icon: Users,
      description: "Social media verification, community guidelines, events",
      responseTime: "1-2 business days",
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", { ...formData, department: selectedDepartment })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Contact & Support
          </h1>
          <p className="text-gray-600 text-lg">Get help with your AgentGift.ai experience</p>
          <Badge variant="outline" className="mt-2">
            <Clock className="h-3 w-3 mr-1" />
            Average response: 24-48 hours
          </Badge>
        </div>

        {/* Quick Help */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Quick Help
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium mb-1">FAQ</h3>
                <p className="text-sm text-gray-600 mb-3">Common questions and answers</p>
                <Button variant="outline" size="sm">
                  View FAQ
                </Button>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <HelpCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Help Center</h3>
                <p className="text-sm text-gray-600 mb-3">Guides and tutorials</p>
                <Button variant="outline" size="sm">
                  Browse Guides
                </Button>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Community</h3>
                <p className="text-sm text-gray-600 mb-3">Connect with other users</p>
                <Button variant="outline" size="sm">
                  Join Discord
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Choose Your Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {departments.map((dept) => {
                const Icon = dept.icon
                return (
                  <div
                    key={dept.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedDepartment === dept.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedDepartment(dept.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`h-6 w-6 mt-1 ${selectedDepartment === dept.id ? "text-blue-600" : "text-gray-500"}`}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{dept.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{dept.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {dept.email}
                          </Badge>
                          <span className="text-xs text-gray-500">{dept.responseTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your inquiry"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please provide details about your question or issue..."
                  rows={6}
                  required
                />
              </div>

              {selectedDepartment && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Selected Department:</strong> {departments.find((d) => d.id === selectedDepartment)?.name}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Expected response time: {departments.find((d) => d.id === selectedDepartment)?.responseTime}
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!selectedDepartment}>
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Emergency & Security Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-2">For urgent security issues or data breaches:</p>
              <p className="text-red-700 text-sm mb-3">
                Contact our security team immediately at{" "}
                <a href="mailto:security@agentgift.ai" className="font-medium underline">
                  security@agentgift.ai
                </a>
              </p>
              <p className="text-red-600 text-xs">
                Security issues receive priority handling within 2-4 hours during business days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>© 2025 AgentGift.ai. All rights reserved.</p>
          <p className="mt-1">
            Need immediate help? Check our{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms & Transparency
            </a>{" "}
            page for common questions.
          </p>
        </div>
      </div>
    </div>
  )
}
