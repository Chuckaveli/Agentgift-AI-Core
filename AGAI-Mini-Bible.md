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

### API Route
\`\`\`typescript
import { withAuth } from '@/lib/middleware/withAuth'

export const POST = withAuth(async (req, { user, deductCredits }) => {
  const success = await deductCredits(2, 'Feature Name')
  if (!success) return Response.json({ error: 'No credits' }, { status: 402 })
  
  // Feature logic
  return Response.json({ success: true })
})
\`\`\`

## 📊 AGTE v3.0 Formula
- 2 Credits = 1 XP
- 150 XP = 1 Level  
- 100 Levels = Prestige
- Silver = 10%, Gold = 20%, Diamond = 50%

## 🎯 Tier Hierarchy
\`\`\`
free_agent: 0
premium_spy: 1
pro_agent: 2  
agent_00g: 3
small_biz: 4
enterprise: 5
\`\`\`

## 🗄️ Key Tables
- `user_profiles` - User data, tier, credits, XP
- `feature_usage` - Usage tracking
- `xp_logs` - XP transaction history
- `registered_features` - Dynamic features

## 🔧 Feature Registration
\`\`\`typescript
// lib/helpers/checkUserAccess.ts
'my-feature': {
  name: 'My Feature',
  requiredTier: 'premium_spy',
  creditsNeeded: 2,
  enabled: true
}
\`\`\`

## 📱 File Structure
\`\`\`
/features/[name]/
  component.tsx
  route.ts
  modal.tsx (optional)
\`\`\`

## 🎨 Common Imports
\`\`\`typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { FeatureGateWrapper } from '@/components/ui/FeatureGateWrapper'
\`\`\`

## 🚀 Deploy Commands
\`\`\`bash
vercel --prod
\`\`\`

*Quick copy-paste reference for AGAI development*
