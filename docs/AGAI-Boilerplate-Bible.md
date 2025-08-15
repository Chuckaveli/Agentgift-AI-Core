# 🎯 AGAI (AgentGift.AI) Boilerplate Bible v3.0

## 📋 Table of Contents
1. [Platform Overview](#platform-overview)
2. [Tech Stack](#tech-stack)
3. [Core Architecture](#core-architecture)
4. [Authentication & Authorization](#authentication--authorization)
5. [Tokenomics Engine (AGTE v3.0)](#tokenomics-engine-agte-v30)
6. [Feature Development](#feature-development)
7. [Database Schema](#database-schema)
8. [API Patterns](#api-patterns)
9. [Component Library](#component-library)
10. [Deployment & Environment](#deployment--environment)

---

## 🌟 Platform Overview

**AgentGift.AI** is a gamified, AI-powered gift recommendation platform that helps users find meaningful gifts through intelligent matching, emotional analysis, and personalized experiences.

### Core Value Proposition
- **AI-Powered Matching**: Intelligent gift recommendations based on personality, mood, and context
- **Gamified Experience**: XP, levels, badges, and prestige system to encourage engagement
- **Tier-Based Access**: Freemium model with progressive feature unlocks
- **Social Integration**: Community features and social proof verification
- **Business Tools**: B2B solutions for companies and teams

### Key Features
- **Agent Gifty**: QR code gift drops and reveals
- **Gift DNA Quiz**: Personality-based gift matching
- **Emotion Tags**: Mood-based gift filtering
- **Group Splitter**: Collaborative gift coordination
- **AI Companion**: Emotional gifting coach (Pro+ only)
- **Social Proof Verifier**: Earn XP through social media participation
- **Smart Reminders**: AI-powered gift scheduling
- **Gift Campaigns**: Multi-step gift experiences

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework with server components
- **React 18** with TypeScript - Component library and type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless functions
- **Supabase** - PostgreSQL database + Authentication
- **Vercel** - Hosting and deployment platform

### Key Dependencies
\`\`\`json
{
  "@supabase/auth-helpers-nextjs": "^0.8.7",
  "@supabase/supabase-js": "^2.38.4",
  "framer-motion": "^10.16.16",
  "lucide-react": "^0.294.0",
  "tailwindcss": "^3.3.6",
  "typescript": "^5.2.2",
  "next": "14.0.0"
}
\`\`\`

---

## 🏗️ Core Architecture

### File Structure
\`\`\`
/app
  /api                 # API routes and handlers
    /admin            # Admin-only endpoints
    /features         # Feature-specific APIs
    /auth             # Authentication endpoints
  /dashboard          # User dashboard pages
  /features           # Feature pages (/features/[name])
  /admin             # Admin panel pages
  /business          # B2B pages and tools
  /tokenomics        # Public tokenomics page
  /terms             # Legal and transparency
  /contact           # Support and contact
  
/components
  /ui                # shadcn/ui base components
  /global            # Reusable platform components
  /admin             # Admin-specific components
  /feature-access    # Access control components
  
/lib
  /middleware        # Auth & access control
  /helpers          # Utility functions
  /supabase         # Database client setup
  
/features
  /[feature-name]   # Modular feature organization
    component.tsx   # Main React component
    route.ts       # API handler
    modal.tsx      # Optional modal component
    
/scripts
  *.sql            # Database migration scripts
\`\`\`

### Design Principles
- **Mobile-First**: All components responsive by default
- **Modular Architecture**: Features organized in `/features/[name]/`
- **Plug-and-Play**: Easy to add/remove features via admin panel
- **SOLID Foundation**: Scalable and maintainable code structure
- **Type Safety**: Full TypeScript implementation

---

## 🔐 Authentication & Authorization

### Middleware Protection System

#### Global Route Protection
\`\`\`typescript
// middleware.ts - Protects routes globally
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

const protectedRoutes = ["/dashboard", "/admin", "/features", "/business"]
const adminRoutes = ["/admin", "/api/admin"]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  
  return res
}
\`\`\`

#### API Route Protection
\`\`\`typescript
// lib/middleware/withAuth.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export function withAuth(handler: Function) {
  return async (req: Request) => {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    // Get user profile with credits and tier
    const { data: user } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    // Credit deduction helper
    const deductCredits = async (amount: number, reason: string) => {
      if (user.credits < amount) return false
      
      await supabase
        .from('user_profiles')
        .update({ credits: user.credits - amount })
        .eq('id', user.id)
      
      // Log transaction and add XP
      await logCreditTransaction(user.id, amount, reason)
      await addXP(user.id, Math.floor(amount / 2))
      
      return true
    }
    
    return handler(req, { user, session, supabase, deductCredits })
  }
}
\`\`\`

#### Client-Side Access Checking
\`\`\`typescript
// lib/helpers/checkUserAccess.ts
export const FEATURE_CONFIGS = {
  'agent-gifty': {
    name: 'Agent Gifty',
    requiredTier: 'free_agent',
    creditsNeeded: 1,
    enabled: true
  },
  'ai-companion': {
    name: 'AI Companion',
    requiredTier: 'agent_00g',
    creditsNeeded: 5,
    enabled: true
  },
  'gift-campaigns': {
    name: 'Gift Campaigns',
    requiredTier: 'pro_agent',
    creditsNeeded: 3,
    enabled: true
  }
}

export async function checkUserAccess(featureName: string) {
  const config = FEATURE_CONFIGS[featureName]
  if (!config || !config.enabled) {
    return { accessGranted: false, fallbackReason: 'Feature not available' }
  }
  
  const user = await getCurrentUser()
  if (!user) {
    return { accessGranted: false, fallbackReason: 'Not authenticated' }
  }
  
  // Check tier access
  if (!TierEnforcement.hasAccess(user.tier, config.requiredTier)) {
    return { 
      accessGranted: false, 
      fallbackReason: 'Tier upgrade required',
      upgradeRequired: true 
    }
  }
  
  // Check credits
  if (user.credits < config.creditsNeeded) {
    return { 
      accessGranted: false, 
      fallbackReason: 'Insufficient credits',
      creditsNeeded: config.creditsNeeded,
      creditsAvailable: user.credits 
    }
  }
  
  return { accessGranted: true }
}
\`\`\`

---

## 🎮 Tokenomics Engine (AGTE v3.0)

### Core Formula
- **2 Credits = 1 XP**
- **150 XP = 1 Level**
- **100 Levels Total = Prestige Unlock**

### Tier System Hierarchy
\`\`\`typescript
export const TIER_HIERARCHY = {
  free_agent: 0,
  premium_spy: 1,
  pro_agent: 2,
  agent_00g: 3,
  small_biz: 4,
  enterprise: 5
}

export const TIER_CREDITS = {
  free_agent: 10,      // per month
  premium_spy: 50,     // per month
  pro_agent: 150,      // per month
  agent_00g: 500,      // per month
  small_biz: 1000,     // per month
  enterprise: 5000     // per month
}
\`\`\`

### Prestige System
\`\`\`typescript
export const PRESTIGE_BENEFITS = {
  silver: {
    discount: 0.10,    // 10% lifetime discount
    level_requirement: 100,
    badge: 'prestige_silver'
  },
  gold: {
    discount: 0.20,    // 20% lifetime discount
    level_requirement: 200,
    badge: 'prestige_gold'
  },
  diamond: {
    discount: 0.50,    // 50% lifetime discount
    level_requirement: 300,
    badge: 'prestige_diamond',
    exclusive_features: ['voice_agents', 'nft_drops', 'partner_tools']
  }
}
\`\`\`

### XP Sources and Values
\`\`\`typescript
export const XP_ACTIONS = {
  feature_use: 10,
  social_share: 50,
  gift_chain_complete: 100,
  friend_invite: 75,
  review_submit: 30,
  badge_unlock: 25,
  level_up: 50,
  campaign_complete: 200
}
\`\`\`

### Implementation Examples
\`\`\`typescript
// Add XP to user
import { XPEngine } from '@/lib/global-logic'

await XPEngine.addXP(userId, 25, 'Feature completed')

// Check for level up
const levelUp = await XPEngine.checkLevelUp(userId)
if (levelUp) {
  await BadgeSystem.unlockBadge(userId, `level_${levelUp.newLevel}`)
}

// Check prestige eligibility
if (XPEngine.shouldTriggerPrestige(userLevel)) {
  await XPEngine.triggerPrestige(userId, 'silver')
}
\`\`\`

---

## 🧩 Feature Development

### Creating New Features

#### 1. Feature Folder Structure
\`\`\`bash
mkdir features/my-new-feature
touch features/my-new-feature/component.tsx
touch features/my-new-feature/route.ts
touch features/my-new-feature/modal.tsx  # optional
\`\`\`

#### 2. Component Implementation
\`\`\`typescript
// features/my-new-feature/component.tsx
"use client"
import { useState } from 'react'
import { FeatureGateWrapper } from '@/components/ui/FeatureGateWrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function MyNewFeature() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFeatureAction = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/features/my-new-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success!",
          description: `Feature completed! +${data.xp_gained} XP earned`,
          variant: "success"
        })
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <FeatureGateWrapper 
      featureName="my-new-feature"
      showLockedPreview={true}
      previewContent={
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle>My New Feature (Locked)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Upgrade to access this amazing feature!</p>
          </CardContent>
        </Card>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>My New Feature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This is your new feature content.</p>
          <Button 
            onClick={handleFeatureAction}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Use Feature (2 Credits)'}
          </Button>
        </CardContent>
      </Card>
    </FeatureGateWrapper>
  )
}
\`\`\`

#### 3. API Handler
\`\`\`typescript
// features/my-new-feature/route.ts
import { withAuth } from '@/lib/middleware/withAuth'
import { NextRequest } from 'next/server'

export const POST = withAuth(async (req: NextRequest, { user, deductCredits }) => {
  try {
    const body = await req.json()
    const { action } = body
    
    // Deduct credits (2 credits for this feature)
    const success = await deductCredits(2, 'My New Feature')
    if (!success) {
      return Response.json({ 
        error: 'Insufficient credits',
        creditsNeeded: 2,
        creditsAvailable: user.credits 
      }, { status: 402 })
    }
    
    // Process feature logic here
    let result
    switch (action) {
      case 'process':
        result = await processFeatureLogic(user.id, body)
        break
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 })
    }
    
    // Return success with XP gained (2 credits = 1 XP)
    return Response.json({ 
      success: true, 
      data: result,
      xp_gained: 1,
      credits_used: 2
    })
    
  } catch (error) {
    console.error('Feature error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})

async function processFeatureLogic(userId: string, data: any) {
  // Your feature logic here
  return { message: 'Feature processed successfully' }
}
\`\`\`

#### 4. Register Feature
\`\`\`typescript
// Add to lib/helpers/checkUserAccess.ts
export const FEATURE_CONFIGS = {
  // ... existing features
  'my-new-feature': {
    name: 'My New Feature',
    description: 'A new amazing feature for users',
    requiredTier: 'premium_spy',
    creditsNeeded: 2,
    enabled: true,
    category: 'tools'
  }
}
\`\`\`

#### 5. Add to Dashboard
\`\`\`typescript
// The feature will automatically appear in the dashboard
// based on the user's tier and the feature configuration
\`\`\`

---

## 🗄️ Database Schema

### Core Tables

#### User Profiles
\`\`\`sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  tier TEXT DEFAULT 'free_agent' CHECK (tier IN ('free_agent', 'premium_spy', 'pro_agent', 'agent_00g', 'small_biz', 'enterprise')),
  credits INTEGER DEFAULT 10,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges TEXT[] DEFAULT '{}',
  prestige_level TEXT CHECK (prestige_level IN ('silver', 'gold', 'diamond')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### Feature Usage Tracking
\`\`\`sql
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  credits_used INTEGER NOT NULL,
  xp_gained INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### XP Transaction Logs
\`\`\`sql
CREATE TABLE xp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  feature_name TEXT,
  level_before INTEGER,
  level_after INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### Badge System
\`\`\`sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_type TEXT CHECK (badge_type IN ('level', 'seasonal', 'prestige', 'action')),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
\`\`\`

#### Credit Transactions
\`\`\`sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- negative for deductions, positive for additions
  reason TEXT NOT NULL,
  feature_name TEXT,
  balance_before INTEGER,
  balance_after INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Feature-Specific Tables

#### Social Proof Verifier
\`\`\`sql
CREATE TABLE social_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'twitter')),
  post_url TEXT NOT NULL,
  image_hash TEXT,
  caption_text TEXT,
  hashtags TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  xp_awarded INTEGER DEFAULT 0,
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);
\`\`\`

#### Reminder Scheduler
\`\`\`sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('birthday', 'anniversary', 'holiday', 'just-because')),
  priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
  notes TEXT,
  ai_recommended_gift JSONB,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### Gift Campaigns
\`\`\`sql
CREATE TABLE campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  steps JSONB NOT NULL,
  required_features TEXT[],
  mood_tags TEXT[],
  difficulty_level INTEGER DEFAULT 1,
  estimated_cost INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES campaign_templates(id),
  current_step INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  xp_earned INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
\`\`\`

---

## 🔌 API Patterns

### Standard Response Format
\`\`\`typescript
// Success Response
interface SuccessResponse {
  success: true
  data?: any
  xp_gained?: number
  level_up?: boolean
  badge_unlocked?: string
  credits_used?: number
}

// Error Response  
interface ErrorResponse {
  error: string
  code?: string
  details?: any
  creditsNeeded?: number
  creditsAvailable?: number
}
\`\`\`

### Credit Deduction Pattern
\`\`\`typescript
export const POST = withAuth(async (req: NextRequest, { user, deductCredits }) => {
  try {
    const body = await req.json()
    const creditsNeeded = 2 // Define based on feature
    
    // Check and deduct credits
    const success = await deductCredits(creditsNeeded, 'Feature Name')
    if (!success) {
      return Response.json({ 
        error: 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
        creditsNeeded,
        creditsAvailable: user.credits 
      }, { status: 402 })
    }
    
    // Process feature logic
    const result = await processFeature(user.id, body)
    
    // Calculate XP (2 credits = 1 XP)
    const xpGained = Math.floor(creditsNeeded / 2)
    
    return Response.json({ 
      success: true, 
      data: result,
      xp_gained: xpGained,
      credits_used: creditsNeeded
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
})
\`\`\`

### Tier Access Pattern
\`\`\`typescript
import { TierEnforcement } from '@/lib/global-logic'

export const GET = withAuth(async (req: NextRequest, { user }) => {
  // Check tier access
  const requiredTier = 'pro_agent'
  if (!TierEnforcement.hasAccess(user.tier, requiredTier)) {
    return Response.json({
      error: 'Tier upgrade required',
      code: 'TIER_UPGRADE_REQUIRED',
      currentTier: user.tier,
      requiredTier
    }, { status: 403 })
  }
  
  // Continue with logic...
})
\`\`\`

---

## 🎨 Component Library

### Core Reusable Components

#### UserTierGate
\`\`\`typescript
// components/global/user-tier-gate.tsx
import { ReactNode } from 'react'
import { useUser } from '@/hooks/use-user'
import { TierEnforcement } from '@/lib/global-logic'
import { UpgradeCTA } from '@/components/ui/UpgradeCTA'

interface UserTierGateProps {
  children: ReactNode
  requiredTier: string
  fallbackComponent?: ReactNode
}

export function UserTierGate({ 
  children, 
  requiredTier, 
  fallbackComponent 
}: UserTierGateProps) {
  const { user } = useUser()
  
  if (!user) return null
  
  const hasAccess = TierEnforcement.hasAccess(user.tier, requiredTier)
  
  if (!hasAccess) {
    return fallbackComponent || (
      <UpgradeCTA 
        currentTier={user.tier}
        requiredTier={requiredTier}
        variant="card"
      />
    )
  }
  
  return <>{children}</>
}
\`\`\`

#### FeatureGateWrapper  
\`\`\`typescript
// components/ui/FeatureGateWrapper.tsx
import { ReactNode, useEffect, useState } from 'react'
import { checkUserAccess } from '@/lib/helpers/checkUserAccess'
import { OutOfCreditsModal } from '@/components/ui/OutOfCreditsModal'
import { UpgradeCTA } from '@/components/ui/UpgradeCTA'

interface FeatureGateWrapperProps {
  children: ReactNode
  featureName: string
  showLockedPreview?: boolean
  previewContent?: ReactNode
}

export function FeatureGateWrapper({ 
  children, 
  featureName, 
  showLockedPreview = false,
  previewContent 
}: FeatureGateWrapperProps) {
  const [access, setAccess] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserAccess(featureName).then(result => {
      setAccess(result)
      setLoading(false)
    })
  }, [featureName])

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />
  }

  if (!access.accessGranted) {
    if (access.fallbackReason === 'Insufficient credits') {
      return <OutOfCreditsModal featureName={featureName} />
    }
    
    if (access.upgradeRequired) {
      return showLockedPreview && previewContent ? (
        <div className="relative">
          {previewContent}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <UpgradeCTA variant="overlay" />
          </div>
        </div>
      ) : (
        <UpgradeCTA variant="card" />
      )
    }
  }

  return <>{children}</>
}
\`\`\`

#### XP Tracker
\`\`\`typescript
// components/global/xp-tracker.tsx
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface XPTrackerProps {
  currentXP: number
  currentLevel: number
  showProgress?: boolean
  className?: string
}

export function XPTracker({ 
  currentXP, 
  currentLevel, 
  showProgress = true,
  className = ""
}: XPTrackerProps) {
  const xpForCurrentLevel = (currentLevel - 1) * 150
  const xpForNextLevel = currentLevel * 150
  const progressXP = currentXP - xpForCurrentLevel
  const progressPercent = (progressXP / 150) * 100

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Badge variant="secondary">Level {currentLevel}</Badge>
        <span className="text-sm text-muted-foreground">
          {currentXP} XP
        </span>
      </div>
      
      {showProgress && (
        <>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progressXP}/150 XP</span>
            <span>Next: Level {currentLevel + 1}</span>
          </div>
        </>
      )}
    </div>
  )
}
\`\`\`

#### Toast Notifications with XP
\`\`\`typescript
// hooks/use-toast-xp.ts
import { useToast } from '@/hooks/use-toast'

export function useToastXP() {
  const { toast } = useToast()

  const showXPGain = (xpAmount: number, reason?: string) => {
    toast({
      title: "XP Gained! 🎉",
      description: `+${xpAmount} XP${reason ? ` for ${reason}` : ''}`,
      variant: "success",
      duration: 3000
    })
  }

  const showLevelUp = (newLevel: number) => {
    toast({
      title: "Level Up! 🚀",
      description: `Congratulations! You've reached Level ${newLevel}`,
      variant: "success",
      duration: 5000
    })
  }

  const showBadgeUnlock = (badgeName: string) => {
    toast({
      title: "Badge Unlocked! 🏆",
      description: `You've earned the "${badgeName}" badge!`,
      variant: "success",
      duration: 4000
    })
  }

  return { showXPGain, showLevelUp, showBadgeUnlock }
}
\`\`\`

---

## 🚀 Deployment & Environment

### Environment Variables
\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional AI Integrations
OPENAI_API_KEY=your_openai_api_key
XAI_API_KEY=your_xai_grok_key
GROQ_API_KEY=your_groq_api_key

# Social Media APIs (for social proof verifier)
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
TWITTER_BEARER_TOKEN=your_twitter_token

# Payment Processing (future)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Analytics (optional)
GOOGLE_ANALYTICS_ID=your_ga_id
MIXPANEL_TOKEN=your_mixpanel_token
\`\`\`

### Vercel Deployment
\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... add all other environment variables
\`\`\`

### Database Setup Process
\`\`\`sql
-- 1. Run in Supabase SQL Editor
-- Create core schema
\i scripts/create-agentgift-schema.sql

-- 2. Add v2.0 features  
\i scripts/add-v2-features-schema.sql

-- 3. Add social proof system
\i scripts/add-social-proof-schema.sql

-- 4. Add feature builder system
\i scripts/add-feature-builder-schema.sql

-- 5. Create indexes for performance
CREATE INDEX idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX idx_xp_logs_user_id ON xp_logs(user_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);

-- 6. Set up Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
\`\`\`

### Performance Optimization
\`\`\`typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['placeholder.svg', 'images.unsplash.com'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ]
  },
}

export default nextConfig
\`\`\`

---

## 🎯 Quick Reference Guide

### Essential Code Snippets

#### Check User Authentication
\`\`\`typescript
import { requireAuth } from '@/lib/middleware/withAuth'

// In server components
const user = await requireAuth()

// In API routes
export const GET = withAuth(async (req, { user }) => {
  // user is guaranteed to exist
})
\`\`\`

#### Feature Access Validation
\`\`\`typescript
import { checkUserAccess } from '@/lib/helpers/checkUserAccess'

const { accessGranted, fallbackReason } = await checkUserAccess('feature-name')
if (!accessGranted) {
  // Handle access denied
}
\`\`\`

#### XP and Credit Management
\`\`\`typescript
import { XPEngine, CreditSystem } from '@/lib/global-logic'

// Add XP
await XPEngine.addXP(userId, 25, 'Feature completed')

// Deduct Credits  
const success = await CreditSystem.deductCredits(userId, 2, 'feature-use')

// Check level up
const levelUp = await XPEngine.checkLevelUp(userId)
\`\`\`

#### Badge System
\`\`\`typescript
import { BadgeSystem } from '@/lib/global-logic'

// Unlock badge
await BadgeSystem.unlockBadge(userId, 'badge-id')

// Check badge eligibility
const eligible = await BadgeSystem.checkBadgeEligibility(userId, 'badge-id')
\`\`\`

### Common Patterns

#### API Route Template
\`\`\`typescript
import { withAuth } from '@/lib/middleware/withAuth'
import { NextRequest } from 'next/server'

export const POST = withAuth(async (req: NextRequest, { user, deductCredits }) => {
  try {
    const body = await req.json()
    
    // Deduct credits
    const success = await deductCredits(2, 'Feature Name')
    if (!success) {
      return Response.json({ error: 'Insufficient credits' }, { status: 402 })
    }
    
    // Process logic
    const result = await processLogic(user.id, body)
    
    return Response.json({ 
      success: true, 
      data: result,
      xp_gained: 1
    })
  } catch (error) {
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
})
\`\`\`

#### Component with Feature Gate
\`\`\`typescript
import { FeatureGateWrapper } from '@/components/ui/FeatureGateWrapper'

export default function MyFeature() {
  return (
    <FeatureGateWrapper featureName="my-feature">
      <div>Feature content here</div>
    </FeatureGateWrapper>
  )
}
\`\`\`

#### Tier Checking
\`\`\`typescript
import { TierEnforcement } from '@/lib/global-logic'

const hasAccess = TierEnforcement.hasAccess(userTier, 'pro_agent')
const tierLevel = TierEnforcement.getTierLevel('premium_spy') // returns 1
\`\`\`

### Database Queries

#### Get User with Full Profile
\`\`\`typescript
const { data: user } = await supabase
  .from('user_profiles')
  .select(`
    *,
    user_badges(badge_id, badge_name, unlocked_at),
    feature_usage(feature_name, created_at)
  `)
  .eq('id', userId)
  .single()
\`\`\`

#### Log Feature Usage
\`\`\`typescript
await supabase
  .from('feature_usage')
  .insert({
    user_id: userId,
    feature_name: 'my-feature',
    credits_used: 2,
    xp_gained: 1,
    success: true
  })
\`\`\`

#### Update User Credits and XP
\`\`\`typescript
await supabase
  .from('user_profiles')
  .update({
    credits: user.credits - creditsUsed,
    xp: user.xp + xpGained
  })
  .eq('id', userId)
\`\`\`

---

## 📞 Support & Resources

### Documentation Links
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

### Internal Resources
- **Admin Panel**: `/admin/feature-builder` - No-code feature creation
- **Analytics Dashboard**: `/admin/analytics` - Usage metrics and insights
- **User Management**: `/admin/users` - User profiles and tier management

### Support Contacts
- **Technical Support**: support@agentgift.ai
- **Business Inquiries**: business@agentgift.ai
- **Privacy & Security**: privacy@agentgift.ai
- **Community**: community@agentgift.ai

### Development Workflow
1. **Feature Planning**: Use `/admin/feature-builder` for rapid prototyping
2. **Development**: Follow modular `/features/[name]/` structure
3. **Testing**: Test with different user tiers and credit levels
4. **Deployment**: Use Vercel CLI for production deployment
5. **Monitoring**: Check analytics and user feedback

---

## 🔄 Version History

### AGTE v3.0 (Current)
- Universal authentication and authorization system
- Enhanced tokenomics with prestige system
- Social proof verification
- AI companion integration
- Feature builder admin panel
- Comprehensive component library

### AGTE v2.0
- Reminder scheduler
- Gift campaigns
- Advanced badge system
- Business tools integration

### AGTE v1.0
- Core platform launch
- Basic XP and credit system
- Tier-based access control
- Initial feature set

---

*Last Updated: January 2025*
*Version: AGTE v3.0*
*Platform: AgentGift.AI*
*Maintained by: AgentGift.AI Development Team*
