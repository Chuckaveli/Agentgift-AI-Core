# Vercel Environment Variables Setup Guide

This guide will help you set up all required environment variables in Vercel for AgentGift.ai.

## Quick Setup

### 1. Access Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your `agentgift-dashboard` project
3. Go to **Settings** → **Environment Variables**

### 2. Required Variables (CRITICAL)

#### Supabase (Get from https://app.supabase.com/project/YOUR_PROJECT/settings/api)
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

#### Security Keys (Generate with crypto)
\`\`\`bash
# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate CSRF secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

\`\`\`
ENCRYPTION_KEY=<generated-64-char-hex>
CSRF_SECRET=<generated-64-char-hex>
JWT_SECRET=<generated-64-char-hex>
\`\`\`

#### OpenAI (Get from https://platform.openai.com/api-keys)
\`\`\`
OPENAI_API_KEY=sk-proj-...
\`\`\`

#### ElevenLabs (Get from https://elevenlabs.io/app/settings/api-keys)
\`\`\`
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_AVELYN_ID=<voice-id>
ELEVENLABS_VOICE_GALEN_ID=<voice-id>
\`\`\`

#### Stripe (Get from https://dashboard.stripe.com/apikeys)
\`\`\`
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_...
\`\`\`

#### Site Configuration
\`\`\`
NEXT_PUBLIC_SITE_URL=https://agentgift.ai
\`\`\`

### 3. Optional Variables

#### Additional OpenAI Keys (for tier-based usage)
\`\`\`
OPENAI_API_KEY_PREMIUM=sk-proj-...
OPENAI_API_KEY_PRO=sk-proj-...
OPENAI_API_KEY_ENTERPRISE=sk-proj-...
\`\`\`

#### Other Services
\`\`\`
WHISPER_API_KEY=<your-key>
DEEPINFRA_API_KEY=<your-key>
FAL_KEY=<your-key>
RESEND_API_KEY=re_...
\`\`\`

#### Webhooks
\`\`\`
ORCHESTRATOR_SIGNING_SECRET=<generate-random>
ORCHESTRATOR_URL=https://orchestrator.vercel.app
NEXT_PUBLIC_MAKE_WEBHOOK_URL=https://hook.us1.make.com/...
NEXT_PUBLIC_BFF_URL=https://bff.agentgift.ai
\`\`\`

## Setting Variables in Vercel

### Option 1: Web Interface
1. Go to **Settings** → **Environment Variables**
2. Click **Add New**
3. Enter **Key** and **Value**
4. Select environments: **Production**, **Preview**, **Development**
5. Click **Save**

### Option 2: Vercel CLI
\`\`\`bash
# Set a single variable
vercel env add NEXT_PUBLIC_SUPABASE_URL

# Set from .env file
vercel env pull .env.local
\`\`\`

### Option 3: Bulk Import
1. Create a `.env.production` file locally
2. Use Vercel CLI: `vercel env pull`
3. Or copy-paste into Vercel UI

## Verification

### 1. Run Local Check
\`\`\`bash
npx tsx scripts/verify-vercel-env.ts
\`\`\`

### 2. Check Via API
After deployment, visit:
\`\`\`
https://your-site.vercel.app/api/env-check
\`\`\`

### 3. Admin Dashboard
Visit the admin panel:
\`\`\`
https://your-site.vercel.app/admin/env-check
\`\`\`

## Environment Types

### Production
- Used for `vercel --prod` deployments
- Live site environment
- Use real API keys

### Preview
- Used for PR deployments
- Can use test keys
- Automatically deployed

### Development
- Local development only
- Pulled with `vercel env pull`
- Not used in deployments

## Security Best Practices

### ✅ DO:
- Use `NEXT_PUBLIC_` prefix for client-side variables only
- Keep API keys server-side (no `NEXT_PUBLIC_` prefix)
- Use different keys for production vs development
- Rotate keys regularly
- Use Stripe test mode for development

### ❌ DON'T:
- Never add `NEXT_PUBLIC_` to API keys
- Never commit `.env` files to Git
- Never share production keys
- Never use placeholder values in production

## Troubleshooting

### Variables Not Updating
1. Re-deploy after adding variables
2. Check variable is in correct environment
3. Clear cache: `vercel --force`

### Build Failing
1. Check all REQUIRED variables are set
2. Verify no placeholder values
3. Check Vercel build logs

### Supabase Connection Issues
1. Verify URL format: `https://xxxxx.supabase.co`
2. Check anon key is correct
3. Ensure RLS policies allow access

## Quick Reference

| Variable | Required | Client-Side | Notes |
|----------|----------|-------------|-------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ | ✅ | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ | ✅ | Public anon key |
| SUPABASE_SERVICE_ROLE_KEY | ✅ | ❌ | Server-side only |
| ENCRYPTION_KEY | ✅ | ❌ | 64-char hex |
| OPENAI_API_KEY | ✅ | ❌ | Server-side only |
| ELEVENLABS_API_KEY | ✅ | ❌ | Never client-side |
| STRIPE_SECRET_KEY | ✅ | ❌ | Server-side only |

## Support

If you encounter issues:
1. Check the verification script output
2. Visit `/admin/env-check` in your deployment
3. Review Vercel build logs
4. Check Supabase connection
