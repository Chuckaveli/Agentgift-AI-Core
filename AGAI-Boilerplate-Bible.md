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

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **shadcn/ui** component library

### Backend
- **Next.js API Routes** (serverless functions)
- **Supabase** (PostgreSQL database + Auth)
- **Vercel** hosting and deployment

### Key Libraries
\`\`\`json
{
  "@supabase/auth-helpers-nextjs": "^0.8.7",
  "@supabase/supabase-js": "^2.38.4",
  "framer-motion": "^10.16.16",
  "lucide-react": "^0.294.0",
  "tailwindcss": "^3.3.6"
}
\`\`\`

---

## 🏗️ Core Architecture

### File Structure
\`\`\`
/app
  /api                 # API routes
  /dashboard          # User dashboard
  /features           # Feature pages
  /admin             # Admin panel
  /business          # B2B pages
  
/components
  /ui                # shadcn/ui components
  /global            # Reusable components
  /feature-specific  # Feature components
  
/lib
  /middleware        # Auth & access control
  /helpers          # Utility functions
  
/features
  /[feature-name]   # Modular feature organization
    component.tsx   # Main component
    route.ts       # API handler
    modal.tsx      # Optional modal
\`\`\`

### Design Principles
- **Mobile-First**: All components responsive by default
- **Modular Architecture**: Features organized in `/features/[name]/`
- **Plug-and-Play**: Easy to add/remove features
- **SOLID Foundation**: Scalable and maintainable code

---

## 🔐 Authentication & Authorization

### Middleware Protection
\`\`\`typescript
// middleware.ts - Global route protection
const protectedRoutes = ["/dashboard", "/admin", "/features", "/business"]
const adminRoutes = ["/admin", "/api/admin"]
const featureRoutes = {
  "/features/ai-companion": "agent_00g",
  "/features/gift-campaigns": "pro_agent"
}
\`\`\`

### Auth Helper Usage
\`\`\`typescript
// Server Components
import { requireAuth } from '@/lib/middleware/withAuth'
const user = await requireAuth()

// API Routes
import { withAuth } from '@/lib/middleware/withAuth'
export const GET = withAuth(async (req, { user }) => {
  // Protected logic here
})

// Client Components
import { checkUserAccess } from '@/lib/helpers/checkUserAccess'
const { accessGranted } = await checkUserAccess('feature-name')
\`\`\`

---

## 🎮 Tokenomics Engine (AGTE v3.0)

### Core Formula
- **2 Credits = 1 XP**
- **150 XP = 1 Level**
- **100 Levels = Prestige Unlock**

### Prestige Benefits
- **Silver**: 10% lifetime discount
- **Gold**: 20% lifetime discount  
- **Diamond**: 50% lifetime discount + exclusive features

### XP Sources
\`\`\`typescript
const XP_ACTIONS = {
  feature_use: 10,
  social_share: 50,
  gift_chain_complete: 100,
  friend_invite: 75,
  review_submit: 30
}
\`\`\`

### Implementation
\`\`\`typescript
import { XPEngine } from '@/lib/global-logic'

// Add XP
await XPEngine.addXP(userId, 25, 'Feature completed')

// Check prestige
if (XPEngine.shouldTriggerPrestige(userLevel)) {
  await XPEngine.triggerPrestige(userId, 'silver')
}
\`\`\`

---

## 🧩 Feature Development

### Creating New Features

1. **Create Feature Folder**
\`\`\`bash
mkdir features/my-new-feature
\`\`\`

2. **Component Structure**
\`\`\`typescript
// features/my-new-feature/component.tsx
"use client"
import { FeatureGateWrapper } from '@/components/ui/FeatureGateWrapper'

export default function MyNewFeature() {
  return (
    <FeatureGateWrapper featureName="my-new-feature">
      {/* Feature content */}
    </FeatureGateWrapper>
  )
}
\`\`\`

3. **API Handler**
\`\`\`typescript
// features/my-new-feature/route.ts
import { withAuth } from '@/lib/middleware/withAuth'

export const POST = withAuth(async (req, { user, deductCredits }) => {
  const success = await deductCredits(2, 'My New Feature')
  if (!success) {
    return Response.json({ error: 'Insufficient credits' }, { status: 402 })
  }
  
  // Feature logic here
  return Response.json({ success: true })
})
\`\`\`

4. **Register Feature**
\`\`\`typescript
// lib/helpers/checkUserAccess.ts
export const FEATURE_CONFIGS = {
  'my-new-feature': {
    name: 'My New Feature',
    requiredTier: 'premium_spy',
    creditsNeeded: 2,
    enabled: true
  }
}
\`\`\`

---

## 🗄️ Database Schema

### Core Tables
\`\`\`sql
-- User Profiles
user_profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  tier TEXT DEFAULT 'free_agent',
  credits INTEGER DEFAULT 10,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges TEXT[],
  prestige_level TEXT
)

-- Feature Usage Tracking
feature_usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  feature_name TEXT,
  credits_used INTEGER,
  xp_gained INTEGER,
  created_at TIMESTAMP
)

-- XP Logs
xp_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  xp_amount INTEGER,
  reason TEXT,
  created_at TIMESTAMP
)
\`\`\`

### Tier System
\`\`\`sql
-- Tier hierarchy (0 = lowest access)
free_agent: 0
premium_spy: 1  
pro_agent: 2
agent_00g: 3
small_biz: 4
enterprise: 5
\`\`\`

---

## 🔌 API Patterns

### Standard Response Format
\`\`\`typescript
// Success Response
{
  success: true,
  data: any,
  xp_gained?: number,
  level_up?: boolean
}

// Error Response  
{
  error: string,
  code?: string,
  details?: any
}
\`\`\`

### Credit Deduction Pattern
\`\`\`typescript
export const POST = withAuth(async (req, { user, deductCredits }) => {
  // Check credits first
  const success = await deductCredits(creditsNeeded, 'Feature Name')
  if (!success) {
    return Response.json({ 
      error: 'Insufficient credits',
      creditsNeeded,
      creditsAvailable: user.credits 
    }, { status: 402 })
  }
  
  // Process feature logic
  const result = await processFeature(data)
  
  return Response.json({ 
    success: true, 
    data: result,
    xp_gained: Math.floor(creditsNeeded / 2)
  })
})
\`\`\`

---

## 🎨 Component Library

### Core Reusable Components

#### UserTierGate
\`\`\`typescript
import { UserTierGate } from '@/components/global/user-tier-gate'

<UserTierGate requiredTier="pro_agent">
  <ProFeatureContent />
</UserTierGate>
\`\`\`

#### FeatureGateWrapper  
\`\`\`typescript
import { FeatureGateWrapper } from '@/components/ui/FeatureGateWrapper'

<FeatureGateWrapper 
  featureName="ai-companion"
  showLockedPreview={true}
  previewContent={<PreviewComponent />}
>
  <FullFeatureComponent />
</FeatureGateWrapper>
\`\`\`

#### XP Tracker
\`\`\`typescript
import { XPTracker } from '@/components/global/xp-tracker'

<XPTracker 
  currentXP={user.xp}
  currentLevel={user.level}
  showProgress={true}
/>
\`\`\`

#### Toast Notifications
\`\`\`typescript
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

toast({
  title: "XP Gained!",
  description: `+${xpAmount} XP earned`,
  variant: "success"
})
\`\`\`

---

## 🚀 Deployment & Environment

### Environment Variables
\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Optional Integrations
OPENAI_API_KEY=your_openai_key
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
\`\`\`

### Vercel Deployment
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
\`\`\`

### Database Setup
\`\`\`sql
-- Run in Supabase SQL Editor
-- 1. Create tables
\i scripts/create-agentgift-schema.sql

-- 2. Add v2.0 features  
\i scripts/add-v2-features-schema.sql

-- 3. Add social proof system
\i scripts/add-social-proof-schema.sql

-- 4. Add feature builder
\i scripts/add-feature-builder-schema.sql
\`\`\`

---

## 🎯 Quick Reference

### Common Patterns

#### Check User Access
\`\`\`typescript
const { accessGranted, fallbackReason } = await checkUserAccess('feature-name')
\`\`\`

#### Add XP
\`\`\`typescript
await XPEngine.addXP(userId, 25, 'Feature completed')
\`\`\`

#### Deduct Credits
\`\`\`typescript
const success = await deductCredits(2, 'Feature usage')
\`\`\`

#### Unlock Badge
\`\`\`typescript
await BadgeSystem.unlockBadge(userId, 'badge-id')
\`\`\`

### Tier Checking
\`\`\`typescript
const hasAccess = TierEnforcement.hasAccess(userTier, 'pro_agent')
\`\`\`

### Feature Registration
\`\`\`typescript
// Add to FEATURE_CONFIGS in lib/helpers/checkUserAccess.ts
'new-feature': {
  name: 'New Feature',
  requiredTier: 'premium_spy',
  creditsNeeded: 1,
  enabled: true
}
\`\`\`

---

## 📞 Support & Resources

- **Documentation**: Internal wiki and code comments
- **Support Email**: support@agentgift.ai
- **Admin Panel**: `/admin/feature-builder` for no-code feature creation
- **Analytics**: Built-in usage tracking and performance metrics

---

*Last Updated: January 2025*
*Version: AGTE v3.0*
*Platform: AgentGift.AI*
