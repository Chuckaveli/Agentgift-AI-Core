"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"

export function EmailLinkTester() {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  const emailLinks = [
    {
      id: "privacy-deletion",
      label: "Privacy Team - Data Deletion Request",
      email: "privacy@agentgift.ai",
      subject: "Data Deletion Request",
      body: `I would like to request the deletion of my personal data from AgentGift.ai.

Registered Email: [Your Email]
Reason: [Optional]

Please confirm receipt of this request and provide me with the expected timeline for completion.

Thank you.`,
    },
    {
      id: "privacy-general",
      label: "Privacy Team - General Inquiry",
      email: "privacy@agentgift.ai",
      subject: "Privacy Inquiry",
      body: `Hello Privacy Team,

I have a question regarding my data privacy rights on AgentGift.ai.

[Please describe your question here]

Thank you for your assistance.`,
    },
    {
      id: "support-general",
      label: "General Support",
      email: "support@agentgift.ai",
      subject: "Support Request",
      body: `Hello Support Team,

I need assistance with my AgentGift.ai account.

Issue: [Please describe your issue]
Account Email: [Your registered email]

Thank you.`,
    },
  ]

  const testEmailLink = (linkId: string, email: string, subject: string, body: string) => {
    try {
      // Create the mailto URL
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

      // Test if the URL is valid
      const url = new URL(mailtoUrl)

      // Try to open the email client
      window.open(mailtoUrl, "_self")

      // Mark as successful
      setTestResults((prev) => ({ ...prev, [linkId]: true }))

      return true
    } catch (error) {
      console.error(`Failed to test email link for ${linkId}:`, error)
      setTestResults((prev) => ({ ...prev, [linkId]: false }))
      return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Email Link Tester</span>
          </CardTitle>
          <CardDescription>
            Test the mailto links used in the data deletion page to ensure they work correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emailLinks.map((link) => (
              <div key={link.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{link.label}</h3>
                    <p className="text-sm text-gray-600">{link.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {testResults[link.id] !== undefined && (
                      <Badge variant={testResults[link.id] ? "default" : "destructive"}>
                        {testResults[link.id] ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {testResults[link.id] ? "Success" : "Failed"}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      onClick={() => testEmailLink(link.id, link.email, link.subject, link.body)}
                      className="flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Test Link</span>
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    <strong>Subject:</strong> {link.subject}
                  </p>
                  <p>
                    <strong>Body Preview:</strong> {link.body.substring(0, 100)}...
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Testing Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Test Link" to open your default email client</li>
              <li>• Verify the recipient, subject, and body are populated correctly</li>
              <li>• Check that special characters and line breaks are preserved</li>
              <li>• Ensure the email opens without errors</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
