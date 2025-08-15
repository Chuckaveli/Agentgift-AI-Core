import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Mail, Shield, Eye, Lock, Globe, Users, AlertTriangle, Lightbulb, FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy - AgentGift.ai",
  description: "AgentGift.ai Privacy Policy - How we collect, use, and protect your information",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">Privacy Policy</span>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">AgentGift.ai Privacy Policy</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Effective date: August 15, 2025</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span>AgentGift LLC</span>
          </div>
        </div>

        {/* Quick Summary */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Fast Summary
            </h2>
            <p className="text-sm leading-relaxed">
              We collect account info and gifting preferences to personalize recommendations. We never sell your
              personal information. You control marketing, data exports, and deletion. We secure data with industry best
              practices and only share with trusted processors necessary to run AgentGift.ai (e.g., payments, hosting,
              AI inference).
            </p>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="lead">
            This Privacy Policy explains how we collect, use, share, and protect information when you use AgentGift.ai,
            our websites, apps, and related services (collectively, the "Services"). By using the Services, you agree to
            the practices described here.
          </p>

          <h2 className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-blue-600" />
            1) Information We Collect
          </h2>

          <h3>a) You Provide Directly</h3>
          <ul>
            <li>
              <strong>Account & Profile:</strong> name, email, password (hashed), display photo/emoji, time zone,
              language, role/plan tier.
            </li>
            <li>
              <strong>Gifting Data:</strong> recipients' names, relationships, pronouns, birthdays, interests, sizes,
              wish lists, constraints (e.g., allergies), gift history, notes, sentiment tags, love languages, cultural
              or seasonal preferences you choose to store.
            </li>
            <li>
              <strong>Business Accounts:</strong> company name, team roster, roles, seat assignments, usage context, and
              gifting programs.
            </li>
            <li>
              <strong>Content You Submit:</strong> messages, surveys/quizzes, uploads, feedback, support requests.
            </li>
            <li>
              <strong>Transactions:</strong> purchase details, plan, currency, and partial billing metadata handled by
              our PCI-compliant payment provider.
            </li>
          </ul>

          <h3>b) Collected Automatically</h3>
          <ul>
            <li>
              <strong>Device & Usage:</strong> IP address, device type, browser, OS version, app version, pages viewed,
              referring URLs, feature interactions, crash logs, cookies and similar technologies.
            </li>
            <li>
              <strong>Approximate Location:</strong> derived from IP for security, localization, and compliance. We do
              not track precise GPS.
            </li>
          </ul>

          <h3>c) From Third Parties</h3>
          <ul>
            <li>
              <strong>Auth / Social:</strong> if you choose to connect accounts (e.g., Google), we receive basic profile
              and auth tokens.
            </li>
            <li>
              <strong>Commerce & Logistics:</strong> payment status from our processor; shipping partners may return
              delivery confirmations for physical gifts.
            </li>
          </ul>

          <div className="bg-muted/50 p-4 rounded-lg my-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="mb-0">
                <strong>Recipient Data:</strong> You may store personal information about recipients (friends, family,
                employees). You are responsible for having a lawful basis to provide that information to us. We process
                it solely to deliver the Services you request.
              </p>
            </div>
          </div>

          <h2 className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" />
            2) How We Use Information
          </h2>
          <p>We use information to:</p>
          <ul>
            <li>Provide, personalize, and improve gift recommendations and experiences.</li>
            <li>Power features like reminders, recipient history, and price tracking.</li>
            <li>Operate accounts, authenticate users, and prevent fraud/abuse.</li>
            <li>Process payments, subscriptions, and invoices.</li>
            <li>
              Send transactional emails (e.g., receipts, password resets) and—only with your consent or as permitted by
              law—marketing communications.
            </li>
            <li>Analyze usage to improve reliability, performance, and user experience.</li>
            <li>Comply with legal obligations and enforce terms.</li>
          </ul>

          <p>
            <strong>AI & Personalization:</strong> We may use anonymized/aggregated data to improve models and features.
            We do <strong>not</strong> use your personal content to train third‑party foundation models unless you opt
            in (see <strong>Your Choices</strong> below).
          </p>

          <h2 className="flex items-center gap-2">
            <Users className="h-6 w-6 text-green-600" />
            3) Legal Bases (EEA/UK/Similar)
          </h2>
          <ul>
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

          <h2>4) Sharing & Disclosure</h2>
          <p>
            We do <strong>not</strong> sell your personal information. We share only as needed to operate the Services:
          </p>
          <ul>
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
              <strong>Business Transfers:</strong> if we undergo a merger, acquisition, or asset sale, your data may be
              transferred as part of that transaction subject to this Policy.
            </li>
          </ul>

          <h2>5) Cookies & Similar Technologies</h2>
          <p>
            We use cookies and similar technologies for authentication, preferences, analytics, and performance. You can
            control cookies in your browser settings. Where required, we present a consent banner for optional cookies.
          </p>

          <h2 className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-blue-600" />
            6) Your Choices & Rights
          </h2>
          <ul>
            <li>
              <strong>Email Preferences:</strong> opt out of marketing via the unsubscribe link; you will still receive
              essential transactional emails.
            </li>
            <li>
              <strong>Access/Export:</strong> request a copy of your data.
            </li>
            <li>
              <strong>Correction:</strong> update inaccurate or incomplete information.
            </li>
            <li>
              <strong>Deletion:</strong> request deletion of your account and associated data (subject to limited legal
              exceptions).
            </li>
            <li>
              <strong>Opt‑in/Opt‑out for AI Training:</strong> choose whether your personal data (if ever needed) may be
              used to improve our models. Default is <strong>opt‑out</strong> unless you explicitly enable it.
            </li>
            <li>
              <strong>CCPA/CPRA (California):</strong> right to know, delete, correct, and opt out of sale/share or
              targeted advertising. We do not sell personal information. You may submit requests via the methods below.
            </li>
            <li>
              <strong>GDPR (EEA/UK):</strong> rights to access, rectify, erase, restrict, port, and object.
            </li>
          </ul>

          <p>
            To exercise rights: email{" "}
            <strong>
              <a href="mailto:privacy@agentgift.ai">privacy@agentgift.ai</a>
            </strong>{" "}
            or use in‑app controls (where available). We will verify your request consistent with applicable law.
          </p>

          <h2>7) Data Retention</h2>
          <p>
            We retain information while your account is active and as needed for the purposes described above. We may
            also retain limited information to comply with legal obligations, resolve disputes, and enforce agreements.
            When no longer needed, we delete or de‑identify data.
          </p>

          <h2>8) Security</h2>
          <p>
            We use administrative, technical, and physical safeguards including encryption in transit, access controls,
            role‑based permissions, audit logs, and regular backups. No method of transmission or storage is 100%
            secure; we work continuously to improve our protections.
          </p>

          <h2 className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-green-600" />
            9) International Data Transfers
          </h2>
          <p>
            We may process and store information in the United States and other countries. Where required, we use
            appropriate safeguards such as standard contractual clauses.
          </p>

          <h2>10) Children's Privacy</h2>
          <p>
            AgentGift.ai is not directed to children under 13 (or the minimum age required in your country). We do not
            knowingly collect personal information from children. If you believe a child has provided us personal
            information, contact us to request deletion.
          </p>

          <h2>11) Third‑Party Links</h2>
          <p>
            Our Services may link to third‑party sites or services. Their privacy practices are governed by their own
            policies.
          </p>

          <h2>12) Changes to This Policy</h2>
          <p>
            We may update this Policy from time to time. Material changes will be posted on this page with a new
            effective date. If changes are significant, we will provide additional notice where required by law.
          </p>

          <h2 className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-green-600" />
            13) Contact Us
          </h2>
          <div className="bg-muted/50 p-6 rounded-lg">
            <p className="font-semibold mb-2">AgentGift LLC</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <strong>Email:</strong>{" "}
                <a href="mailto:privacy@agentgift.ai" className="text-primary hover:underline">
                  privacy@agentgift.ai
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <strong>Support:</strong>{" "}
                <a href="mailto:support@agentgift.ai" className="text-primary hover:underline">
                  support@agentgift.ai
                </a>
              </div>
              <div>
                <strong>Mailing Address:</strong> [Add your business mailing address]
              </div>
            </div>
          </div>

          <h2>Regional Disclosures (Summary)</h2>
          <ul>
            <li>
              <strong>California Residents (CCPA/CPRA):</strong> We do not sell personal information. To exercise
              rights, email <a href="mailto:privacy@agentgift.ai">privacy@agentgift.ai</a> and specify that your request
              is a "California privacy request." You may designate an authorized agent to act for you.
            </li>
            <li>
              <strong>EEA/UK:</strong> AgentGift LLC is the data controller for personal data processed via the
              Services. You may lodge a complaint with your local supervisory authority.
            </li>
          </ul>

          <h2>Do Not Sell or Share My Personal Information</h2>
          <p>
            We do not sell or share personal information for cross‑context behavioral advertising as defined by the
            CPRA. If our practices change, we will update this Policy and provide a mechanism to opt out.
          </p>

          <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg mt-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Pro tips for users:
            </h3>
            <ul className="mb-0">
              <li>Use strong, unique passwords and enable available security features.</li>
              <li>Review recipient data you store to ensure you have consent to share.</li>
              <li>Periodically export and clean up old data you no longer need.</li>
            </ul>
          </div>

          <div className="text-center mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground italic">
              This document is a general template and does not constitute legal advice. Please tailor it to your
              operations and consult counsel as needed.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 pt-8 border-t">
          <Link href="/legal/terms">
            <Button variant="outline">Terms of Service</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">Contact Support</Button>
          </Link>
          <Link href="/">
            <Button>Back to AgentGift.ai</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
