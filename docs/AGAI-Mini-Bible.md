# 🎯 AGAI Mini Bible - Quick Copy-Paste Reference

## 🚀 Essential Imports
\`\`\`typescript
// Authentication
import { requireAuth, withAuth } from '@/lib/middleware/withAuth'
import { checkUserAccess } from '@/lib/helpers/checkUserAccess'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FeatureGateWrapper } from '@/components/ui/FeatureGateWrapper'
import { UserTierGate } from '@/components/global/user-tier-gate'
import { XPTracker } from '@/components/global/xp-tracker'

// Hooks
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/hooks/use-user'

// Logic
import { XPEngine, CreditSystem, TierEnforcement } from '@/lib/global-logic'
\`\`\`

## 🔐 Auth Patterns

### Server Component Auth
\`\`\`typescript
import { requireAuth } from '@/lib/middleware/withAuth'

export default async function ProtectedPage() {
  const user = await requireAuth()
  return <div>Welcome {user.email}</div>
}
\`\`\`

### API Route Protection
\`\`\`typescript
import { withAuth } from '@/lib/middleware/withAuth'

export const POST = withAuth(async (req, { user, deductCredits }) => {
  const success = await deductCredits(2, 'Feature Name')
  if (!success) return Response.json({ error: 'No credits' }, { status: 402 })
  
  return Response.json({ success: true, xp_gained: 1 })
})
\`\`\`

### Client-Side Access Check
\`\`\`typescript
import { checkUserAccess } from '@/lib/helpers/checkUserAccess'

const { accessGranted, fallbackReason } = await checkUserAccess('feature-name')
if (!accessGranted) {
  // Show upgrade prompt or error
}
\`\`\`

## 🎮 Tokenomics (AGTE v3.0)

### Core Formula
\`\`\`typescript
// 2 Credits = 1 XP
// 150 XP = 1 Level  
// 100 Levels = Prestige

const xpGained = Math.floor(creditsUsed / 2)
const levelUp = Math.floor(totalXP / 150)
const prestigeReady = level >= 100
\`\`\`

### XP Management
\`\`\`typescript
import { XPEngine } from '@/lib/global-logic'

// Add XP
await XPEngine.addXP(userId, 25, 'Feature completed')

// Check level up
const levelUp = await XPEngine.checkLevelUp(userId)
if (levelUp) {
  // Handle level up logic
}
\`\`\`

### Credit System
\`\`\`typescript
import { CreditSystem } from '@/lib/global-logic'

// Deduct credits
const success = await CreditSystem.deductCredits(userId, 2, 'feature-use')

// Add credits (admin/purchase)
await CreditSystem.addCredits(userId, 50, 'Purchase')
\`\`\`

## 🏆 Tier System

### Tier Hierarchy
\`\`\`typescript
const TIER_HIERARCHY = {
  free_agent: 0,
  premium_spy: 1,
  pro_agent: 2,
  agent_00g: 3,
  small_biz: 4,
  enterprise: 5
}
\`\`\`

### Tier Checking
\`\`\`typescript
import { TierEnforcement } from '@/lib/global-logic'

const hasAccess = TierEnforcement.hasAccess(userTier, 'pro_agent')
const tierLevel = TierEnforcement.getTierLevel('premium_spy')
\`\`\`

### Prestige Benefits
\`\`\`typescript
const PRESTIGE_BENEFITS = {
  silver: { discount: 0.10, level: 100 },
  gold: { discount: 0.20, level: 200 },
  diamond: { discount: 0.50, level: 300 }
}
\`\`\`

## 🧩 Component Patterns

### Feature Gate Wrapper
\`\`\`typescript
<FeatureGateWrapper 
  featureName="my-feature"
  showLockedPreview={true}
  previewContent={<PreviewComponent />}
>
  <FullFeatureComponent />
</FeatureGateWrapper>
\`\`\`

### Tier Gate
\`\`\`typescript
<UserTierGate requiredTier="pro_agent">
  <ProOnlyContent />
</UserTierGate>
\`\`\`

### XP Tracker
\`\`\`typescript
<XPTracker 
  currentXP={user.xp}
  currentLevel={user.level}
  showProgress={true}
/>
\`\`\`

### Toast Notifications
\`\`\`typescript
const { toast } = useToast()

toast({
  title: "XP Gained! 🎉",
  description: `+${xpAmount} XP earned`,
  variant: "success"
})
\`\`\`

## 🗄️ Database Queries

### Get User Profile
\`\`\`typescript
const { data: user } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', userId)
  .single()
\`\`\`

### Log Feature Usage
\`\`\`typescript
await supabase
  .from('feature_usage')
  .insert({
    user_id: userId,
    feature_name: 'my-feature',
    credits_used: 2,
    xp_gained: 1
  })
\`\`\`

### Update Credits/XP
\`\`\`typescript
await supabase
  .from('user_profiles')
  .update({
    credits: user.credits - 2,
    xp: user.xp + 1
  })
  .eq('id', userId)
\`\`\`

## 🔧 Feature Development

### Feature Config Registration
\`\`\`typescript
// lib/helpers/checkUserAccess.ts
export const FEATURE_CONFIGS = {
  'my-feature': {
    name: 'My Feature',
    requiredTier: 'premium_spy',
    creditsNeeded: 2,
    enabled: true
  }
}
\`\`\`

### Feature Folder Structure
\`\`\`
/features/my-feature/
  component.tsx    # Main React component
  route.ts        # API handler
  modal.tsx       # Optional modal
\`\`\`

### Component Template
\`\`\`typescript
"use client"
import { FeatureGateWrapper } from '@/components/ui/FeatureGateWrapper'

export default function MyFeature() {
  return (
    <FeatureGateWrapper featureName="my-feature">
      <div>Feature content</div>
    </FeatureGateWrapper>
  )
}
\`\`\`

### API Route Template
\`\`\`typescript
import { withAuth } from '@/lib/middleware/withAuth'

export const POST = withAuth(async (req, { user, deductCredits }) => {
  const success = await deductCredits(2, 'My Feature')
  if (!success) {
    return Response.json({ error: 'Insufficient credits' }, { status: 402 })
  }
  
  // Feature logic here
  return Response.json({ success: true, xp_gained: 1 })
})
\`\`\`

## 🎨 Common UI Patterns

### Loading State
\`\`\`typescript
{loading ? (
  <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />
) : (
  <ActualContent />
)}
\`\`\`

### Error Handling
\`\`\`typescript
try {
  const response = await fetch('/api/feature')
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error)
  }
} catch (error) {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  })
}
\`\`\`

### Credit Display
\`\`\`typescript
<div className="flex items-center gap-2">
  <span className="text-sm">Credits: {user.credits}</span>
  <Button size="sm" variant="outline">
    Buy More
  </Button>
</div>
\`\`\`

## 🚀 Deployment

### Environment Variables
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
\`\`\`

### Deploy Commands
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
\`\`\`

### Database Setup
\`\`\`sql
-- Run in Supabase SQL Editor
\i scripts/create-agentgift-schema.sql
\i scripts/add-v2-features-schema.sql
\`\`\`

## 📊 Analytics Tracking

### Feature Usage
\`\`\`typescript
await supabase
  .from('feature_usage')
  .insert({
    user_id: userId,
    feature_name: featureName,
    credits_used: creditsUsed,
    success: true
  })
\`\`\`

### XP Logging
\`\`\`typescript
await supabase
  .from('xp_logs')
  .insert({
    user_id: userId,
    xp_amount: xpGained,
    reason: 'Feature completed',
    feature_name: featureName
  })
\`\`\`

## 🎯 Quick Fixes

### Common Errors
\`\`\`typescript
// Insufficient credits
{ error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS' }

// Tier upgrade required  
{ error: 'Tier upgrade required', code: 'TIER_UPGRADE_REQUIRED' }

// Not authenticated
{ error: 'Unauthorized', code: 'UNAUTHORIZED' }
\`\`\`

### Debug User State
\`\`\`typescript
console.log('User:', {
  id: user.id,
  tier: user.tier,
  credits: user.credits,
  xp: user.xp,
  level: user.level
})
\`\`\`

---

## 📞 Quick Support

- **Admin Panel**: `/admin/feature-builder`
- **Support**: support@agentgift.ai
- **Docs**: Internal wiki + code comments

*Quick copy-paste reference for AGAI development*
*Version: AGTE v3.0 | Last Updated: January 2025*
