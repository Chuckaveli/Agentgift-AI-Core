# 🚀 AgentGift AI - Complete Setup Guide

## 📋 **Current Status**
✅ Login system working  
✅ `/features` routes working  
✅ User tier access working  
✅ All feature routes connected  

## 🔧 **Next Steps for Production Deployment**

### **1. Environment Variables Setup**

Create `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Vercel Configuration (for production)
VERCEL_URL=your_vercel_deployment_url

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true
```

### **2. Supabase Setup**

#### **A. Database Schema**
Run these SQL scripts in your Supabase SQL editor:

```sql
-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  tier TEXT DEFAULT 'free_agent',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  credits INTEGER DEFAULT 10,
  prestige_level TEXT,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

#### **B. Supabase Auth Configuration**
1. Go to Supabase Dashboard → Authentication → Settings
2. Set your site URL: `https://your-domain.vercel.app`
3. Add redirect URLs:
   - `https://your-domain.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

### **3. Vercel Deployment Setup**

#### **A. Fix pnpm Lockfile Issue**
```bash
# Remove existing lockfiles
rm -rf node_modules
rm pnpm-lock.yaml
rm package-lock.json

# Reinstall with pnpm
pnpm install

# Commit the new lockfile
git add pnpm-lock.yaml
git commit -m "Fix pnpm lockfile"
git push
```

#### **B. Vercel Environment Variables**
In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### **C. Vercel Build Settings**
- Framework Preset: Next.js
- Build Command: `pnpm build`
- Install Command: `pnpm install`
- Output Directory: `.next`

### **4. Critical Routes Testing**

#### **A. Test Authentication Flow**
```bash
# Test these endpoints:
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/user
```

#### **B. Test Feature Access**
```bash
# Test these routes:
GET /features/gift-gut-check
GET /features/agent-gifty
GET /features/gift-dna-quiz
GET /features/group-splitter
GET /features/emotion-tags
GET /features/gift-reveal-viewer
```

#### **C. Test API Endpoints**
```bash
# Test these APIs:
GET /api/feature-access
POST /api/features/gift-gut-check
POST /api/features/agent-gifty
POST /api/features/gift-dna-quiz
```

### **5. XP and Badge System Testing**

#### **A. Test XP Awarding**
```javascript
// Test XP awarding in browser console
fetch('/api/features/gift-gut-check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ answers: {}, giftDescription: 'test' })
})
.then(res => res.json())
.then(data => console.log('XP Awarded:', data))
```

#### **B. Test Badge System**
```javascript
// Test badge unlocking
fetch('/api/badges/unlock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ badgeId: 'first_gift' })
})
.then(res => res.json())
.then(data => console.log('Badge Unlocked:', data))
```

### **6. Production Checklist**

#### **A. Security**
- [ ] RLS policies enabled
- [ ] Service role key secured
- [ ] Environment variables set
- [ ] CORS configured

#### **B. Performance**
- [ ] Images optimized
- [ ] Bundle size optimized
- [ ] CDN configured
- [ ] Caching enabled

#### **C. Monitoring**
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Uptime monitoring
- [ ] Performance monitoring

### **7. Troubleshooting Common Issues**

#### **A. Vercel Deployment Errors**
```bash
# If you get ERR_PNPM_OUTDATED_LOCKFILE:
rm pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "Update lockfile"
git push
```

#### **B. Supabase Connection Issues**
```javascript
// Test connection in browser console
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

supabase.auth.getSession().then(({ data, error }) => {
  console.log('Connection test:', { data, error })
})
```

#### **C. Environment Variables Not Working**
```bash
# Check if env vars are loaded
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### **8. Final Deployment Steps**

1. **Push to GitHub**
```bash
git add .
git commit -m "Production ready"
git push origin main
```

2. **Deploy to Vercel**
- Connect GitHub repo to Vercel
- Set environment variables
- Deploy

3. **Test Live**
- Test all features
- Check authentication
- Verify XP/badge system
- Monitor performance

## 🎯 **Success Criteria**

✅ All routes working  
✅ Authentication working  
✅ XP system working  
✅ Badge system working  
✅ Tier access working  
✅ No deployment errors  
✅ Performance optimized  

## 📞 **Support**

If you encounter issues:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Check Supabase logs
4. Test with the debugging code provided above

---

**Ready for production! 🚀** 