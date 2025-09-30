# 🎯 AGAI Mini Bible - Quick Reference

## 🚀 Essential Commands

### Auth Check
\`\`\`typescript
import { requireAuth } from '@/lib/middleware/withAuth'
const user = await requireAuth()
\`\`\`

### Feature Access
\`\`\`typescript
import { checkUserAccess } from '@/lib/helpers/checkUserAccess'
const { accessGranted } = await checkUserAccess('feature-name')
\`\`\`

### XP & Credits
\`\`\`typescript
import { XPEngine, CreditSystem } from '@/lib/global-logic'

// Add XP
await XPEngine.addXP(userId, 25, 'reason')

// Deduct Credits  
await CreditSystem.deductCredits(userId, 2, 'feature-use')
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
  
  return Response.json({ success: true })
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
// Silver = 10%, Gold = 20%, Diamond = 50%

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
\`\`\`
free_agent: 0
premium_spy: 1
pro_agent: 2  
agent_00g: 3
small_biz: 4
enterprise: 5
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

### Feature Wrapper
\`\`\`typescript
<FeatureGateWrapper featureName="my-feature">
  <MyFeatureContent />
</FeatureGateWrapper>
\`\`\`

### Tier Gate
\`\`\`typescript
<UserTierGate requiredTier="pro_agent">
  <ProContent />
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

## 🗄️ Key Tables

- `user_profiles` - User data, tier, credits, XP
- `feature_usage` - Usage tracking
- `xp_logs` - XP transaction history
- `registered_features` - Dynamic features

## 🔧 Feature Registration

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

## 🎨 Common Imports

\`\`\`typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { FeatureGateWrapper } from '@/components/ui/FeatureGateWrapper'
\`\`\`

## 📱 File Structure

\`\`\`
/features/[name]/
  component.tsx
  route.ts
  modal.tsx (optional)
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
vercel --prod
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
