# Deliverable D: API Routes & Admin Guards Audit
**Generated:** 2024-01-15  
**Status:** ✅ COMPLETE  
**Total Routes:** 47  
**Unprotected Admin Routes:** 8  
**Missing Validation:** 15

---

## Executive Summary

This comprehensive audit examines all API routes in the AgentGift.ai application, focusing on authentication, authorization, input validation, and security best practices. We've identified **8 unprotected admin routes** and **15 routes with missing input validation**.

### Critical Findings
1. **SECURITY RISK:** 8 admin routes lack authentication middleware
2. **VALIDATION GAP:** 15 routes don't validate user input
3. **RATE LIMITING:** No rate limiting implemented
4. **ERROR HANDLING:** Inconsistent error responses across routes

---

## API Routes Inventory

### 🔴 CRITICAL: Unprotected Admin Routes (8 routes)

#### 1. Feature Management Routes
\`\`\`typescript
// ❌ VULNERABLE
// app/api/admin/features/route.ts
export async function GET() {
  const supabase = createClient(...)
  const { data: features } = await supabase
    .from("registered_features")
    .select("*")
  return NextResponse.json({ features })
}
\`\`\`

**Issues:**
- No authentication check
- No admin role verification
- Direct database access without user context

**Required Fix:**
\`\`\`typescript
// ✅ SECURE
import { withAuth } from "@/lib/middleware/withAuth"

export const GET = withAuth(async (request, context) => {
  // Verify admin role
  if (!context.user?.admin_role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  const supabase = createClient(...)
  const { data: features } = await supabase
    .from("registered_features")
    .select("*")
  
  // Log admin action
  await supabase.from("admin_action_logs").insert({
    admin_id: context.user.id,
    action_type: "view_features",
    action_detail: "Viewed feature list"
  })
  
  return NextResponse.json({ features })
})
\`\`\`

**Affected Routes:**
- `app/api/admin/features/route.ts` (GET, POST)
- `app/api/admin/features/[id]/route.ts` (PATCH, DELETE)

---

#### 2. Social Proof Admin Routes
\`\`\`typescript
// ❌ VULNERABLE
// app/api/admin/social-proofs/route.ts
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { submission_id, action } = body
  
  // Direct approval/rejection without auth check
  await supabase
    .from("social_proofs")
    .update({ status: action === "approve" ? "approved" : "rejected" })
    .eq("id", submission_id)
}
\`\`\`

**Issues:**
- Anyone can approve/reject submissions
- No admin verification
- No audit logging

**Required Fix:**
\`\`\`typescript
// ✅ SECURE
export const PATCH = withAuth(async (request, context) => {
  if (!context.user?.admin_role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  const body = await request.json()
  
  // Validate input
  const schema = z.object({
    submission_id: z.string().uuid(),
    action: z.enum(["approve", "reject"]),
    admin_notes: z.string().optional()
  })
  
  const validated = schema.parse(body)
  
  // Update with admin tracking
  await supabase
    .from("social_proofs")
    .update({
      status: validated.action === "approve" ? "approved" : "rejected",
      reviewed_by: context.user.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: validated.admin_notes
    })
    .eq("id", validated.submission_id)
  
  // Log action
  await supabase.from("admin_action_logs").insert({
    admin_id: context.user.id,
    action_type: "social_proof_review",
    action_detail: `${validated.action}d submission ${validated.submission_id}`,
    target_user_id: submission.user_id
  })
  
  return NextResponse.json({ success: true })
})
\`\`\`

**Affected Routes:**
- `app/api/admin/social-proofs/route.ts` (GET, PATCH)

---

#### 3. Voice Command Routes
\`\`\`typescript
// ❌ VULNERABLE
// app/api/admin/voice-commands/route.ts
export async function POST(request: NextRequest) {
  const { command } = await request.json()
  
  // Parse and execute command without auth
  const parsedIntent = parseVoiceCommand(command)
  
  if (parsedIntent.type === "create_feature") {
    await supabase.from("registered_features").insert(...)
  }
}
\`\`\`

**Issues:**
- No authentication
- Anyone can create features via voice commands
- No rate limiting on expensive operations

**Required Fix:**
\`\`\`typescript
// ✅ SECURE
export const POST = withAuth(async (request, context) => {
  if (!context.user?.admin_role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  const body = await request.json()
  
  // Validate input
  const schema = z.object({
    command: z.string().min(1).max(500)
  })
  
  const { command } = schema.parse(body)
  
  // Rate limit: max 10 commands per minute
  const recentCommands = await supabase
    .from("voice_commands")
    .select("id")
    .eq("admin_id", context.user.id)
    .gte("created_at", new Date(Date.now() - 60000).toISOString())
  
  if (recentCommands.data && recentCommands.data.length >= 10) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    )
  }
  
  // Log command
  const { data: voiceLog } = await supabase
    .from("voice_commands")
    .insert({
      admin_id: context.user.id,
      command_text: command,
      execution_status: "pending"
    })
    .select()
    .single()
  
  // Parse and execute
  const parsedIntent = parseVoiceCommand(command)
  
  // ... rest of logic
})
\`\`\`

**Affected Routes:**
- `app/api/admin/voice-commands/route.ts` (POST)

---

#### 4. Giftverse Control Routes
\`\`\`typescript
// ❌ VULNERABLE
// app/api/admin/giftverse-control/route.ts
export async function POST(request: NextRequest) {
  const { action, parameters } = await request.json()
  
  // Execute admin actions without verification
  switch (action) {
    case "adjust_user_xp":
      await adjustUserXP(parameters.user_id, parameters.xp_change)
      break
    case "ban_user_from_feature":
      await banUserFromFeature(parameters.user_id, parameters.feature_name)
      break
  }
}
\`\`\`

**Issues:**
- No authentication
- No authorization checks
- Can manipulate any user's data
- No audit trail

**Required Fix:**
\`\`\`typescript
// ✅ SECURE
export const POST = withAuth(async (request, context) => {
  // Verify admin role
  if (!context.user?.admin_role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  // Verify super admin for sensitive actions
  const sensitiveActions = ["ban_user_from_feature", "adjust_user_credits"]
  const body = await request.json()
  
  if (sensitiveActions.includes(body.action) && context.user.admin_role !== "super_admin") {
    return NextResponse.json(
      { error: "Super admin access required" },
      { status: 403 }
    )
  }
  
  // Validate input
  const schema = z.object({
    action: z.string(),
    parameters: z.record(z.any()),
    session_id: z.string().optional()
  })
  
  const validated = schema.parse(body)
  
  // Execute with full audit logging
  const result = await executeAdminAction(
    validated.action,
    validated.parameters,
    context.user.id
  )
  
  // Log to admin_action_logs
  await supabase.from("admin_action_logs").insert({
    admin_id: context.user.id,
    session_id: validated.session_id,
    action_type: validated.action,
    action_detail: JSON.stringify(validated.parameters),
    response_data: result,
    execution_status: "success"
  })
  
  return NextResponse.json({ success: true, result })
})
\`\`\`

**Affected Routes:**
- `app/api/admin/giftverse-control/route.ts` (POST)
- `app/api/admin/giftverse-control/voice/route.ts` (POST)

---

#### 5. Reports & Analytics Routes
\`\`\`typescript
// ❌ VULNERABLE
// app/api/admin/reports/route.ts
export async function GET(request: NextRequest) {
  // Fetch sensitive analytics without auth
  const { data: reports } = await supabase
    .from("admin_action_logs")
    .select("*")
  
  return NextResponse.json({ reports })
}
\`\`\`

**Issues:**
- Exposes all admin actions to anyone
- No authentication
- Sensitive data leak

**Required Fix:**
\`\`\`typescript
// ✅ SECURE
export const GET = withAuth(async (request, context) => {
  if (!context.user?.admin_role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  const { searchParams } = new URL(request.url)
  
  // Validate query parameters
  const schema = z.object({
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    action_type: z.string().optional(),
    limit: z.coerce.number().min(1).max(1000).default(100)
  })
  
  const params = schema.parse({
    start_date: searchParams.get("start_date"),
    end_date: searchParams.get("end_date"),
    action_type: searchParams.get("action_type"),
    limit: searchParams.get("limit")
  })
  
  // Build query with filters
  let query = supabase
    .from("admin_action_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(params.limit)
  
  if (params.start_date) {
    query = query.gte("created_at", params.start_date)
  }
  
  if (params.end_date) {
    query = query.lte("created_at", params.end_date)
  }
  
  if (params.action_type) {
    query = query.eq("action_type", params.action_type)
  }
  
  const { data: reports, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ reports, total: reports.length })
})
\`\`\`

**Affected Routes:**
- `app/api/admin/reports/route.ts` (GET)
- `app/api/admin/reports/export/route.ts` (POST)
- `app/api/admin/reports/discord-webhook/route.ts` (POST)

---

#### 6. Feature Analytics Routes
\`\`\`typescript
// ❌ VULNERABLE
// app/api/admin/feature-analytics/route.ts
export async function GET(request: NextRequest) {
  // Return analytics without auth check
  const mockAnalytics = {
    totalFeatures: 12,
    activeFeatures: 8,
    weeklyUsage: 1247
  }
  
  return NextResponse.json(mockAnalytics)
}
\`\`\`

**Issues:**
- No authentication
- Exposes business metrics
- No rate limiting

**Required Fix:**
\`\`\`typescript
// ✅ SECURE
export const GET = withAuth(async (request, context) => {
  if (!context.user?.admin_role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  // Fetch real analytics from database
  const analytics = await generateFeatureAnalytics(context.user.id)
  
  // Log access
  await supabase.from("admin_action_logs").insert({
    admin_id: context.user.id,
    action_type: "view_analytics",
    action_detail: "Viewed feature analytics dashboard"
  })
  
  return NextResponse.json(analytics)
})
\`\`\`

**Affected Routes:**
- `app/api/admin/feature-analytics/route.ts` (GET)

---

#### 7. Great Samaritan Admin Routes
\`\`\`typescript
// ❌ VULNERABLE
// app/api/admin/great-samaritan/awards/route.ts
export async function POST(request: NextRequest) {
  const { user_id, award_type } = await request.json()
  
  // Award without verification
  await supabase.from("great_samaritan_awards").insert({
    user_id,
    award_type
  })
}
\`\`\`

**Issues:**
- No authentication
- Anyone can award themselves
- No validation

**Required Fix:**
\`\`\`typescript
// ✅ SECURE
export const POST = withAuth(async (request, context) => {
  if (!context.user?.admin_role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  const body = await request.json()
  
  // Validate input
  const schema = z.object({
    user_id: z.string().uuid(),
    award_type: z.enum(["lunch_drop", "community_hero", "kindness_champion"]),
    reason: z.string().min(10).max(500)
  })
  
  const validated = schema.parse(body)
  
  // Check if user exists
  const { data: user } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("id", validated.user_id)
    .single()
  
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  
  // Award with admin tracking
  await supabase.from("great_samaritan_awards").insert({
    user_id: validated.user_id,
    award_type: validated.award_type,
    reason: validated.reason,
    awarded_by: context.user.id,
    awarded_at: new Date().toISOString()
  })
  
  // Log action
  await supabase.from("admin_action_logs").insert({
    admin_id: context.user.id,
    action_type: "award_great_samaritan",
    action_detail: `Awarded ${validated.award_type} to user ${validated.user_id}`,
    target_user_id: validated.user_id
  })
  
  return NextResponse.json({ success: true })
})
\`\`\`

**Affected Routes:**
- `app/api/admin/great-samaritan/awards/route.ts` (POST)
- `app/api/admin/great-samaritan/lunch-drop/route.ts` (POST)
- `app/api/admin/great-samaritan/participants/route.ts` (GET)

---

#### 8. Assistant Sync Routes
\`\`\`typescript
// ❌ VULNERABLE
// app/api/admin/sync-assistants/route.ts
export async function POST(request: NextRequest) {
  // Sync assistants without auth
  const result = await syncAssistantsFromOpenAI()
  return NextResponse.json(result)
}
\`\`\`

**Issues:**
- No authentication
- Expensive operation (calls OpenAI API)
- No rate limiting

**Required Fix:**
\`\`\`typescript
// ✅ SECURE
export const POST = withAuth(async (request, context) => {
  if (!context.user?.admin_role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  // Rate limit: max 1 sync per hour per admin
  const recentSyncs = await supabase
    .from("admin_action_logs")
    .select("id")
    .eq("admin_id", context.user.id)
    .eq("action_type", "sync_assistants")
    .gte("created_at", new Date(Date.now() - 3600000).toISOString())
  
  if (recentSyncs.data && recentSyncs.data.length > 0) {
    return NextResponse.json(
      { error: "Sync already performed in the last hour" },
      { status: 429 }
    )
  }
  
  // Perform sync
  const result = await syncAssistantsFromOpenAI()
  
  // Log action
  await supabase.from("admin_action_logs").insert({
    admin_id: context.user.id,
    action_type: "sync_assistants",
    action_detail: `Synced ${result.synced_count} assistants`,
    response_data: result
  })
  
  return NextResponse.json(result)
})
\`\`\`

**Affected Routes:**
- `app/api/admin/sync-assistants/route.ts` (POST)

---

### ⚠️ Missing Input Validation (15 routes)

#### User-Facing Routes Without Validation

1. **Gift Questionnaire**
\`\`\`typescript
// app/api/gift-questionnaire/route.ts
// ❌ No validation
const data = await request.json()
// Uses data.recipientName, data.interests directly
\`\`\`

**Required Fix:**
\`\`\`typescript
import { z } from "zod"

const questionnaireSchema = z.object({
  recipientName: z.string().min(1).max(100),
  relationship: z.enum([
    "Romantic Partner",
    "Spouse",
    "Best Friend",
    "Family Member",
    "Close Friend",
    "Colleague",
    "Acquaintance"
  ]),
  birthday: z.string().date().optional(),
  loveLanguage: z.enum([
    "Words of Affirmation",
    "Quality Time",
    "Physical Touch",
    "Acts of Service",
    "Receiving Gifts"
  ]),
  interests: z.array(z.string()).min(1).max(10),
  hobbies: z.string().max(500).optional()
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  try {
    const validated = questionnaireSchema.parse(body)
    // Use validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    throw error
  }
}
\`\`\`

---

2. **Serendipity Reveal**
\`\`\`typescript
// app/api/serendipity/reveal/route.ts
// ❌ No validation
const { key } = await request.json()
\`\`\`

**Required Fix:**
\`\`\`typescript
const revealSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s]+$/)
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { key } = revealSchema.parse(body)
  // ... rest of logic
}
\`\`\`

---

3. **AgentVault Bidding**
\`\`\`typescript
// app/api/agentvault/bid/route.ts
// ❌ No validation
const { item_id, bid_amount } = await request.json()
\`\`\`

**Required Fix:**
\`\`\`typescript
const bidSchema = z.object({
  item_id: z.string().uuid(),
  bid_amount: z.number().int().positive().max(1000000)
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validated = bidSchema.parse(body)
  
  // Additional business logic validation
  const { data: item } = await supabase
    .from("agentvault_items")
    .select("current_bid")
    .eq("id", validated.item_id)
    .single()
  
  if (validated.bid_amount <= (item?.current_bid || 0)) {
    return NextResponse.json(
      { error: "Bid must be higher than current bid" },
      { status: 400 }
    )
  }
  
  // ... rest of logic
}
\`\`\`

---

4. **EmotiTokens Transfer**
\`\`\`typescript
// app/api/emotitokens/send/route.ts
// ❌ No validation
const { recipient_id, amount, message } = await request.json()
\`\`\`

**Required Fix:**
\`\`\`typescript
const transferSchema = z.object({
  recipient_id: z.string().uuid(),
  amount: z.number().int().positive().max(10000),
  message: z.string().min(1).max(500).optional()
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validated = transferSchema.parse(body)
  
  // Check sender balance
  const { data: sender } = await supabase
    .from("emotitokens")
    .select("balance")
    .eq("user_id", context.user.id)
    .single()
  
  if (!sender || sender.balance < validated.amount) {
    return NextResponse.json(
      { error: "Insufficient balance" },
      { status: 400 }
    )
  }
  
  // ... rest of logic
}
\`\`\`

---

5. **Gift Entry Leads**
\`\`\`typescript
// app/api/gift-entry-leads/route.ts
// ❌ No validation
const { email, name, gift_context } = await request.json()
\`\`\`

**Required Fix:**
\`\`\`typescript
const leadSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  gift_context: z.string().max(1000).optional(),
  source: z.string().default("landing_page")
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validated = leadSchema.parse(body)
  
  // Check for duplicate email
  const { data: existing } = await supabase
    .from("gift_entry_leads")
    .select("id")
    .eq("email", validated.email)
    .single()
  
  if (existing) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    )
  }
  
  // ... rest of logic
}
\`\`\`

---

**Other Routes Needing Validation:**
6. `app/api/concierge/chat/route.ts` - Chat messages
7. `app/api/ghost-hunt/sessions/route.ts` - Game session data
8. `app/api/thought-heist/sessions/route.ts` - Game session data
9. `app/api/bondcraft/start-session/route.ts` - Partner data
10. `app/api/giftbridge/nominations/route.ts` - Nomination data
11. `app/api/giftbridge/votes/route.ts` - Vote data
12. `app/api/social-campaigns/route.ts` - Campaign data
13. `app/api/features/pride-alliance/route.ts` - Alliance data
14. `app/api/features/dynamic/route.ts` - Dynamic feature data
15. `app/api/voice/whisper/route.ts` - Audio data

---

## Security Middleware Implementation

### Complete withAuth Middleware

\`\`\`typescript
// lib/middleware/withAuth.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/types/supabase"

export interface AuthenticatedUser {
  id: string
  email: string
  tier: string
  credits: number
  xp: number
  level: number
  badges: string[]
  prestige_level: string | null
  admin_role: string | null
}

export interface AuthContext {
  user: AuthenticatedUser | null
  hasAccess: (requiredTier: string, creditsNeeded?: number) => boolean
  deductCredits: (amount: number, reason: string) => Promise<boolean>
  isAdmin: () => boolean
  isSuperAdmin: () => boolean
}

export function withAuth<T extends any[]>(
  handler: (req: NextRequest, context: AuthContext, ...args: T) => Promise<Response>,
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    try {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json(
          {
            error: "Authentication service not configured",
            redirect: "/login",
          },
          { status: 503 },
        )
      }

      const supabase = createServerComponentClient<Database>({ cookies })

      // Check session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        return NextResponse.json({ error: "Authentication required", redirect: "/login" }, { status: 401 })
      }

      // Get user profile with credits and tier info
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profileError || !profile) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 })
      }

      const user: AuthenticatedUser = {
        id: profile.id,
        email: session.user.email || "",
        tier: profile.tier || "free",
        credits: profile.credits || 0,
        xp: profile.xp || 0,
        level: profile.level || 1,
        badges: profile.badges || [],
        prestige_level: profile.prestige_level,
        admin_role: profile.admin_role,
      }

      // Tier hierarchy for access checking
      const tierLevels = {
        free: 0,
        premium: 1,
        pro_agent: 2,
        agent_00g: 3,
        business: 4,
        enterprise: 5,
      }

      const hasAccess = (requiredTier: string, creditsNeeded = 0): boolean => {
        const userTierLevel = tierLevels[user.tier as keyof typeof tierLevels] || 0
        const requiredTierLevel = tierLevels[requiredTier as keyof typeof tierLevels] || 0

        const tierAccess = userTierLevel >= requiredTierLevel
        const creditAccess = user.credits >= creditsNeeded

        return tierAccess && creditAccess
      }

      const deductCredits = async (amount: number, reason: string): Promise<boolean> => {
        if (user.credits < amount) return false

        try {
          // Update user credits
          const { error: updateError } = await supabase
            .from("user_profiles")
            .update({
              credits: user.credits - amount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)

          if (updateError) return false

          // Log transaction
          await supabase.from("credit_transactions").insert({
            user_id: user.id,
            amount: -amount,
            reason,
            balance_after: user.credits - amount,
            created_at: new Date().toISOString(),
          })

          // Calculate XP gain (2 credits = 1 XP)
          const xpGained = Math.floor(amount / 2)
          if (xpGained > 0) {
            const newXP = user.xp + xpGained
            const newLevel = Math.floor(newXP / 150) + 1

            await supabase
              .from("user_profiles")
              .update({
                xp: newXP,
                level: newLevel,
              })
              .eq("id", user.id)

            // Log XP gain
            await supabase.from("xp_logs").insert({
              user_id: user.id,
              action: "credits_spent",
              xp_earned: xpGained,
              description: `Credits spent: ${reason}`,
              created_at: new Date().toISOString(),
            })
          }

          // Update local user object
          user.credits -= amount
          user.xp += xpGained

          return true
        } catch (error) {
          console.error("Error deducting credits:", error)
          return false
        }
      }

      const isAdmin = (): boolean => {
        return user.admin_role !== null
      }

      const isSuperAdmin = (): boolean => {
        return user.admin_role === "super_admin"
      }

      const context: AuthContext = {
        user,
        hasAccess,
        deductCredits,
        isAdmin,
        isSuperAdmin,
      }

      return handler(req, context, ...args)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}

// Helper for page-level protection
export async function requireAuth(): Promise<AuthenticatedUser | null> {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return null
    }

    const supabase = createServerComponentClient<Database>({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return null

    const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single()

    if (!profile) return null

    return {
      id: profile.id,
      email: session.user.email || "",
      tier: profile.tier || "free",
      credits: profile.credits || 0,
      xp: profile.xp || 0,
      level: profile.level || 1,
      badges: profile.badges || [],
      prestige_level: profile.prestige_level,
      admin_role: profile.admin_role,
    }
  } catch (error) {
    console.error("requireAuth error:", error)
    return null
  }
}

// Admin-only middleware
export function withAdminAuth<T extends any[]>(
  handler: (req: NextRequest, context: AuthContext, ...args: T) => Promise<Response>,
) {
  return withAuth(async (req: NextRequest, context: AuthContext, ...args: T) => {
    if (!context.isAdmin()) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    return handler(req, context, ...args)
  })
}

// Super admin-only middleware
export function withSuperAdminAuth<T extends any[]>(
  handler: (req: NextRequest, context: AuthContext, ...args: T) => Promise<Response>,
) {
  return withAuth(async (req: NextRequest, context: AuthContext, ...args: T) => {
    if (!context.isSuperAdmin()) {
      return NextResponse.json({ error: "Super admin access required" }, { status: 403 })
    }
    return handler(req, context, ...args)
  })
}
\`\`\`

---

## Rate Limiting Implementation

### Rate Limit Middleware

\`\`\`typescript
// lib/middleware/rateLimit.ts
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyGenerator?: (req: NextRequest) => string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export function rateLimit(config: RateLimitConfig) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const key = config.keyGenerator
      ? config.keyGenerator(req)
      : req.headers.get("x-forwarded-for") || "anonymous"

    const now = Date.now()
    const windowStart = now - config.windowMs

    // Get recent requests
    const { data: recentRequests } = await supabase
      .from("rate_limit_logs")
      .select("id")
      .eq("key", key)
      .gte("timestamp", new Date(windowStart).toISOString())

    if (recentRequests && recentRequests.length >= config.maxRequests) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: Math.ceil(config.windowMs / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(config.windowMs / 1000)),
            "X-RateLimit-Limit": String(config.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil((windowStart + config.windowMs) / 1000)),
          },
        }
      )
    }

    // Log this request
    await supabase.from("rate_limit_logs").insert({
      key,
      timestamp: new Date().toISOString(),
    })

    // Clean up old logs (optional, can be done via cron)
    await supabase
      .from("rate_limit_logs")
      .delete()
      .lt("timestamp", new Date(now - config.windowMs * 2).toISOString())

    return null // Allow request to proceed
  }
}

// Usage example
export function withRateLimit<T extends any[]>(
  config: RateLimitConfig,
  handler: (req: NextRequest, ...args: T) => Promise<Response>
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    const rateLimitResponse = await rateLimit(config)(req)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    return handler(req, ...args)
  }
}
\`\`\`

### Rate Limit Table Schema

\`\`\`sql
-- Create rate limit logs table
CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_key_timestamp 
  ON rate_limit_logs(key, timestamp);

-- Auto-cleanup old logs (runs daily)
CREATE OR REPLACE FUNCTION cleanup_rate_limit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limit_logs
  WHERE timestamp < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;
\`\`\`

---

## Input Validation Library

### Zod Schemas

\`\`\`typescript
// lib/validation/schemas.ts
import { z } from "zod"

// User schemas
export const userProfileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  tier: z.enum(["free", "premium", "pro_agent", "agent_00g", "business", "enterprise"]),
})

// Gift questionnaire schemas
export const questionnaireSchema = z.object({
  recipientName: z.string().min(1).max(100),
  relationship: z.enum([
    "Romantic Partner",
    "Spouse",
    "Best Friend",
    "Family Member",
    "Close Friend",
    "Colleague",
    "Acquaintance",
  ]),
  birthday: z.string().date().optional(),
  loveLanguage: z.enum([
    "Words of Affirmation",
    "Quality Time",
    "Physical Touch",
    "Acts of Service",
    "Receiving Gifts",
  ]),
  interests: z.array(z.string()).min(1).max(10),
  hobbies: z.string().max(500).optional(),
})

// Feature schemas
export const featureCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  credit_cost: z.number().int().min(0).max(100),
  xp_award: z.number().int().min(0).max(1000),
  tier_access: z.array(z.string()),
  ui_type: z.enum(["modal", "quiz", "form", "tile"]),
})

// Admin action schemas
export const adminActionSchema = z.object({
  action: z.string(),
  parameters: z.record(z.any()),
  session_id: z.string().optional(),
  target_user_id: z.string().uuid().optional(),
})

// Bid schemas
export const bidSchema = z.object({
  item_id: z.string().uuid(),
  bid_amount: z.number().int().positive().max(1000000),
})

// Transfer schemas
export const transferSchema = z.object({
  recipient_id: z.string().uuid(),
  amount: z.number().int().positive().max(10000),
  message: z.string().min(1).max(500).optional(),
})

// Lead capture schemas
export const leadSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  gift_context: z.string().max(1000).optional(),
  source: z.string().default("landing_page"),
})

// Chat schemas
export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  persona: z.enum(["avelyn", "galen", "lumience"]).optional(),
  context: z.record(z.any()).optional(),
})

// Game session schemas
export const gameSessionSchema = z.object({
  target_person: z.string().min(1).max(100),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
})

// Nomination schemas
export const nominationSchema = z.object({
  nominee_name: z.string().min(1).max(100),
  nominee_story: z.string().min(10).max(2000),
  gift_idea: z.string().max(500).optional(),
})

// Vote schemas
export const voteSchema = z.object({
  nomination_id: z.string().uuid(),
})

// Helper function to validate and return errors
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error }
    }
    throw error
  }
}
\`\`\`

---

## Error Handling Standards

### Standardized Error Responses

\`\`\`typescript
// lib/errors/apiErrors.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = "APIError"
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(400, message, "VALIDATION_ERROR", details)
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = "Authentication required") {
    super(401, message, "AUTHENTICATION_ERROR")
    this.name = "AuthenticationError"
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = "Insufficient permissions") {
    super(403, message, "AUTHORIZATION_ERROR")
    this.name = "AuthorizationError"
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export class RateLimitError extends APIError {
  constructor(retryAfter: number) {
    super(429, "Rate limit exceeded", "RATE_LIMIT_EXCEEDED", { retryAfter })
    this.name = "RateLimitError"
  }
}

export class InternalServerError extends APIError {
  constructor(message: string = "Internal server error") {
    super(500, message, "INTERNAL_SERVER_ERROR")
    this.name = "InternalServerError"
  }
}

// Error handler middleware
export function handleAPIError(error: unknown): Response {
  console.error("API Error:", error)

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.errors,
      },
      { status: 400 }
    )
  }

  // Unknown error
  return NextResponse.json(
    {
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 }
  )
}

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    // Your logic here
    throw new ValidationError("Invalid input", { field: "email" })
  } catch (error) {
    return handleAPIError(error)
  }
}
\`\`\`

---

## Action Plan

### Phase 1: Critical Security Fixes (Week 1)

**Day 1-2: Implement Auth Middleware**
- [ ] Update `lib/middleware/withAuth.ts` with complete implementation
- [ ] Add `withAdminAuth` and `withSuperAdminAuth` helpers
- [ ] Test middleware with sample routes

**Day 3-4: Protect Admin Routes**
- [ ] Apply `withAdminAuth` to all 8 unprotected admin routes
- [ ] Add role-based access control
- [ ] Add audit logging to all admin actions
- [ ] Test admin routes with different user roles

**Day 5: Add Input Validation**
- [ ] Create Zod schemas for all API routes
- [ ] Apply validation to 15 routes missing validation
- [ ] Add error handling for validation failures
- [ ] Test with invalid inputs

---

### Phase 2: Rate Limiting & Monitoring (Week 2)

**Day 1-2: Implement Rate Limiting**
- [ ] Create rate limit middleware
- [ ] Add rate limit table to database
- [ ] Apply rate limiting to expensive routes
- [ ] Test rate limits with load testing

**Day 3-4: Add Error Handling**
- [ ] Standardize error responses across all routes
- [ ] Add error logging to Supabase
- [ ] Implement error monitoring
- [ ] Add user-friendly error messages

**Day 5: Testing & Documentation**
- [ ] Write integration tests for protected routes
- [ ] Document all API endpoints
- [ ] Create API documentation
- [ ] Update README with security guidelines

---

### Phase 3: Optimization & Polish (Week 3)

**Day 1-2: Performance Optimization**
- [ ] Optimize database queries
- [ ] Add caching where appropriate
- [ ] Implement request deduplication
- [ ] Add performance monitoring

**Day 3-4: Security Audit**
- [ ] Run security scan on all routes
- [ ] Test for common vulnerabilities (SQL injection, XSS, CSRF)
- [ ] Review and update RLS policies
- [ ] Implement security headers

**Day 5: Final Testing & Deployment**
- [ ] Run full test suite
- [ ] Deploy to staging
- [ ] Perform security testing
- [ ] Deploy to production

---

## Success Metrics

### Before Fixes
- ❌ 8 unprotected admin routes
- ❌ 15 routes without input validation
- ❌ 0 routes with rate limiting
- ❌ Inconsistent error handling
- ❌ No audit logging

### After Fixes
- ✅ 0 unprotected admin routes
- ✅ 100% input validation coverage
- ✅ Rate limiting on all expensive routes
- ✅ Standardized error responses
- ✅ Complete audit trail for admin actions

---

## Testing Checklist

### Authentication Tests
- [ ] Unauthenticated requests are rejected
- [ ] Invalid tokens are rejected
- [ ] Expired sessions are handled correctly
- [ ] User context is properly populated

### Authorization Tests
- [ ] Non-admin users cannot access admin routes
- [ ] Regular admins cannot access super admin routes
- [ ] Tier-based access control works correctly
- [ ] Credit requirements are enforced

### Validation Tests
- [ ] Invalid inputs are rejected with clear errors
- [ ] Edge cases are handled (empty strings, null values, etc.)
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized

### Rate Limiting Tests
- [ ] Rate limits are enforced correctly
- [ ] Rate limit headers are returned
- [ ] Rate limits reset after window expires
- [ ] Different users have separate rate limits

### Error Handling Tests
- [ ] All errors return consistent format
- [ ] Error codes are meaningful
- [ ] Stack traces are not exposed in production
- [ ] Errors are logged correctly

---

## Next Steps

1. **Review this audit** with the development team
2. **Prioritize fixes** based on security risk
3. **Assign tasks** to developers
4. **Set deadlines** for each phase
5. **Begin implementation** with Phase 1

**Estimated Total Time:** 3 weeks (15 working days)  
**Recommended Team Size:** 2-3 developers  
**Risk Level:** MEDIUM (requires careful testing)

---

## Appendix: Quick Reference

### Apply Auth to Route
\`\`\`typescript
import { withAuth } from "@/lib/middleware/withAuth"

export const GET = withAuth(async (request, context) => {
  // context.user is available
  // context.hasAccess() checks tier/credits
  // context.deductCredits() handles payments
})
\`\`\`

### Apply Admin Auth to Route
\`\`\`typescript
import { withAdminAuth } from "@/lib/middleware/withAuth"

export const POST = withAdminAuth(async (request, context) => {
  // Only admins can access
  // context.isAdmin() returns true
  // context.isSuperAdmin() checks super admin
})
\`\`\`

### Add Input Validation
\`\`\`typescript
import { z } from "zod"

const schema = z.object({
  field: z.string().min(1).max(100)
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validated = schema.parse(body) // Throws on invalid
  // Use validated data
}
\`\`\`

### Add Rate Limiting
\`\`\`typescript
import { withRateLimit } from "@/lib/middleware/rateLimit"

export const POST = withRateLimit(
  {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
  },
  async (request) => {
    // Your logic here
  }
)
