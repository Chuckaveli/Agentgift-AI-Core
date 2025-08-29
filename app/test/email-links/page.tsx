import { EmailLinkTester } from "@/components/test/email-link-tester"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Email Link Tester | AgentGift.ai",
  description: "Test the mailto links used throughout the application",
}

export default function EmailLinksTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Link Testing</h1>
          <p className="text-lg text-gray-600">Verify that all mailto links in the application work correctly</p>
        </div>

        <EmailLinkTester />

        <div className="mt-12">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Testing Checklist</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Privacy Team Links</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Data deletion request email opens correctly
                  </li>
                  <li className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Subject line is pre-filled: "Data Deletion Request"
                  </li>
                  <li className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Email body contains template text
                  </li>
                  <li className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Recipient is privacy@agentgift.ai
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Support Team Links</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    General support email opens correctly
                  </li>
                  <li className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Subject line is appropriate
                  </li>
                  <li className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Email body is properly formatted
                  </li>
                  <li className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Recipient is support@agentgift.ai
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
