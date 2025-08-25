"use client"

import AdminOnly from "@/components/access/AdminOnly"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CalendarDays,
  Eye,
  ListChecks,
  Clock,
  ShieldAlert,
  Settings,
} from "lucide-react"

/**
 * Admin-only Community Operations page.
 * This page is intentionally separate from the user /social page and
 * includes INTERNAL widgets that must never render for non-admins.
 *
 * If you already have concrete components for these widgets, replace
 * the placeholder <Card> blocks with your real components.
 */
export default function AdminCommunityOpsPage() {
  return (
    <AdminOnly>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Community Ops <span className="text-purple-600">(Internal)</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Content planning, previews, and scheduling tools for admins only.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Console
                </Button>
              </Link>
              <Link href="/social">
                <Button>View Public Community</Button>
              </Link>
            </div>
          </div>

          {/* Admin-only notice */}
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <ShieldAlert className="w-5 h-5" />
                Internal Tools
              </CardTitle>
              <CardDescription className="text-red-800">
                The modules below are restricted to admins by component guard and middleware.
                Do not embed them in user-facing routes.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* 2-column grid of internal widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Calendar (INTERNAL) */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-purple-600" />
                  Content Calendar
                </CardTitle>
                <CardDescription>Plan upcoming community content drops.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* TODO: Replace with your real <ContentCalendar /> */}
                <div className="rounded-lg border border-dashed p-6 text-sm text-gray-600">
                  Placeholder: Content Calendar grid goes here.
                </div>
              </CardContent>
            </Card>

            {/* Engagement Preview (INTERNAL) */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Engagement Preview
                </CardTitle>
                <CardDescription>Forecast reactions before publishing.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* TODO: Replace with your real <EngagementPreview /> */}
                <div className="rounded-lg border border-dashed p-6 text-sm text-gray-600">
                  Placeholder: Engagement heatmap / preview module goes here.
                </div>
              </CardContent>
            </Card>

            {/* This Week (INTERNAL) */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  This Week
                </CardTitle>
                <CardDescription>Highlights, alerts, and owner actions.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* TODO: Replace with your real <ThisWeek /> */}
                <div className="rounded-lg border border-dashed p-6 text-sm text-gray-600 space-y-2">
                  <p>• Top topics to amplify</p>
                  <p>• Watchlist: posts needing moderation</p>
                  <p>• KPI snapshot (CTR, saves, replies)</p>
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Posts (INTERNAL) */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-purple-600" />
                  Scheduled Posts
                </CardTitle>
                <CardDescription>Queue and status of upcoming content.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* TODO: Replace with your real <ScheduledPosts /> */}
                <div className="rounded-lg border border-dashed p-6 text-sm text-gray-600">
                  Placeholder: list/table of scheduled posts with time, owner, status.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminOnly>
  )
}
