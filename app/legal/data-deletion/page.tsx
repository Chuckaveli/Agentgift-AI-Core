import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Mail, Shield, Clock, AlertTriangle, Download, UserX, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Data Deletion Request | AgentGift.ai",
  description:
    "Request deletion of your personal data from AgentGift.ai. Learn about our data deletion process, timeline, and your privacy rights.",
}

export default function DataDeletionPage() {
  const deletionEmailBody = encodeURIComponent(`Subject: Data Deletion Request

Dear AgentGift.ai Privacy Team,

I am requesting the complete deletion of my personal data from your systems.

Account Information:
- Email: [Your email address]
- Account ID: [If known]
- Registration Date: [If known]

I understand that:
- This action is permanent and irreversible
- All my data will be deleted within 30 days
- I will receive confirmation once deletion is complete
- Some data may be retained for legal compliance

Please confirm receipt of this request and provide a timeline for completion.

Thank you,
[Your Name]`)

  const privacyEmailBody = encodeURIComponent(`Subject: Privacy Rights Inquiry

Dear AgentGift.ai Privacy Team,

I have a question regarding my privacy rights and data handling.

My inquiry:
[Please describe your privacy question or concern]

Account Information:
- Email: [Your email address]
- Account ID: [If known]

Thank you,
[Your Name]`)

  const supportEmailBody = encodeURIComponent(`Subject: Account Support Request

Dear AgentGift.ai Support Team,

I need assistance with my account.

Issue Description:
[Please describe your issue]

Account Information:
- Email: [Your email address]
- Account ID: [If known]

Thank you,
[Your Name]`)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Deletion Request</h1>
              <p className="text-gray-600">Request permanent deletion of your personal data</p>
            </div>
          </div>
        </div>

        {/* Warning Card */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">Important Warning</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              Data deletion is <strong>permanent and irreversible</strong>. Once your data is deleted, it cannot be
              recovered. Please consider the alternatives below before proceeding.
            </p>
          </CardContent>
        </Card>

        {/* Request Methods */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>How to Request Data Deletion</span>
            </CardTitle>
            <CardDescription>Choose one of the methods below to submit your data deletion request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Method */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Method 1: Email Request</h3>
              <p className="text-gray-600">Send an email to our privacy team with your deletion request:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <a href={`mailto:privacy@agentgift.ai?subject=Data Deletion Request&body=${deletionEmailBody}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Deletion Request
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="mailto:privacy@agentgift.ai">
                    <Mail className="mr-2 h-4 w-4" />
                    privacy@agentgift.ai
                  </a>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Account Settings Method */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Method 2: Account Settings</h3>
              <p className="text-gray-600">
                If you have an active account, you can request deletion through your account settings:
              </p>
              <Button variant="outline" asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Go to Account Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deletion Process Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Deletion Process Timeline</span>
            </CardTitle>
            <CardDescription>What happens after you submit your deletion request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Badge variant="outline" className="mt-1">
                  1
                </Badge>
                <div>
                  <h4 className="font-semibold">Request Received</h4>
                  <p className="text-sm text-gray-600">Within 24 hours</p>
                  <p className="text-gray-700">We acknowledge receipt of your deletion request via email</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start space-x-4">
                <Badge variant="outline" className="mt-1">
                  2
                </Badge>
                <div>
                  <h4 className="font-semibold">Identity Verification</h4>
                  <p className="text-sm text-gray-600">1-3 business days</p>
                  <p className="text-gray-700">We verify your identity to ensure account security</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start space-x-4">
                <Badge variant="outline" className="mt-1">
                  3
                </Badge>
                <div>
                  <h4 className="font-semibold">Data Deletion</h4>
                  <p className="text-sm text-gray-600">7-30 days</p>
                  <p className="text-gray-700">Your data is permanently removed from our systems</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start space-x-4">
                <Badge variant="outline" className="mt-1">
                  4
                </Badge>
                <div>
                  <h4 className="font-semibold">Confirmation</h4>
                  <p className="text-sm text-gray-600">Within 30 days</p>
                  <p className="text-gray-700">We send final confirmation that deletion is complete</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Gets Deleted */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Data That Will Be Deleted</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Account information and profile data</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Gift preferences and recommendations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Chat history and conversations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Usage analytics and behavior data</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Uploaded files and documents</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-amber-600">Data That May Be Retained</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Transaction records (legal requirement)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Fraud prevention data (security)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Anonymized usage statistics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Backup data (up to 90 days)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Legal compliance records</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Alternatives */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-blue-600">Consider These Alternatives</CardTitle>
            <CardDescription>
              Before deleting your data permanently, you might want to consider these options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Download className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Export Your Data</h4>
                <p className="text-sm text-gray-600 mb-3">Download a copy of your data before deletion</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings/export">Export Data</Link>
                </Button>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <UserX className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Deactivate Account</h4>
                <p className="text-sm text-gray-600 mb-3">Temporarily disable your account instead</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings/deactivate">Deactivate</Link>
                </Button>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Privacy Settings</h4>
                <p className="text-sm text-gray-600 mb-3">Adjust what data we collect and use</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings/privacy">Privacy Settings</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Contact our team if you have questions about data deletion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Privacy Team</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <a href={`mailto:privacy@agentgift.ai?subject=Privacy Rights Inquiry&body=${privacyEmailBody}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      privacy@agentgift.ai
                    </a>
                  </Button>
                  <p className="text-sm text-gray-600">For data deletion requests and privacy questions</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">General Support</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <a href={`mailto:support@agentgift.ai?subject=Account Support Request&body=${supportEmailBody}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      support@agentgift.ai
                    </a>
                  </Button>
                  <p className="text-sm text-gray-600">For technical support and account assistance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Your Legal Rights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">GDPR Rights (EU Residents)</h4>
                <p className="text-sm text-gray-600">
                  Under GDPR Article 17, you have the right to erasure ("right to be forgotten") of your personal data
                  under certain circumstances.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">CCPA Rights (California Residents)</h4>
                <p className="text-sm text-gray-600">
                  Under the California Consumer Privacy Act, you have the right to request deletion of personal
                  information we have collected about you.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Other Jurisdictions</h4>
                <p className="text-sm text-gray-600">
                  We respect data protection rights under applicable laws in your jurisdiction. Contact our privacy team
                  for specific information about your rights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Last updated: {new Date().toLocaleDateString()} |
            <Link href="/legal/privacy" className="ml-1 text-blue-600 hover:underline">
              Privacy Policy
            </Link>{" "}
            |
            <Link href="/legal/terms" className="ml-1 text-blue-600 hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
