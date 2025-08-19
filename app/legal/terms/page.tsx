import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Scale, Shield } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-600">Effective Date: August 15, 2025</p>
            <p className="text-gray-600">Entity: AgentGift LLC</p>
          </div>
        </div>

        {/* Quick Summary */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Quick Vibe Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              We help you give better gifts with AI. Be kind, don't abuse the platform, and remember that credits/XP
              aren't cash.
            </p>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 mb-8">
            These Terms of Service ("Terms") govern your access to and use of AgentGift.ai websites, apps, and related
            services (the "Services"). By using the Services, you agree to these Terms and to our{" "}
            <Link href="/legal/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1) Who May Use the Services</h2>
            <p className="text-gray-700 mb-4">
              You must be at least 13 years old (or the minimum age in your country) to use the Services.
            </p>
            <p className="text-gray-700">
              If you're using the Services on behalf of an organization, you represent that you have authority to bind
              that organization to these Terms, and "you" includes that organization.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2) Accounts & Security</h2>
            <p className="text-gray-700 mb-4">
              You're responsible for your account credentials and all activity under your account.
            </p>
            <p className="text-gray-700 mb-4">Keep your password secret. Notify us immediately of unauthorized use.</p>
            <p className="text-gray-700">
              We may suspend or terminate accounts for violations of these Terms or to protect the Services and our
              users.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3) Plans, Credits, Subscriptions & Billing</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Plans & Credits</h3>
                <p className="text-gray-700">
                  Some features require a paid plan and/or use a credit system. Credits are a limited, non-transferable,
                  revocable license to access certain features; they are not money and have no cash value.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Renewals</h3>
                <p className="text-gray-700">
                  Paid plans auto-renew each billing cycle unless canceled before renewal.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Trials</h3>
                <p className="text-gray-700">Free trials may have limits or convert to paid plans unless canceled.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Pricing & Changes</h3>
                <p className="text-gray-700">
                  We may change pricing, features, or credit allowances prospectively. If we make material changes to
                  your plan, we'll notify you in advance.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Refunds</h3>
                <p className="text-gray-700">Except where required by law, fees are non-refundable.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Taxes</h3>
                <p className="text-gray-700">Prices may exclude taxes; you're responsible for any applicable taxes.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Chargebacks</h3>
                <p className="text-gray-700">We may suspend services for unresolved chargebacks or payment disputes.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4) The AgentGift Experience (What We Provide)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Gift Suggestions</h3>
                <p className="text-gray-700">
                  We use algorithms and third-party AI to generate ideas and insights, which may be inaccurate or
                  incomplete. Use your own judgment.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Price Tracking & Links</h3>
                <p className="text-gray-700">
                  Prices, availability, and shipping estimates may change without notice. Some links may be affiliate
                  links; we may earn a commission.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Fulfillment</h3>
                <p className="text-gray-700">
                  For third-party products, your purchase contract is with the merchant, not AgentGift. Returns,
                  warranties, and customer service for those products are handled by the merchant.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Business Features</h3>
                <p className="text-gray-700">
                  Teams may share data and budgets per admin settings. Admins can see certain activity and manage seats.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Beta/Experimental Features</h3>
                <p className="text-gray-700">
                  Some features may be labeled alpha/beta/preview and are provided "as is," may be rate-limited, and may
                  change or end at any time.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5) Your Content & Recipient Data</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Content</h3>
                <p className="text-gray-700">
                  You may input recipient profiles, preferences, notes, and other content ("User Content"). You retain
                  ownership of your User Content.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">License to Us</h3>
                <p className="text-gray-700">
                  You grant us a worldwide, non-exclusive, royalty-free license to host, process, display, and create
                  derivative works of your User Content solely to operate and improve the Services.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Recipient Responsibility</h3>
                <p className="text-gray-700">
                  You are responsible for having a lawful basis to provide recipient data to us. Do not upload sensitive
                  data you're not authorized to share.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Feedback</h3>
                <p className="text-gray-700">
                  If you send suggestions or ideas, you grant us a perpetual, irrevocable license to use them without
                  restriction or compensation.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6) Acceptable Use</h2>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Violate laws, intellectual property, or privacy rights.</li>
              <li>Upload or generate unlawful, deceptive, harmful, or discriminatory content.</li>
              <li>Probe, scan, or test the vulnerability of the Services or disrupt them.</li>
              <li>Use bots/scrapers to extract data except as expressly permitted.</li>
              <li>Misrepresent outputs as professional advice (medical, legal, financial, etc.).</li>
            </ul>
            <p className="text-gray-700">
              We may investigate and take appropriate action, including suspension or removal.
            </p>
          </section>

          {/* AI Disclaimers Card */}
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800">7) AI & Output Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="text-amber-700 space-y-3">
              <p>
                AI-generated content can be wrong, outdated, or biased. Validate important details (e.g., sizes,
                allergies, shipping cutoffs).
              </p>
              <p>Outputs are provided for informational and entertainment purposes and are not professional advice.</p>
              <p>You are responsible for your reliance on outputs and for all decisions you make.</p>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8) Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              The Services, including software, design, and content we provide, are owned by AgentGift or its licensors
              and are protected by IP laws.
            </p>
            <p className="text-gray-700 mb-4">
              We grant you a limited, non-exclusive, non-transferable license to access and use the Services for your
              personal or internal business use in accordance with these Terms.
            </p>
            <p className="text-gray-700">
              Do not copy, modify, distribute, reverse engineer, or create derivative works except as permitted by law
              or these Terms.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9) Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              The Services may depend on or link to third-party services (e.g., payment processors, shipping providers,
              AI platforms). Their terms and privacy policies govern your use of those services.
            </p>
            <p className="text-gray-700">We're not responsible for third-party acts or omissions.</p>
          </section>

          {/* Section 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10) Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our data practices are described in our{" "}
              <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <p className="text-gray-700">
              By using the Services, you consent to our collection and use of information as described there.
            </p>
          </section>

          {/* Section 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11) Discord & Community Features (if connected)</h2>
            <p className="text-gray-700 mb-4">Community participation is subject to posted community rules.</p>
            <p className="text-gray-700">
              XP, badges, and virtual items (including "Vibecoins") are not currency, non-transferable, may expire, and
              may be changed or revoked to maintain balance and fairness.
            </p>
          </section>

          {/* Section 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12) Termination</h2>
            <p className="text-gray-700 mb-4">
              You may stop using the Services and/or cancel your plan at any time in your account settings.
            </p>
            <p className="text-gray-700 mb-4">
              We may suspend or terminate your access for violations, security risks, non-payment, or discontinuation of
              the Services.
            </p>
            <p className="text-gray-700">
              Upon termination, your license ends and you must stop using the Services. Some provisions survive
              termination (e.g., IP, disclaimers, liability limits).
            </p>
          </section>

          {/* Legal Disclaimers Card */}
          <Card className="mb-8 border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-gray-800">13) Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              <p className="font-semibold mb-2">THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE."</p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE
                SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT OUTPUTS WILL BE ACCURATE OR RELIABLE.
              </p>
            </CardContent>
          </Card>

          {/* Section 14 */}
          <Card className="mb-8 border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-gray-800">14) Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, AGENTGIFT AND ITS AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, AND
                PARTNERS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE
                DAMAGES, OR ANY LOSS OF PROFITS, REVENUES, DATA, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF THE
                SERVICES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p className="mb-4">
                OUR TOTAL LIABILITY FOR ANY CLAIMS RELATING TO THE SERVICES IN ANY 12-MONTH PERIOD WILL NOT EXCEED THE
                GREATER OF (A) $100 OR (B) THE AMOUNTS YOU PAID TO AGENTGIFT FOR THE SERVICES IN THAT 12-MONTH PERIOD.
              </p>
              <p>
                Some jurisdictions don't allow certain limitations; in those cases, the above limits apply to the
                fullest extent permitted.
              </p>
            </CardContent>
          </Card>

          {/* Sections 15-21 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15) Indemnification</h2>
            <p className="text-gray-700">
              You agree to defend, indemnify, and hold harmless AgentGift and its affiliates, officers, employees, and
              agents from any claims, damages, liabilities, costs, and expenses (including reasonable attorneys' fees)
              arising from or related to: (a) your User Content; (b) your use of the Services; (c) your violation of
              these Terms; or (d) your violation of any law or third-party right.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16) Changes to the Services or Terms</h2>
            <p className="text-gray-700">
              We may update the Services and these Terms from time to time. If we make material changes, we'll provide
              notice (e.g., by email or in-app). Changes apply prospectively. Continuing to use the Services after
              changes become effective means you accept the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17) Governing Law; Dispute Resolution</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Governing Law</h3>
                <p className="text-gray-700">
                  These Terms are governed by the laws of Delaware, United States, without regard to conflicts of laws
                  principles.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Arbitration & Class Action Waiver</h3>
                <p className="text-gray-700">
                  Any dispute arising out of or relating to these Terms or the Services will be resolved by binding
                  arbitration on an individual basis; class actions are not permitted. Either party may seek relief in
                  small-claims court for qualifying disputes.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">18) International Use</h2>
            <p className="text-gray-700">
              We operate from the United States and make no representation that the Services are appropriate or
              available elsewhere. You're responsible for compliance with local laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">19) Force Majeure</h2>
            <p className="text-gray-700">
              We're not liable for delays or failures due to events beyond our reasonable control (e.g., internet
              outages, third-party failures, strikes, natural disasters).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">20) Miscellaneous</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Entire Agreement</h3>
                <p className="text-gray-700">
                  These Terms, plus any posted policies (e.g., Privacy Policy), are the entire agreement between you and
                  us regarding the Services.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Severability</h3>
                <p className="text-gray-700">If a provision is unenforceable, the rest remain in effect.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Waiver</h3>
                <p className="text-gray-700">Our failure to enforce a provision isn't a waiver.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Assignment</h3>
                <p className="text-gray-700">
                  You may not assign these Terms without our consent. We may assign them in connection with a merger,
                  acquisition, or sale of assets.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Headings</h3>
                <p className="text-gray-700">For convenience only and have no legal effect.</p>
              </div>
            </div>
          </section>

          {/* Contact Information Card */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                21) Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-700 space-y-2">
              <p>
                <strong>AgentGift LLC</strong>
              </p>
              <p>
                Email:{" "}
                <a href="mailto:support@agentgift.ai" className="underline">
                  support@agentgift.ai
                </a>
              </p>
              <p>
                Legal/Privacy:{" "}
                <a href="mailto:privacy@agentgift.ai" className="underline">
                  privacy@agentgift.ai
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Regional Disclosures */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Regional Disclosures (Summary)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">California Residents (CCPA/CPRA)</h3>
                <p className="text-gray-700">
                  We do not sell personal information. To exercise rights, email{" "}
                  <a href="mailto:privacy@agentgift.ai" className="text-blue-600 hover:underline">
                    privacy@agentgift.ai
                  </a>{" "}
                  and specify that your request is a "California privacy request." You may designate an authorized agent
                  to act for you.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">EEA/UK</h3>
                <p className="text-gray-700">
                  AgentGift LLC is the data controller for personal data processed via the Services. You may lodge a
                  complaint with your local supervisory authority.
                </p>
              </div>
            </div>
          </section>

          {/* Do Not Sell */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Do Not Sell or Share My Personal Information</h2>
            <p className="text-gray-700">
              We do not sell or share personal information for cross-context behavioral advertising as defined by the
              CPRA. If our practices change, we will update this Policy and provide a mechanism to opt out.
            </p>
          </section>

          {/* Pro Tips */}
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Pro Tips for Users</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 space-y-2">
              <ul className="list-disc list-inside space-y-1">
                <li>Use strong, unique passwords and enable available security features.</li>
                <li>Review recipient data you store to ensure you have consent to share.</li>
                <li>Periodically export and clean up old data you no longer need.</li>
              </ul>
            </CardContent>
          </Card>

          <div className="text-center text-gray-500 text-sm mt-12">
            <p>
              This document is a general template and does not constitute legal advice. Please tailor it to your
              operations and consult counsel as needed.
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/legal/privacy">
              <Button variant="outline">
                <Scale className="mr-2 h-4 w-4" />
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
