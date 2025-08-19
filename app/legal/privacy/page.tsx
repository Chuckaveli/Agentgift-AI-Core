import Link from "next/link"
import {
  ArrowLeft,
  Eye,
  Shield,
  Globe,
  Users,
  Lock,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
} from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-gray-600">How we protect and handle your information</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Fast Summary</h3>
                  <p className="text-green-700 text-sm">
                    We collect account info and gifting preferences to personalize recommendations. We never sell your
                    personal information. You control marketing, data exports, and deletion. We secure data with
                    industry best practices and only share with trusted processors necessary to run AgentGift.ai (e.g.,
                    payments, hosting, AI inference).
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="text-sm text-gray-600">
                <strong>Effective Date:</strong> August 15, 2025
              </div>
              <div className="text-sm text-gray-600">
                <strong>Who We Are:</strong> AgentGift LLC
              </div>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <a href="#section-1" className="text-blue-600 hover:text-blue-800 py-1">
              1. Information We Collect
            </a>
            <a href="#section-2" className="text-blue-600 hover:text-blue-800 py-1">
              2. How We Use Information
            </a>
            <a href="#section-3" className="text-blue-600 hover:text-blue-800 py-1">
              3. Legal Bases (EEA/UK/Similar)
            </a>
            <a href="#section-4" className="text-blue-600 hover:text-blue-800 py-1">
              4. Sharing & Disclosure
            </a>
            <a href="#section-5" className="text-blue-600 hover:text-blue-800 py-1">
              5. Cookies & Similar Technologies
            </a>
            <a href="#section-6" className="text-blue-600 hover:text-blue-800 py-1">
              6. Your Choices & Rights
            </a>
            <a href="#section-7" className="text-blue-600 hover:text-blue-800 py-1">
              7. Data Retention
            </a>
            <a href="#section-8" className="text-blue-600 hover:text-blue-800 py-1">
              8. Security
            </a>
            <a href="#section-9" className="text-blue-600 hover:text-blue-800 py-1">
              9. International Data Transfers
            </a>
            <a href="#section-10" className="text-blue-600 hover:text-blue-800 py-1">
              10. Children's Privacy
            </a>
            <a href="#section-11" className="text-blue-600 hover:text-blue-800 py-1">
              11. Third-Party Links
            </a>
            <a href="#section-12" className="text-blue-600 hover:text-blue-800 py-1">
              12. Changes to This Policy
            </a>
            <a href="#section-13" className="text-blue-600 hover:text-blue-800 py-1">
              13. Contact Us
            </a>
          </div>
        </div>

        {/* Section 1 */}
        <div id="section-1" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Eye className="h-6 w-6 text-blue-600" />
            1. Information We Collect
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">a) You Provide Directly</h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Account & Profile:</strong> name, email, password (hashed), display photo/emoji, time zone,
                  language, role/plan tier.
                </li>
                <li>
                  <strong>Gifting Data:</strong> recipients' names, relationships, pronouns, birthdays, interests,
                  sizes, wish lists, constraints (e.g., allergies), gift history, notes, sentiment tags, love languages,
                  cultural or seasonal preferences you choose to store.
                </li>
                <li>
                  <strong>Business Accounts:</strong> company name, team roster, roles, seat assignments, usage context,
                  and gifting programs.
                </li>
                <li>
                  <strong>Content You Submit:</strong> messages, surveys/quizzes, uploads, feedback, support requests.
                </li>
                <li>
                  <strong>Transactions:</strong> purchase details, plan, currency, and partial billing metadata handled
                  by our PCI-compliant payment provider.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">b) Collected Automatically</h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Device & Usage:</strong> IP address, device type, browser, OS version, app version, pages
                  viewed, referring URLs, feature interactions, crash logs, cookies and similar technologies.
                </li>
                <li>
                  <strong>Approximate Location:</strong> derived from IP for security, localization, and compliance. We
                  do not track precise GPS.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">c) From Third Parties</h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Auth / Social:</strong> if you choose to connect accounts (e.g., Google), we receive basic
                  profile and auth tokens.
                </li>
                <li>
                  <strong>Commerce & Logistics:</strong> payment status from our processor; shipping partners may return
                  delivery confirmations for physical gifts.
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Recipient Data</h4>
                  <p className="text-amber-700 text-sm">
                    You may store personal information about recipients (friends, family, employees). You are
                    responsible for having a lawful basis to provide that information to us. We process it solely to
                    deliver the Services you request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div id="section-2" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Users className="h-6 w-6 text-green-600" />
            2. How We Use Information
          </h2>

          <div className="space-y-4 text-gray-700">
            <p>We use information to:</p>
            <ul className="space-y-2 ml-4">
              <li>• Provide, personalize, and improve gift recommendations and experiences.</li>
              <li>• Power features like reminders, recipient history, and price tracking.</li>
              <li>• Operate accounts, authenticate users, and prevent fraud/abuse.</li>
              <li>• Process payments, subscriptions, and invoices.</li>
              <li>
                • Send transactional emails (e.g., receipts, password resets) and—only with your consent or as permitted
                by law—marketing communications.
              </li>
              <li>• Analyze usage to improve reliability, performance, and user experience.</li>
              <li>• Comply with legal obligations and enforce terms.</li>
            </ul>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-purple-800 mb-1">AI & Personalization</h4>
                  <p className="text-purple-700 text-sm">
                    We may use anonymized/aggregated data to improve models and features. We do <strong>not</strong> use
                    your personal content to train third‑party foundation models unless you opt in (see{" "}
                    <strong>Your Choices</strong> below).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div id="section-3" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FileText className="h-6 w-6 text-indigo-600" />
            3. Legal Bases (EEA/UK/Similar)
          </h2>

          <ul className="space-y-3 text-gray-700">
            <li>
              <strong>Contract:</strong> to provide the Services you request.
            </li>
            <li>
              <strong>Legitimate Interests:</strong> service improvement, security, and analytics balanced against your
              rights.
            </li>
            <li>
              <strong>Consent:</strong> marketing, certain cookies, and optional data uses (e.g., training improvements
              involving personal data).
            </li>
            <li>
              <strong>Legal Obligation:</strong> tax, accounting, and compliance.
            </li>
          </ul>
        </div>

        {/* Section 4 */}
        <div id="section-4" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Users className="h-6 w-6 text-red-600" />
            4. Sharing & Disclosure
          </h2>

          <div className="space-y-4 text-gray-700">
            <p className="font-semibold">
              We do <strong>not</strong> sell your personal information. We share only as needed to operate the
              Services:
            </p>

            <ul className="space-y-3 ml-4">
              <li>
                <strong>Service Providers / Sub‑processors:</strong> hosting, databases, payments, email delivery,
                analytics, error tracking, AI inference, voice, and customer support tools. Examples include: Supabase
                (data), Vercel (hosting), Stripe (payments), email/SMS providers, and AI providers. Our current list of
                core sub‑processors is available upon request or on our site.
              </li>
              <li>
                <strong>Team/Workspace Members:</strong> if you use a business account, certain information (e.g., team
                recipients, shared budgets) can be visible to teammates and admins per your organization's settings.
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
          </div>
        </div>

        {/* Section 5 */}
        <div id="section-5" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Globe className="h-6 w-6 text-orange-600" />
            5. Cookies & Similar Technologies
          </h2>

          <p className="text-gray-700">
            We use cookies and similar technologies for authentication, preferences, analytics, and performance. You can
            control cookies in your browser settings. Where required, we present a consent banner for optional cookies.
          </p>
        </div>

        {/* Section 6 */}
        <div id="section-6" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Lock className="h-6 w-6 text-blue-600" />
            6. Your Choices & Rights
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Your Rights Include:</h4>
                <ul className="space-y-2 text-blue-700 text-sm">
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
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">CCPA/CPRA (California)</h4>
              <p>
                Right to know, delete, correct, and opt out of sale/share or targeted advertising. We do not sell
                personal information. You may submit requests via the methods below.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">GDPR (EEA/UK)</h4>
              <p>Rights to access, rectify, erase, restrict, port, and object.</p>
            </div>

            <p className="mt-4">
              To exercise rights: email{" "}
              <a href="mailto:privacy@agentgift.ai" className="text-blue-600 hover:text-blue-800">
                privacy@agentgift.ai
              </a>{" "}
              or use in‑app controls (where available). We will verify your request consistent with applicable law.
            </p>
          </div>
        </div>

        {/* Section 7 */}
        <div id="section-7" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FileText className="h-6 w-6 text-purple-600" />
            7. Data Retention
          </h2>

          <p className="text-gray-700">
            We retain information while your account is active and as needed for the purposes described above. We may
            also retain limited information to comply with legal obligations, resolve disputes, and enforce agreements.
            When no longer needed, we delete or de‑identify data.
          </p>
        </div>

        {/* Section 8 */}
        <div id="section-8" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Shield className="h-6 w-6 text-green-600" />
            8. Security
          </h2>

          <p className="text-gray-700">
            We use administrative, technical, and physical safeguards including encryption in transit, access controls,
            role‑based permissions, audit logs, and regular backups. No method of transmission or storage is 100%
            secure; we work continuously to improve our protections.
          </p>
        </div>

        {/* Section 9 */}
        <div id="section-9" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Globe className="h-6 w-6 text-indigo-600" />
            9. International Data Transfers
          </h2>

          <p className="text-gray-700">
            We may process and store information in the United States and other countries. Where required, we use
            appropriate safeguards such as standard contractual clauses.
          </p>
        </div>

        {/* Section 10 */}
        <div id="section-10" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Users className="h-6 w-6 text-pink-600" />
            10. Children's Privacy
          </h2>

          <p className="text-gray-700">
            AgentGift.ai is not directed to children under 13 (or the minimum age required in your country). We do not
            knowingly collect personal information from children. If you believe a child has provided us personal
            information, contact us to request deletion.
          </p>
        </div>

        {/* Section 11 */}
        <div id="section-11" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Globe className="h-6 w-6 text-teal-600" />
            11. Third‑Party Links
          </h2>

          <p className="text-gray-700">
            Our Services may link to third‑party sites or services. Their privacy practices are governed by their own
            policies.
          </p>
        </div>

        {/* Section 12 */}
        <div id="section-12" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FileText className="h-6 w-6 text-orange-600" />
            12. Changes to This Policy
          </h2>

          <p className="text-gray-700">
            We may update this Policy from time to time. Material changes will be posted on this page with a new
            effective date. If changes are significant, we will provide additional notice where required by law.
          </p>
        </div>

        {/* Section 13 */}
        <div id="section-13" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Mail className="h-6 w-6 text-blue-600" />
            13. Contact Us
          </h2>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="space-y-3 text-gray-700">
              <div>
                <strong>AgentGift LLC</strong>
              </div>
              <div>
                <strong>Email:</strong>{" "}
                <a href="mailto:privacy@agentgift.ai" className="text-blue-600 hover:text-blue-800">
                  privacy@agentgift.ai
                </a>
              </div>
              <div>
                <strong>Support:</strong>{" "}
                <a href="mailto:support@agentgift.ai" className="text-blue-600 hover:text-blue-800">
                  support@agentgift.ai
                </a>
              </div>
              <div>
                <strong>Mailing Address:</strong> [Add your business mailing address]
              </div>
            </div>
          </div>
        </div>

        {/* Regional Disclosures */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Regional Disclosures (Summary)</h2>

          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">California Residents (CCPA/CPRA)</h4>
              <p>
                We do not sell personal information. To exercise rights, email{" "}
                <a href="mailto:privacy@agentgift.ai" className="text-blue-600 hover:text-blue-800">
                  privacy@agentgift.ai
                </a>{" "}
                and specify that your request is a "California privacy request." You may designate an authorized agent
                to act for you.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">EEA/UK</h4>
              <p>
                AgentGift LLC is the data controller for personal data processed via the Services. You may lodge a
                complaint with your local supervisory authority.
              </p>
            </div>
          </div>
        </div>

        {/* Do Not Sell */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Do Not Sell or Share My Personal Information</h2>

          <p className="text-gray-700">
            We do not sell or share personal information for cross‑context behavioral advertising as defined by the
            CPRA. If our practices change, we will update this Policy and provide a mechanism to opt out.
          </p>
        </div>

        {/* Pro Tips */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Pro Tips for Users</h2>

              <ul className="space-y-2 text-gray-700">
                <li>• Use strong, unique passwords and enable available security features.</li>
                <li>• Review recipient data you store to ensure you have consent to share.</li>
                <li>• Periodically export and clean up old data you no longer need.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mb-8">
          <p className="italic">
            This document is a general template and does not constitute legal advice. Please tailor it to your
            operations and consult counsel as needed.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <Link href="/legal/terms" className="text-blue-600 hover:text-blue-800 transition-colors">
            ← Terms of Service
          </Link>
          <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
