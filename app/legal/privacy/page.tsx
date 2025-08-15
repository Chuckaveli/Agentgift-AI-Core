import Link from "next/link"
import {
  ArrowLeft,
  Eye,
  Shield,
  Globe,
  Users,
  Lock,
  FileText,
  Mail,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AgentGift.ai
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground">How we protect and handle your information</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="mr-1 h-3 w-3" />
              Effective: August 15, 2025
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Info className="mr-1 h-3 w-3" />
              AgentGift LLC
            </Badge>
          </div>

          {/* Fast Summary */}
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Fast Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-700 dark:text-green-300">
              <p>
                We collect account info and gifting preferences to personalize recommendations. We never sell your
                personal information. You control marketing, data exports, and deletion. We secure data with industry
                best practices and only share with trusted processors necessary to run AgentGift.ai (e.g., payments,
                hosting, AI inference).
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <Link href="#information-we-collect" className="text-blue-600 hover:text-blue-800 hover:underline">
                1. Information We Collect
              </Link>
              <Link href="#how-we-use" className="text-blue-600 hover:text-blue-800 hover:underline">
                2. How We Use Information
              </Link>
              <Link href="#legal-bases" className="text-blue-600 hover:text-blue-800 hover:underline">
                3. Legal Bases
              </Link>
              <Link href="#sharing-disclosure" className="text-blue-600 hover:text-blue-800 hover:underline">
                4. Sharing & Disclosure
              </Link>
              <Link href="#cookies" className="text-blue-600 hover:text-blue-800 hover:underline">
                5. Cookies & Similar Technologies
              </Link>
              <Link href="#your-choices" className="text-blue-600 hover:text-blue-800 hover:underline">
                6. Your Choices & Rights
              </Link>
              <Link href="#data-retention" className="text-blue-600 hover:text-blue-800 hover:underline">
                7. Data Retention
              </Link>
              <Link href="#security" className="text-blue-600 hover:text-blue-800 hover:underline">
                8. Security
              </Link>
              <Link href="#international-transfers" className="text-blue-600 hover:text-blue-800 hover:underline">
                9. International Data Transfers
              </Link>
              <Link href="#childrens-privacy" className="text-blue-600 hover:text-blue-800 hover:underline">
                10. Children's Privacy
              </Link>
              <Link href="#third-party-links" className="text-blue-600 hover:text-blue-800 hover:underline">
                11. Third-Party Links
              </Link>
              <Link href="#changes" className="text-blue-600 hover:text-blue-800 hover:underline">
                12. Changes to This Policy
              </Link>
              <Link href="#contact" className="text-blue-600 hover:text-blue-800 hover:underline">
                13. Contact Us
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <Card id="information-we-collect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-3">a) You Provide Directly</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <strong>Account & Profile:</strong> name, email, password (hashed), display photo/emoji, time zone,
                    language, role/plan tier.
                  </li>
                  <li>
                    <strong>Gifting Data:</strong> recipients' names, relationships, pronouns, birthdays, interests,
                    sizes, wish lists, constraints (e.g., allergies), gift history, notes, sentiment tags, love
                    languages, cultural or seasonal preferences you choose to store.
                  </li>
                  <li>
                    <strong>Business Accounts:</strong> company name, team roster, roles, seat assignments, usage
                    context, and gifting programs.
                  </li>
                  <li>
                    <strong>Content You Submit:</strong> messages, surveys/quizzes, uploads, feedback, support requests.
                  </li>
                  <li>
                    <strong>Transactions:</strong> purchase details, plan, currency, and partial billing metadata
                    handled by our PCI-compliant payment provider.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3">b) Collected Automatically</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <strong>Device & Usage:</strong> IP address, device type, browser, OS version, app version, pages
                    viewed, referring URLs, feature interactions, crash logs, cookies and similar technologies.
                  </li>
                  <li>
                    <strong>Approximate Location:</strong> derived from IP for security, localization, and compliance.
                    We do not track precise GPS.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3">c) From Third Parties</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <strong>Auth / Social:</strong> if you choose to connect accounts (e.g., Google), we receive basic
                    profile and auth tokens.
                  </li>
                  <li>
                    <strong>Commerce & Logistics:</strong> payment status from our processor; shipping partners may
                    return delivery confirmations for physical gifts.
                  </li>
                </ul>
              </div>

              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-amber-800 dark:text-amber-200">
                      <p className="font-semibold mb-1">Recipient Data</p>
                      <p className="text-sm">
                        You may store personal information about recipients (friends, family, employees). You are
                        responsible for having a lawful basis to provide that information to us. We process it solely to
                        deliver the Services you request.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card id="how-we-use">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                2. How We Use Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">We use information to:</p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>Provide, personalize, and improve gift recommendations and experiences.</li>
                <li>Power features like reminders, recipient history, and price tracking.</li>
                <li>Operate accounts, authenticate users, and prevent fraud/abuse.</li>
                <li>Process payments, subscriptions, and invoices.</li>
                <li>
                  Send transactional emails (e.g., receipts, password resets) and—only with your consent or as permitted
                  by law—marketing communications.
                </li>
                <li>Analyze usage to improve reliability, performance, and user experience.</li>
                <li>Comply with legal obligations and enforce terms.</li>
              </ul>

              <Card className="mt-6 border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="text-purple-800 dark:text-purple-200">
                      <p className="font-semibold mb-1">AI & Personalization</p>
                      <p className="text-sm">
                        We may use anonymized/aggregated data to improve models and features. We do <strong>not</strong>{" "}
                        use your personal content to train third‑party foundation models unless you opt in (see{" "}
                        <strong>Your Choices</strong> below).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card id="legal-bases">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                3. Legal Bases (EEA/UK/Similar)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <strong>Contract:</strong> to provide the Services you request.
                </li>
                <li>
                  <strong>Legitimate Interests:</strong> service improvement, security, and analytics balanced against
                  your rights.
                </li>
                <li>
                  <strong>Consent:</strong> marketing, certain cookies, and optional data uses (e.g., training
                  improvements involving personal data).
                </li>
                <li>
                  <strong>Legal Obligation:</strong> tax, accounting, and compliance.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card id="sharing-disclosure">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                4. Sharing & Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 font-semibold">
                We do <strong>not</strong> sell your personal information. We share only as needed to operate the
                Services:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <strong>Service Providers / Sub‑processors:</strong> hosting, databases, payments, email delivery,
                  analytics, error tracking, AI inference, voice, and customer support tools. Examples include: Supabase
                  (data), Vercel (hosting), Stripe (payments), email/SMS providers, and AI providers. Our current list
                  of core sub‑processors is available upon request or on our site.
                </li>
                <li>
                  <strong>Team/Workspace Members:</strong> if you use a business account, certain information (e.g.,
                  team recipients, shared budgets) can be visible to teammates and admins per your organization's
                  settings.
                </li>
                <li>
                  <strong>Legal & Safety:</strong> to comply with law, respond to legal requests, or protect rights,
                  property, or safety of AgentGift, our users, or the public.
                </li>
                <li>
                  <strong>Business Transfers:</strong> if we undergo a merger, acquisition, or asset sale, your data may
                  be transferred as part of that transaction subject to this Policy.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card id="cookies">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-600" />
                5. Cookies & Similar Technologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We use cookies and similar technologies for authentication, preferences, analytics, and performance. You
                can control cookies in your browser settings. Where required, we present a consent banner for optional
                cookies.
              </p>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card id="your-choices" className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Lock className="h-5 w-5" />
                6. Your Choices & Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 dark:text-blue-300">
              <ul className="space-y-3">
                <li>
                  <strong>Email Preferences:</strong> opt out of marketing via the unsubscribe link; you will still
                  receive essential transactional emails.
                </li>
                <li>
                  <strong>Access/Export:</strong> request a copy of your data.
                </li>
                <li>
                  <strong>Correction:</strong> update inaccurate or incomplete information.
                </li>
                <li>
                  <strong>Deletion:</strong> request deletion of your account and associated data (subject to limited
                  legal exceptions).
                </li>
                <li>
                  <strong>Opt‑in/Opt‑out for AI Training:</strong> choose whether your personal data (if ever needed)
                  may be used to improve our models. Default is <strong>opt‑out</strong> unless you explicitly enable
                  it.
                </li>
                <li>
                  <strong>CCPA/CPRA (California):</strong> right to know, delete, correct, and opt out of sale/share or
                  targeted advertising. We do not sell personal information. You may submit requests via the methods
                  below.
                </li>
                <li>
                  <strong>GDPR (EEA/UK):</strong> rights to access, rectify, erase, restrict, port, and object.
                </li>
              </ul>
              <p className="mt-4 font-semibold">
                To exercise rights: email{" "}
                <a href="mailto:privacy@agentgift.ai" className="underline hover:no-underline">
                  privacy@agentgift.ai
                </a>{" "}
                or use in‑app controls (where available). We will verify your request consistent with applicable law.
              </p>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card id="data-retention">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                7. Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We retain information while your account is active and as needed for the purposes described above. We
                may also retain limited information to comply with legal obligations, resolve disputes, and enforce
                agreements. When no longer needed, we delete or de‑identify data.
              </p>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card id="security">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                8. Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We use administrative, technical, and physical safeguards including encryption in transit, access
                controls, role‑based permissions, audit logs, and regular backups. No method of transmission or storage
                is 100% secure; we work continuously to improve our protections.
              </p>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card id="international-transfers">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                9. International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may process and store information in the United States and other countries. Where required, we use
                appropriate safeguards such as standard contractual clauses.
              </p>
            </CardContent>
          </Card>

          {/* Section 10 */}
          <Card id="childrens-privacy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                10. Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                AgentGift.ai is not directed to children under 13 (or the minimum age required in your country). We do
                not knowingly collect personal information from children. If you believe a child has provided us
                personal information, contact us to request deletion.
              </p>
            </CardContent>
          </Card>

          {/* Section 11 */}
          <Card id="third-party-links">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-600" />
                11. Third‑Party Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our Services may link to third‑party sites or services. Their privacy practices are governed by their
                own policies.
              </p>
            </CardContent>
          </Card>

          {/* Section 12 */}
          <Card id="changes">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                12. Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Policy from time to time. Material changes will be posted on this page with a new
                effective date. If changes are significant, we will provide additional notice where required by law.
              </p>
            </CardContent>
          </Card>

          {/* Section 13 - Contact */}
          <Card id="contact" className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <Mail className="h-5 w-5" />
                13. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-700 dark:text-green-300">
              <div className="space-y-2">
                <p>
                  <strong>AgentGift LLC</strong>
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:privacy@agentgift.ai" className="underline hover:no-underline">
                    privacy@agentgift.ai
                  </a>
                </p>
                <p>
                  <strong>Support:</strong>{" "}
                  <a href="mailto:support@agentgift.ai" className="underline hover:no-underline">
                    support@agentgift.ai
                  </a>
                </p>
                <p>
                  <strong>Mailing Address:</strong> [Add your business mailing address]
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Regional Disclosures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Regional Disclosures (Summary)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">California Residents (CCPA/CPRA)</h4>
                <p className="text-muted-foreground text-sm">
                  We do not sell personal information. To exercise rights, email{" "}
                  <a href="mailto:privacy@agentgift.ai" className="text-blue-600 underline hover:no-underline">
                    privacy@agentgift.ai
                  </a>{" "}
                  and specify that your request is a "California privacy request." You may designate an authorized agent
                  to act for you.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">EEA/UK</h4>
                <p className="text-muted-foreground text-sm">
                  AgentGift LLC is the data controller for personal data processed via the Services. You may lodge a
                  complaint with your local supervisory authority.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Do Not Sell */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Do Not Sell or Share My Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We do not sell or share personal information for cross‑context behavioral advertising as defined by the
                CPRA. If our practices change, we will update this Policy and provide a mechanism to opt out.
              </p>
            </CardContent>
          </Card>

          {/* Pro Tips */}
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                <Lightbulb className="h-5 w-5" />
                Pro Tips for Users
              </CardTitle>
            </CardHeader>
            <CardContent className="text-purple-700 dark:text-purple-300">
              <ul className="space-y-2 list-disc list-inside">
                <li>Use strong, unique passwords and enable available security features.</li>
                <li>Review recipient data you store to ensure you have consent to share.</li>
                <li>Periodically export and clean up old data you no longer need.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-4">
            <em>
              This document is a general template and does not constitute legal advice. Please tailor it to your
              operations and consult counsel as needed.
            </em>
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/legal/terms" className="text-blue-600 hover:text-blue-800 hover:underline">
              Terms of Service
            </Link>
            <Link href="/" className="text-blue-600 hover:text-blue-800 hover:underline">
              Back to AgentGift.ai
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
