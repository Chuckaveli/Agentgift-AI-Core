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
10. [Complete Features Directory](#complete-features-directory)
11. [Deployment & Environment](#deployment--environment)

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

## 🎯 Complete Features Directory

### 🎮 **Core Gaming Features**

#### **AgentVault™** - Live Auction System
- **What it does**: Seasonal team-based auction where companies bid VibeCoins for exclusive rewards
- **Tech Stack**: Next.js, Supabase, Real-time subscriptions, Framer Motion
- **Tier Required**: All tiers (team-based)
- **Credits**: Uses VibeCoins (team currency)
- **Database**: `vault_auction_*` tables
- **Key Features**: Live bidding, team leaderboards, seasonal rewards, FOMO mechanics

#### **BondCraft** - Relationship Building Game
- **What it does**: Interactive trivia game to strengthen relationships through personal questions
- **Tech Stack**: Next.js, Supabase, React state management
- **Tier Required**: premium_spy+
- **Credits**: 3 credits per session
- **Database**: `bondcraft_*` tables
- **Key Features**: Trivia rounds, guess mechanics, relationship scoring

#### **Ghost Hunt** - Mystery Investigation Game
- **What it does**: Spooky mystery-solving game with clues and leaderboards
- **Tech Stack**: Next.js, Supabase, Timer logic
- **Tier Required**: pro_agent+
- **Credits**: 2 credits per hunt
- **Database**: `ghost_hunt_*` tables
- **Key Features**: Clue progression, time limits, global leaderboard

#### **Thought Heist** - Mind Reading Challenge
- **What it does**: Psychological game where players guess thoughts and preferences
- **Tech Stack**: Next.js, Supabase, Psychology algorithms
- **Tier Required**: premium_spy+
- **Credits**: 2 credits per session
- **Database**: `thought_heist_*` tables
- **Key Features**: Mind reading mechanics, accuracy scoring, session tracking

#### **Serendipity** - Surprise Gift Discovery
- **What it does**: Random gift revelation system with emotional echoes
- **Tech Stack**: Next.js, Supabase, Random algorithms
- **Tier Required**: free_agent+
- **Credits**: 1 credit per reveal
- **Database**: `serendipity_*` tables
- **Key Features**: Random gift generation, emotional tagging, surprise mechanics

---

### 🏢 **Business & Enterprise Tools**

#### **EmotiTokens** - Employee Recognition System
- **What it does**: Digital token system for peer-to-peer employee recognition
- **Tech Stack**: Next.js, Supabase, Token economics
- **Tier Required**: small_biz+
- **Credits**: Free for businesses
- **Database**: `emotitokens_*` tables
- **Key Features**: Token sending, leaderboards, employee directory, recognition tracking

#### **Great Samaritan Program** - Community Service Tracker
- **What it does**: Tracks and rewards community service and charitable activities
- **Tech Stack**: Next.js, Supabase, Admin dashboard
- **Tier Required**: enterprise
- **Credits**: Admin-managed
- **Database**: `great_samaritan_*` tables
- **Key Features**: Participant tracking, award system, lunch drop coordination

#### **GiftBridge** - Community Nomination System
- **What it does**: Community-driven gift nominations with voting and impact tracking
- **Tech Stack**: Next.js, Supabase, Voting algorithms
- **Tier Required**: pro_agent+
- **Credits**: 1 credit per nomination
- **Database**: `giftbridge_*` tables
- **Key Features**: Nomination system, community voting, impact measurement

#### **Custom Holidays Manager** - Business Holiday Tracker
- **What it does**: Manage company-specific holidays and cultural celebrations
- **Tech Stack**: Next.js, Supabase, Calendar integration
- **Tier Required**: small_biz+
- **Credits**: Free for businesses
- **Database**: `custom_holidays` table
- **Key Features**: Holiday creation, team notifications, cultural awareness

---

### 🤖 **AI-Powered Features**

#### **Agent Gifty** - AI Gift Concierge
- **What it does**: AI-powered gift recommendation chatbot with personality analysis
- **Tech Stack**: Next.js, OpenAI API, Supabase
- **Tier Required**: premium_spy+
- **Credits**: 2 credits per conversation
- **Database**: `agent_gifty_*` tables
- **Key Features**: Natural language processing, gift matching, conversation history

#### **AI Companion** - Personal Gift Assistant
- **What it does**: Advanced AI companion for ongoing gift planning and relationship management
- **Tech Stack**: Next.js, OpenAI API, Long-term memory
- **Tier Required**: agent_00g
- **Credits**: 5 credits per session
- **Database**: `ai_companion_*` tables
- **Key Features**: Relationship tracking, proactive suggestions, learning algorithms

#### **Smart Search** - Intelligent Gift Discovery
- **What it does**: AI-enhanced search with natural language and context understanding
- **Tech Stack**: Next.js, Search algorithms, ML models
- **Tier Required**: premium_spy+
- **Credits**: 1 credit per search
- **Database**: Search logs in `feature_usage`
- **Key Features**: Natural language queries, context awareness, smart filtering

---

### 🎨 **Creative & Personalization Tools**

#### **Gift DNA** - Personality-Based Matching
- **What it does**: Creates personality profiles for precise gift matching
- **Tech Stack**: Next.js, Personality algorithms, Supabase
- **Tier Required**: pro_agent+
- **Credits**: 3 credits per analysis
- **Database**: `gift_dna_*` tables
- **Key Features**: Personality assessment, compatibility scoring, gift mapping

#### **Emotion Tags** - Emotional Gift Categorization
- **What it does**: Tag and categorize gifts based on emotional impact and meaning
- **Tech Stack**: Next.js, Emotion AI, Supabase
- **Tier Required**: premium_spy+
- **Credits**: 1 credit per tagging session
- **Database**: `emotion_tags` table
- **Key Features**: Emotional analysis, tag management, sentiment tracking

#### **Character Collection** - Persona-Based Gifting
- **What it does**: Create and manage gift-giving personas for different relationships
- **Tech Stack**: Next.js, Supabase, Character management
- **Tier Required**: pro_agent+
- **Credits**: 2 credits per character
- **Database**: `characters` table
- **Key Features**: Character creation, persona switching, relationship mapping

#### **Cultural Intelligence** - Cross-Cultural Gift Guidance
- **What it does**: Provides cultural context and appropriateness for international gifting
- **Tech Stack**: Next.js, Cultural databases, Locale APIs
- **Tier Required**: pro_agent+
- **Credits**: 2 credits per consultation
- **Database**: `cultural_intelligence_*` tables
- **Key Features**: Cultural guidelines, holiday awareness, etiquette tips

---

### 🔍 **Analysis & Verification Tools**

#### **Social Proof Verifier** - Gift Impact Validation
- **What it does**: Verifies and tracks the social impact and success of gift choices
- **Tech Stack**: Next.js, Social media APIs, Supabase
- **Tier Required**: premium_spy+
- **Credits**: 2 credits per verification
- **Database**: `social_proofs` table
- **Key Features**: Impact tracking, social validation, success metrics

#### **Gift Gut Check** - Decision Validation Tool
- **What it does**: Provides second opinions and validation for gift choices
- **Tech Stack**: Next.js, Decision algorithms, Supabase
- **Tier Required**: free_agent+
- **Credits**: 1 credit per check
- **Database**: `gift_gut_check_*` tables
- **Key Features**: Decision analysis, risk assessment, confidence scoring

#### **Emotional Signature Engine** - Emotional Pattern Analysis
- **What it does**: Analyzes emotional patterns in gift-giving behavior
- **Tech Stack**: Next.js, ML models, Emotional AI
- **Tier Required**: agent_00g
- **Credits**: 3 credits per analysis
- **Database**: `emotional_signatures` table
- **Key Features**: Pattern recognition, emotional mapping, behavioral insights

---

### 🎪 **Social & Community Features**

#### **Group Gifting** - Collaborative Gift Planning
- **What it does**: Coordinate group gifts with multiple contributors and shared planning
- **Tech Stack**: Next.js, Supabase, Payment integration
- **Tier Required**: premium_spy+
- **Credits**: 2 credits per group creation
- **Database**: `group_gifting_*` tables
- **Key Features**: Group coordination, contribution tracking, shared wishlists

#### **Pride Alliance** - LGBTQ+ Inclusive Gifting
- **What it does**: Specialized gift recommendations and support for LGBTQ+ community
- **Tech Stack**: Next.js, Supabase, Community resources
- **Tier Required**: premium_spy+
- **Credits**: 2 credits per consultation
- **Database**: `pride_alliance_*` tables
- **Key Features**: Inclusive recommendations, community support, safe gifting

#### **Social Campaigns** - Community Gift Drives
- **What it does**: Organize and manage community-wide gift campaigns and drives
- **Tech Stack**: Next.js, Supabase, Campaign management
- **Tier Required**: pro_agent+
- **Credits**: 3 credits per campaign
- **Database**: `social_campaigns` table
- **Key Features**: Campaign creation, participant tracking, impact measurement

---

### 🛠️ **Utility & Management Tools**

#### **Reminder Scheduler** - Gift Timing Management
- **What it does**: Schedule and manage gift reminders for important dates
- **Tech Stack**: Next.js, Supabase, Cron jobs
- **Tier Required**: premium_spy+
- **Credits**: 1 credit per reminder set
- **Database**: `reminder_scheduler_*` tables
- **Key Features**: Date tracking, notification system, recurring reminders

#### **Gift Campaigns** - Marketing Campaign Management
- **What it does**: Create and manage gift-focused marketing campaigns
- **Tech Stack**: Next.js, Supabase, Analytics
- **Tier Required**: pro_agent+
- **Credits**: 5 credits per campaign
- **Database**: `gift_campaigns` table
- **Key Features**: Campaign creation, performance tracking, ROI analysis

#### **Delivery Manager** - Gift Logistics Coordination
- **What it does**: Coordinate and track gift delivery logistics and timing
- **Tech Stack**: Next.js, Shipping APIs, Supabase
- **Tier Required**: pro_agent+
- **Credits**: 2 credits per delivery
- **Database**: `delivery_*` tables
- **Key Features**: Delivery tracking, logistics coordination, timing optimization

---

### 🎯 **Admin & Management Tools**

#### **Feature Builder** - No-Code Feature Creation
- **What it does**: Admin tool for creating new features without coding
- **Tech Stack**: Next.js, Dynamic forms, Supabase
- **Tier Required**: Admin only
- **Credits**: N/A
- **Database**: `admin_features` table
- **Key Features**: Drag-drop interface, template system, feature deployment

#### **Tokenomics Dashboard** - Economy Management
- **What it does**: Monitor and adjust platform economy, XP, and credit systems
- **Tech Stack**: Next.js, Analytics, Supabase
- **Tier Required**: Admin only
- **Credits**: N/A
- **Database**: All user and economy tables
- **Key Features**: Economy monitoring, adjustment tools, user analytics

#### **Social Proof Admin** - Content Moderation
- **What it does**: Manage and moderate user-generated social proof content
- **Tech Stack**: Next.js, Content moderation, Supabase
- **Tier Required**: Admin only
- **Credits**: N/A
- **Database**: `social_proofs` table
- **Key Features**: Content review, moderation tools, approval workflows

#### **Feature Analytics** - Usage Monitoring
- **What it does**: Track feature usage, performance, and user engagement
- **Tech Stack**: Next.js, Analytics, Charts
- **Tier Required**: Admin only
- **Credits**: N/A
- **Database**: `feature_usage`, analytics tables
- **Key Features**: Usage tracking, performance metrics, engagement analysis

#### **Voice Commands Admin** - Voice Interface Management
- **What it does**: Manage voice command integrations and responses
- **Tech Stack**: Next.js, Voice APIs, Supabase
- **Tier Required**: Admin only
- **Credits**: N/A
- **Database**: `voice_commands` table
- **Key Features**: Command management, response configuration, voice analytics

---

### 🎨 **Design & Animation Components**

#### **Lottie Animations** - Interactive Animations
- **What it does**: Provides engaging animations throughout the platform
- **Tech Stack**: Lottie, React, Framer Motion
- **Files**: `/public/lottie/` directory
- **Key Features**: Hero animations, loading states, success celebrations

#### **Seasonal Indicators** - Dynamic Theming
- **What it does**: Automatically adjusts UI based on seasons and holidays
- **Tech Stack**: React, CSS variables, Date logic
- **Key Features**: Seasonal themes, holiday awareness, dynamic styling

#### **Cultural Theming** - Localized UI Adaptation
- **What it does**: Adapts UI elements based on user's cultural context
- **Tech Stack**: React Context, CSS-in-JS, Locale APIs
- **Key Features**: Cultural color schemes, layout adaptations, text direction

---

### 📊 **Analytics & Reporting**

#### **XP Analytics** - Gamification Tracking
- **What it does**: Comprehensive analytics for XP, levels, and engagement
- **Tech Stack**: Next.js, Chart.js, Supabase
- **Database**: `xp_logs`, `feature_usage`
- **Key Features**: XP tracking, level progression, engagement metrics

#### **Feature Usage Analytics** - Platform Insights
- **What it does**: Detailed analytics on feature adoption and usage patterns
- **Tech Stack**: Next.js, Analytics APIs, Visualization
- **Database**: `feature_usage`, custom analytics tables
- **Key Features**: Usage patterns, adoption rates, performance metrics

#### **Emotional Analytics** - Sentiment Tracking
- **What it does**: Analyzes emotional patterns and sentiment across the platform
- **Tech Stack**: Emotion AI, Analytics, Supabase
- **Database**: `emotional_signatures`, sentiment logs
- **Key Features**: Emotion tracking, sentiment analysis, mood patterns

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
*Total Features: 35+ tools, games, and admin features*
