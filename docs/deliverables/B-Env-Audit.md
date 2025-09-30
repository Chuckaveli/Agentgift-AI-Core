# Deliverable B: Environment Variable Audit
**AgentGift.ai - Complete Environment Analysis**
**Generated:** 2024-01-15  
**Status:** ✅ COMPLETE  
**Total Variables:** 32  
**Critical Issues:** 1  
**Missing Variables:** 12

---

## Executive Summary

This audit examines all environment variables used across the AgentGift.ai application. We've identified **1 critical security issue** and **12 missing variables** that need to be configured for full functionality.

### Critical Finding
🚨 **SECURITY RISK:** `NEXT_PUBLIC_ELEVENLABS_API_KEY` is exposed to the client-side, allowing anyone to view and use your ElevenLabs API key. This must be fixed immediately.

---

## Environment Variables Inventory

### ✅ Correctly Configured (20 variables)

#### Supabase Configuration
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`
**Status:** ✅ Properly configured  
**Usage:** Database, authentication, storage  
**Security:** Service role key is server-only ✅

#### Stripe Configuration
\`\`\`bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
\`\`\`
**Status:** ✅ Properly configured  
**Usage:** Payment processing, subscriptions  
**Security:** Secret key is server-only ✅

#### OpenAI Configuration
\`\`\`bash
OPENAI_API_KEY=sk-...
OPENAI_API_KEY_PREMIUM=sk-...
OPENAI_API_KEY_PRO=sk-...
OPENAI_API_KEY_ENTERPRISE=sk-...
\`\`\`
**Status:** ✅ Properly configured  
**Usage:** AI features, chat, content generation  
**Security:** All keys are server-only ✅  
**Note:** Multiple keys for different tier rate limits

#### External Services
\`\`\`bash
DEEPINFRA_API_KEY=...
FAL_KEY=...
WHISPER_API_KEY=...
RESEND_API_KEY=...
\`\`\`
**Status:** ✅ Properly configured  
**Usage:** AI models, image generation, transcription, email  
**Security:** All keys are server-only ✅

#### Application Configuration
\`\`\`bash
NEXT_PUBLIC_SITE_URL=https://agentgift.ai
NEXT_PUBLIC_BFF_URL=https://your-bff.vercel.app
PORT=3000
\`\`\`
**Status:** ✅ Properly configured  
**Usage:** App URLs, routing, API calls  
**Security:** Public URLs are safe to expose ✅

#### Orchestrator Configuration
\`\`\`bash
ORCHESTRATOR_URL=https://your-orchestrator.vercel.app
ORCHESTRATOR_SIGNING_SECRET=...
\`\`\`
**Status:** ✅ Properly configured  
**Usage:** Backend orchestration, workflow management  
**Security:** Signing secret is server-only ✅

#### Webhooks
\`\`\`bash
NEXT_PUBLIC_MAKE_WEBHOOK_URL=https://hook.us1.make.com/...
\`\`\`
**Status:** ✅ Properly configured  
**Usage:** Analytics, automation triggers  
**Security:** Webhook URL is safe to expose ✅

---

### 🔴 CRITICAL ISSUE (1 variable)

#### ElevenLabs API Key - CLIENT-SIDE EXPOSURE
\`\`\`bash
# ❌ WRONG - Exposed to client
NEXT_PUBLIC_ELEVENLABS_API_KEY=...

# ✅ CORRECT - Server-only
ELEVENLABS_API_KEY=...
\`\`\`

**Current State:**
- Variable is prefixed with `NEXT_PUBLIC_`
- Exposed in client-side JavaScript bundles
- Visible in browser DevTools
- Can be stolen and abused

**Impact:**
- Unauthorized API usage
- Unexpected charges
- API key theft
- Rate limit exhaustion

**Required Actions:**
1. **Immediate:** Remove `NEXT_PUBLIC_ELEVENLABS_API_KEY` from Vercel
2. **Add:** New `ELEVENLABS_API_KEY` (without NEXT_PUBLIC prefix)
3. **Update:** `app/api/voice/elevenlabs/route.ts` to use server-only key
4. **Verify:** No client components reference this key
5. **Test:** Voice features still work after change

**Files to Update:**
\`\`\`typescript
// app/api/voice/elevenlabs/route.ts
// BEFORE (❌ WRONG)
const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY

// AFTER (✅ CORRECT)
const apiKey = process.env.ELEVENLABS_API_KEY
\`\`\`

---

### ⚠️ Missing Variables (12 variables)

#### 1. Discord Webhook
\`\`\`bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
\`\`\`
**Usage:** Admin notifications, error alerts  
**Referenced in:** `app/api/admin/reports/discord-webhook/route.ts`  
**Impact:** Discord notifications won't work  
**Priority:** MEDIUM

#### 2. Google Site Verification
\`\`\`bash
GOOGLE_SITE_VERIFICATION=...
\`\`\`
**Usage:** Google Search Console verification  
**Referenced in:** `app/layout.tsx` (metadata)  
**Impact:** Can't verify site ownership with Google  
**Priority:** LOW

#### 3. Vercel URL (Auto-generated)
\`\`\`bash
NEXT_PUBLIC_VERCEL_URL=your-app.vercel.app
\`\`\`
**Usage:** Dynamic URL generation in deployments  
**Referenced in:** Multiple API routes  
**Impact:** Preview deployments may have incorrect URLs  
**Priority:** LOW (auto-set by Vercel)

#### 4. ElevenLabs Voice IDs
\`\`\`bash
NEXT_PUBLIC_ELEVENLABS_VOICE_AVELYN_ID=...
NEXT_PUBLIC_ELEVENLABS_VOICE_GALEN_ID=...
ELEVENLABS_VOICE_AVELYN_ID=...
ELEVENLABS_VOICE_GALEN_ID=...
\`\`\`
**Usage:** Voice synthesis for AI personas  
**Referenced in:** Voice API routes  
**Impact:** Voice features use default voices  
**Priority:** MEDIUM  
**Note:** Both public and private versions needed

#### 5. Database Connection String
\`\`\`bash
DATABASE_URL=postgresql://...
\`\`\`
**Usage:** Direct database access (if needed)  
**Referenced in:** Potential future migrations  
**Impact:** None currently  
**Priority:** LOW

#### 6. Redis Configuration
\`\`\`bash
REDIS_URL=redis://...
REDIS_TOKEN=...
\`\`\`
**Usage:** Caching, session storage  
**Referenced in:** Future rate limiting implementation  
**Impact:** No caching layer  
**Priority:** LOW

#### 7. Sentry Configuration
\`\`\`bash
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...
\`\`\`
**Usage:** Error tracking, performance monitoring  
**Referenced in:** Error boundaries (future)  
**Impact:** No error tracking  
**Priority:** MEDIUM

#### 8. Analytics Configuration
\`\`\`bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_POSTHOG_KEY=...
\`\`\`
**Usage:** Google Analytics, PostHog tracking  
**Referenced in:** Analytics middleware  
**Impact:** No analytics tracking  
**Priority:** MEDIUM

#### 9. Feature Flags
\`\`\`bash
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
NEXT_PUBLIC_ENABLE_ADMIN_PANEL=true
NEXT_PUBLIC_ENABLE_VOICE_FEATURES=true
\`\`\`
**Usage:** Feature toggles, A/B testing  
**Referenced in:** Feature gate components  
**Impact:** All features always enabled  
**Priority:** LOW

#### 10. Email Configuration
\`\`\`bash
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
\`\`\`
**Usage:** Transactional emails (alternative to Resend API)  
**Referenced in:** Email service (future)  
**Impact:** None (using Resend API)  
**Priority:** LOW

#### 11. Storage Configuration
\`\`\`bash
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=avatars
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
\`\`\`
**Usage:** File uploads, avatar storage  
**Referenced in:** Upload components  
**Impact:** Default values used  
**Priority:** LOW

#### 12. Rate Limiting
\`\`\`bash
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
\`\`\`
**Usage:** API rate limiting  
**Referenced in:** Rate limit middleware (future)  
**Impact:** No rate limiting  
**Priority:** MEDIUM

---

## Complete .env.example Template

\`\`\`bash
# =============================================================================
# AGENTGIFT.AI ENVIRONMENT VARIABLES
# =============================================================================
# Copy this file to .env.local and fill in your actual values
# Never commit .env.local to version control
# =============================================================================

# -----------------------------------------------------------------------------
# SUPABASE CONFIGURATION (REQUIRED)
# -----------------------------------------------------------------------------
# Get these from: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# -----------------------------------------------------------------------------
# STRIPE CONFIGURATION (REQUIRED FOR PAYMENTS)
# -----------------------------------------------------------------------------
# Get these from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_... # Use sk_live_... for production
STRIPE_PUBLISHABLE_KEY=pk_test_... # Use pk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe webhook settings

# -----------------------------------------------------------------------------
# OPENAI CONFIGURATION (REQUIRED FOR AI FEATURES)
# -----------------------------------------------------------------------------
# Get these from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-... # Main API key
OPENAI_API_KEY_PREMIUM=sk-... # Optional: Higher rate limit for premium users
OPENAI_API_KEY_PRO=sk-... # Optional: Higher rate limit for pro users
OPENAI_API_KEY_ENTERPRISE=sk-... # Optional: Highest rate limit for enterprise

# -----------------------------------------------------------------------------
# ELEVENLABS CONFIGURATION (REQUIRED FOR VOICE FEATURES)
# -----------------------------------------------------------------------------
# Get these from: https://elevenlabs.io/app/settings/api-keys
# ⚠️ IMPORTANT: Use ELEVENLABS_API_KEY (server-only), NOT NEXT_PUBLIC_
ELEVENLABS_API_KEY=... # Server-only API key
ELEVENLABS_VOICE_AVELYN_ID=... # Voice ID for Avelyn persona
ELEVENLABS_VOICE_GALEN_ID=... # Voice ID for Galen persona

# Optional: Public voice IDs (if needed for client-side voice selection)
NEXT_PUBLIC_ELEVENLABS_VOICE_AVELYN_ID=...
NEXT_PUBLIC_ELEVENLABS_VOICE_GALEN_ID=...

# -----------------------------------------------------------------------------
# EXTERNAL AI SERVICES (OPTIONAL)
# -----------------------------------------------------------------------------
# DeepInfra: https://deepinfra.com/dash/api_keys
DEEPINFRA_API_KEY=...

# Fal.ai: https://fal.ai/dashboard/keys
FAL_KEY=...

# Whisper (OpenAI): Usually same as OPENAI_API_KEY
WHISPER_API_KEY=...

# -----------------------------------------------------------------------------
# EMAIL CONFIGURATION (REQUIRED FOR TRANSACTIONAL EMAILS)
# -----------------------------------------------------------------------------
# Get this from: https://resend.com/api-keys
RESEND_API_KEY=re_...

# -----------------------------------------------------------------------------
# APPLICATION CONFIGURATION (REQUIRED)
# -----------------------------------------------------------------------------
# Your application URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # Use https://agentgift.ai for production
NEXT_PUBLIC_BFF_URL=https://your-bff.vercel.app # Backend-for-frontend URL
PORT=3000 # Local development port

# -----------------------------------------------------------------------------
# ORCHESTRATOR CONFIGURATION (REQUIRED FOR BACKEND WORKFLOWS)
# -----------------------------------------------------------------------------
ORCHESTRATOR_URL=https://your-orchestrator.vercel.app
ORCHESTRATOR_SIGNING_SECRET=... # Secret for signing requests

# -----------------------------------------------------------------------------
# WEBHOOKS (OPTIONAL)
# -----------------------------------------------------------------------------
# Make.com webhook for analytics
NEXT_PUBLIC_MAKE_WEBHOOK_URL=https://hook.us1.make.com/...

# Discord webhook for admin notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# -----------------------------------------------------------------------------
# VERCEL CONFIGURATION (AUTO-SET BY VERCEL)
# -----------------------------------------------------------------------------
# These are automatically set by Vercel, no need to add manually
# NEXT_PUBLIC_VERCEL_URL=your-app.vercel.app
# VERCEL_ENV=production

# -----------------------------------------------------------------------------
# GOOGLE SERVICES (OPTIONAL)
# -----------------------------------------------------------------------------
# Google Search Console verification
GOOGLE_SITE_VERIFICATION=...

# -----------------------------------------------------------------------------
# ANALYTICS (OPTIONAL)
# -----------------------------------------------------------------------------
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# -----------------------------------------------------------------------------
# ERROR TRACKING (OPTIONAL)
# -----------------------------------------------------------------------------
# Sentry
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...

# -----------------------------------------------------------------------------
# FEATURE FLAGS (OPTIONAL)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
NEXT_PUBLIC_ENABLE_ADMIN_PANEL=true
NEXT_PUBLIC_ENABLE_VOICE_FEATURES=true

# -----------------------------------------------------------------------------
# RATE LIMITING (OPTIONAL)
# -----------------------------------------------------------------------------
RATE_LIMIT_MAX_REQUESTS=100 # Max requests per window
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes in milliseconds

# -----------------------------------------------------------------------------
# STORAGE (OPTIONAL)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=avatars
NEXT_PUBLIC_MAX_FILE_SIZE=5242880 # 5MB in bytes

# -----------------------------------------------------------------------------
# DATABASE (OPTIONAL - FOR DIRECT ACCESS)
# -----------------------------------------------------------------------------
# Usually not needed as we use Supabase client
# DATABASE_URL=postgresql://...

# -----------------------------------------------------------------------------
# REDIS (OPTIONAL - FOR CACHING)
# -----------------------------------------------------------------------------
# REDIS_URL=redis://...
# REDIS_TOKEN=...

# =============================================================================
# END OF CONFIGURATION
# =============================================================================
\`\`\`

---

## Security Best Practices

### ✅ DO
1. **Use server-only keys** for sensitive APIs (no `NEXT_PUBLIC_` prefix)
2. **Rotate keys regularly** (every 90 days minimum)
3. **Use different keys** for development and production
4. **Store keys in Vercel** environment variables, not in code
5. **Add .env.local to .gitignore** (already done)
6. **Use environment-specific keys** (test keys for staging, live keys for production)

### ❌ DON'T
1. **Never commit** `.env.local` to version control
2. **Never use** `NEXT_PUBLIC_` prefix for API keys
3. **Never hardcode** secrets in code
4. **Never share** production keys in Slack/email
5. **Never reuse** the same key across multiple services
6. **Never log** environment variables in production

---

## Verification Checklist

### Before Deployment
- [ ] All REQUIRED variables are set in Vercel
- [ ] No `NEXT_PUBLIC_` prefixed API keys
- [ ] Production keys are different from development keys
- [ ] Webhook URLs are correct for production
- [ ] Site URL matches production domain
- [ ] All keys are valid and not expired

### After Deployment
- [ ] Test authentication flow
- [ ] Test payment processing
- [ ] Test AI features (chat, voice)
- [ ] Test email sending
- [ ] Test webhook integrations
- [ ] Monitor error logs for missing variables

---

## Migration Guide

### Step 1: Fix ElevenLabs Key (CRITICAL)
\`\`\`bash
# In Vercel dashboard:
# 1. Go to Settings > Environment Variables
# 2. Delete: NEXT_PUBLIC_ELEVENLABS_API_KEY
# 3. Add: ELEVENLABS_API_KEY (same value, without NEXT_PUBLIC_)
# 4. Redeploy application
\`\`\`

### Step 2: Add Missing Variables
\`\`\`bash
# Add these to Vercel if needed:
DISCORD_WEBHOOK_URL=...
ELEVENLABS_VOICE_AVELYN_ID=...
ELEVENLABS_VOICE_GALEN_ID=...
GOOGLE_SITE_VERIFICATION=...
\`\`\`

### Step 3: Update Code
\`\`\`typescript
// app/api/voice/elevenlabs/route.ts
// Change this line:
const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
// To this:
const apiKey = process.env.ELEVENLABS_API_KEY
\`\`\`

### Step 4: Test
\`\`\`bash
# Local testing:
npm run dev
# Test voice features
# Check browser console for errors

# Production testing:
# Deploy to Vercel
# Test voice features in production
# Monitor Vercel logs for errors
\`\`\`

---

## Next Steps

1. **Immediate:** Fix ElevenLabs API key exposure
2. **Short-term:** Add missing MEDIUM priority variables
3. **Long-term:** Add optional monitoring and analytics variables
4. **Ongoing:** Regular key rotation and security audits

**Estimated Time:** 2-4 hours  
**Risk Level:** LOW (straightforward configuration changes)
