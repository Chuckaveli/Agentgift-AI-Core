import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Trash2, Shield, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react"

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">User Data Deletion</h1>
            <p className="text-gray-600">Request deletion of your personal data from AgentGift.ai</p>
          </div>
        </div>

        {/* Quick Summary */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Your Right to Data Deletion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              You have the right to request deletion of your personal data. We will process your request within 30 days
              and permanently remove your information from our systems, subject to legal retention requirements.
            </p>
          </CardContent>
        </Card>

        {/* What Gets Deleted */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              What Data Will Be Deleted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Account Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Your profile information (name, email, preferences)</li>
                  <li>Account settings and configurations</li>
                  <li>Authentication data and login history</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Gift Data</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Recipient profiles and preferences you've created</li>
                  <li>Gift recommendations and history</li>
                  <li>Notes, tags, and personal annotations</li>
                  <li>Saved searches and wish lists</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Usage Data</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Feature usage analytics tied to your account</li>
                  <li>Chat history with AI concierge</li>
                  <li>Feedback and survey responses</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What May Be Retained */}
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Data That May Be Retained
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 mb-4">
              Some data may be retained for legal, security, or operational reasons:
            </p>
            <ul className="list-disc list-inside text-amber-700 space-y-1">
              <li>Transaction records for tax and accounting purposes (7 years)</li>
              <li>Security logs for fraud prevention (2 years)</li>
              <li>Anonymized analytics data (no personal identifiers)</li>
              <li>Data required for ongoing legal proceedings</li>
            </ul>
          </CardContent>
        </Card>

        {/* Deletion Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Deletion Process & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Submit Request</h3>
                  <p className="text-gray-600">Send your deletion request using the methods below</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Identity Verification</h3>
                  <p className="text-gray-600">We'll verify your identity to protect your data (1-2 business days)</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Data Deletion</h3>
                  <p className="text-gray-600">Complete removal from all systems (up to 30 days)</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Confirmation</h3>
                  <p className="text-gray-600">You'll receive confirmation once deletion is complete</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Request Deletion */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              How to Request Data Deletion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-green-800 mb-2">Method 1: Email Request</h3>
              <p className="text-green-700 mb-2">
                Send an email to{" "}
                <a href="mailto:privacy@agentgift.ai" className="underline font-semibold">
                  privacy@agentgift.ai
                </a>{" "}
                with the subject line "Data Deletion Request"
              </p>
              <p className="text-green-700 text-sm">
                Include: Your full name, email address associated with your account, and reason for deletion (optional)
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-green-800 mb-2">Method 2: Account Settings</h3>
              <p className="text-green-700 mb-2">
                Log into your AgentGift.ai account and navigate to Settings → Privacy → Delete Account
              </p>
              <Link href="/settings">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-700 hover:bg-green-100 bg-transparent"
                >
                  Go to Account Settings
                </Button>
              </Link>
            </div>

            <div>
              <h3 className="font-semibold text-green-800 mb-2">Method 3: Support Contact</h3>
              <p className="text-green-700 mb-2">
                Contact our support team at{" "}
                <a href="mailto:support@agentgift.ai" className="underline font-semibold">
                  support@agentgift.ai
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-red-700">
              <li>• Data deletion is permanent and cannot be undone</li>
              <li>• You will lose access to all features and saved data</li>
              <li>• Active subscriptions will be canceled</li>
              <li>• Some data may be retained for legal compliance</li>
              <li>• The process may take up to 30 days to complete</li>
            </ul>
          </CardContent>
        </Card>

        {/* Alternative Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Alternative Options</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">Before requesting full deletion, consider these alternatives:</p>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-800">Account Deactivation</h4>
                <p className="text-gray-600 text-sm">
                  Temporarily disable your account while keeping your data for potential reactivation
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Data Export</h4>
                <p className="text-gray-600 text-sm">Download a copy of your data before deletion</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Privacy Settings</h4>
                <p className="text-gray-600 text-sm">Adjust your privacy settings to limit data collection</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Questions or Concerns?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">If you have questions about data deletion or need assistance:</p>
            <div className="space-y-2">
              <p>
                <strong>Privacy Team:</strong>{" "}
                <a href="mailto:privacy@agentgift.ai" className="text-blue-600 hover:underline">
                  privacy@agentgift.ai
                </a>
              </p>
              <p>
                <strong>Support Team:</strong>{" "}
                <a href="mailto:support@agentgift.ai" className="text-blue-600 hover:underline">
                  support@agentgift.ai
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/legal/privacy">
              <Button variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Privacy Policy
              </Button>
            </Link>
            <Link href="/">
              <Button>Back to AgentGift.ai</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
