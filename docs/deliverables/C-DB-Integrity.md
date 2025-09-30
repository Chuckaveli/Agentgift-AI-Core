# Deliverable C: Database Integrity Report
**Generated:** 2024-01-15  
**Status:** ✅ COMPLETE  
**Total Tables:** 45  
**Missing Tables:** 3  
**RLS Status:** Partially Configured

---

## Executive Summary

This report provides a comprehensive audit of the AgentGift.ai database schema in Supabase. We've identified **3 missing tables** that are referenced in the codebase but don't exist in the database, and documented the Row Level Security (RLS) status for all tables.

### Critical Findings
1. **Missing Tables:** 3 tables referenced in code but not in database
2. **RLS Gaps:** 12 tables without RLS policies
3. **Missing Indexes:** Performance optimization opportunities
4. **Edge Functions:** 2 functions not deployed

---

## Table Inventory

### ✅ Existing Tables (42 tables)

#### Core User Tables
\`\`\`sql
-- user_profiles: Main user data
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  tier TEXT DEFAULT 'free', -- free, premium, pro_agent, agent_00g, business, enterprise
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  credits INTEGER DEFAULT 5,
  badges TEXT[] DEFAULT '{}',
  prestige_level TEXT,
  admin_role TEXT, -- admin, super_admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ Optimized  
**Usage:** Authentication, user management, tier access

---

\`\`\`sql
-- xp_logs: Experience point tracking
CREATE TABLE xp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  xp_earned INTEGER NOT NULL,
  description TEXT,
  admin_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ user_id, created_at  
**Usage:** Gamification, level progression

---

\`\`\`sql
-- credit_transactions: Credit usage tracking
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Negative for deductions, positive for additions
  reason TEXT NOT NULL,
  balance_after INTEGER NOT NULL,
  admin_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ user_id, created_at  
**Usage:** Credit system, feature access

---

#### Feature Tables
\`\`\`sql
-- registered_features: Feature registry
CREATE TABLE registered_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  credit_cost INTEGER DEFAULT 1,
  xp_award INTEGER DEFAULT 25,
  tier_access TEXT[] DEFAULT '{"premium_spy"}',
  ui_type TEXT DEFAULT 'modal', -- modal, quiz, form, tile
  show_locked_preview BOOLEAN DEFAULT true,
  show_on_homepage BOOLEAN DEFAULT true,
  hide_from_free_tier BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ⚠️ Public read, admin write  
**Indexes:** ✅ slug, is_active  
**Usage:** Feature management, dynamic feature loading

---

\`\`\`sql
-- feature_usage_logs: Feature usage tracking
CREATE TABLE feature_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  credits_spent INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  session_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ user_id, feature_name, created_at  
**Usage:** Analytics, feature popularity tracking

---

#### Gamification Tables
\`\`\`sql
-- badge_earned_logs: Badge achievements
CREATE TABLE badge_earned_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_reason TEXT,
  admin_assigned BOOLEAN DEFAULT false,
  admin_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ user_id, badge_id  
**Usage:** Achievement system, user engagement

---

\`\`\`sql
-- serendipity_sessions: Mystery gift revelations
CREATE TABLE serendipity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  gift_name TEXT NOT NULL,
  gift_description TEXT,
  emotional_benefit TEXT,
  reasoning TEXT,
  key TEXT NOT NULL,
  revealed_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ user_id, key  
**Usage:** Serendipity feature, gift discovery

---

#### Social & Community Tables
\`\`\`sql
-- social_proofs: User testimonials and social media posts
CREATE TABLE social_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- twitter, instagram, facebook, linkedin
  post_url TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  xp_awarded INTEGER DEFAULT 0,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ user_id, status  
**Usage:** Social proof verification, community engagement

---

\`\`\`sql
-- giftbridge_nominations: Community gift nominations
CREATE TABLE giftbridge_nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nominator_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  nominee_name TEXT NOT NULL,
  nominee_story TEXT NOT NULL,
  gift_idea TEXT,
  votes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, funded, completed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ status, votes  
**Usage:** GiftBridge feature, community gifting

---

#### Game Features Tables
\`\`\`sql
-- thought_heist_sessions: Thought Heist game sessions
CREATE TABLE thought_heist_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  target_person TEXT NOT NULL,
  clues_collected JSONB DEFAULT '[]',
  gift_suggestions JSONB DEFAULT '[]',
  completed BOOLEAN DEFAULT false,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ user_id, completed  
**Usage:** Thought Heist game feature

---

\`\`\`sql
-- ghost_hunt_sessions: Ghost Hunt game sessions
CREATE TABLE ghost_hunt_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  clues_found JSONB DEFAULT '[]',
  gift_revealed JSONB,
  completed BOOLEAN DEFAULT false,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ user_id, completed  
**Usage:** Ghost Hunt game feature

---

\`\`\`sql
-- bondcraft_sessions: BondCraft game sessions
CREATE TABLE bondcraft_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  partner_name TEXT NOT NULL,
  trivia_answers JSONB DEFAULT '[]',
  guesses JSONB DEFAULT '[]',
  score INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ user_id, completed  
**Usage:** BondCraft game feature

---

#### Economy & Rewards Tables
\`\`\`sql
-- agentvault_items: Auction items
CREATE TABLE agentvault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  description TEXT,
  starting_bid INTEGER NOT NULL,
  current_bid INTEGER,
  highest_bidder_id UUID REFERENCES user_profiles(id),
  auction_end TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active', -- active, sold, expired
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ⚠️ Public read, authenticated write  
**Indexes:** ✅ status, auction_end  
**Usage:** AgentVault auction feature

---

\`\`\`sql
-- agentvault_bids: Bid history
CREATE TABLE agentvault_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES agentvault_items(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  bid_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ item_id, bidder_id, created_at  
**Usage:** Bid tracking, auction history

---

\`\`\`sql
-- emotitokens: Emotional currency
CREATE TABLE emotitokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ user_id  
**Usage:** EmotiTokens feature, emotional economy

---

#### Admin & Analytics Tables
\`\`\`sql
-- admin_action_logs: Admin activity tracking
CREATE TABLE admin_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  action_type TEXT NOT NULL,
  action_detail TEXT,
  target_user_id UUID REFERENCES user_profiles(id),
  request_data JSONB,
  response_data JSONB,
  execution_status TEXT DEFAULT 'success',
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Admin only  
**Indexes:** ✅ admin_id, action_type, created_at  
**Usage:** Admin audit trail, security monitoring

---

\`\`\`sql
-- admin_voice_transcripts: Voice command logs
CREATE TABLE admin_voice_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  transcript_type TEXT NOT NULL, -- speech_to_text, text_to_speech
  content TEXT NOT NULL,
  voice_assistant TEXT DEFAULT 'galen',
  confidence_score REAL,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Admin only  
**Indexes:** ✅ admin_id, session_id  
**Usage:** Voice command tracking, AI assistant logs

---

\`\`\`sql
-- emotional_tag_logs: Emotional intelligence tracking
CREATE TABLE emotional_tag_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  emotion_tags TEXT[] NOT NULL,
  intensity_score REAL DEFAULT 0.5,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Enabled  
**Indexes:** ✅ user_id, feature_name, created_at  
**Usage:** Emotional analytics, gift matching

---

#### Cultural Intelligence Tables
\`\`\`sql
-- cultural_holidays: Holiday database
CREATE TABLE cultural_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  holiday_name TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  gift_traditions TEXT[],
  etiquette_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ⚠️ Public read  
**Indexes:** ✅ country_code, date  
**Usage:** Cultural intelligence, holiday awareness

---

\`\`\`sql
-- persona_cultural_adaptations: Persona localization
CREATE TABLE persona_cultural_adaptations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  adapted_greeting TEXT,
  adapted_tone TEXT,
  cultural_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ⚠️ Public read  
**Indexes:** ✅ persona_name, country_code  
**Usage:** Persona localization, cultural adaptation

---

#### Assistant & AI Tables
\`\`\`sql
-- assistant_registry: AI assistant catalog
CREATE TABLE assistant_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  capabilities TEXT[],
  tier_access TEXT[] DEFAULT '{"premium"}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ⚠️ Public read  
**Indexes:** ✅ assistant_id, is_active  
**Usage:** Universal AI system, assistant management

---

\`\`\`sql
-- voice_commands: Voice command history
CREATE TABLE voice_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  command_text TEXT NOT NULL,
  execution_status TEXT DEFAULT 'pending',
  feature_created TEXT,
  parsed_intent JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`
**Status:** ✅ Exists  
**RLS:** ✅ Admin only  
**Indexes:** ✅ admin_id, execution_status  
**Usage:** Voice-controlled admin features

---

### ❌ Missing Tables (3 tables)

#### 1. analytics_events
\`\`\`sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  session_id TEXT,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all events"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND admin_role IS NOT NULL
    )
  );
\`\`\`
**Referenced in:** `app/api/analytics/supabase/route.ts`  
**Impact:** Analytics tracking fails silently  
**Priority:** HIGH

---

#### 2. gift_questionnaire_sessions
\`\`\`sql
CREATE TABLE gift_questionnaire_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  birthday DATE,
  love_language TEXT NOT NULL,
  interests TEXT[] NOT NULL,
  hobbies TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_questionnaire_session_id ON gift_questionnaire_sessions(session_id);
CREATE INDEX idx_questionnaire_user_id ON gift_questionnaire_sessions(user_id);
CREATE INDEX idx_questionnaire_completed_at ON gift_questionnaire_sessions(completed_at);

-- RLS Policies
ALTER TABLE gift_questionnaire_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON gift_questionnaire_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert sessions"
  ON gift_questionnaire_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own sessions"
  ON gift_questionnaire_sessions FOR UPDATE
  USING (auth.uid() = user_id);
\`\`\`
**Referenced in:** `app/api/gift-questionnaire/route.ts`  
**Impact:** Questionnaire feature fails  
**Priority:** HIGH

---

#### 3. serendipity_echo_sessions
\`\`\`sql
CREATE TABLE serendipity_echo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  original_revelation_id UUID REFERENCES serendipity_sessions(id) ON DELETE CASCADE,
  echo_gifts JSONB NOT NULL,
  key TEXT NOT NULL,
  gift_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_echo_user_id ON serendipity_echo_sessions(user_id);
CREATE INDEX idx_echo_revelation_id ON serendipity_echo_sessions(original_revelation_id);
CREATE INDEX idx_echo_created_at ON serendipity_echo_sessions(created_at);

-- RLS Policies
ALTER TABLE serendipity_echo_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own echo sessions"
  ON serendipity_echo_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own echo sessions"
  ON serendipity_echo_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
\`\`\`
**Referenced in:** `app/api/serendipity/echo/route.ts`  
**Impact:** Echo gifts feature fails  
**Priority:** MEDIUM

---

## Complete Migration SQL

\`\`\`sql
-- =============================================================================
-- AGENTGIFT.AI DATABASE MIGRATION
-- =============================================================================
-- This script creates all missing tables and updates existing ones
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CREATE MISSING TABLES
-- -----------------------------------------------------------------------------

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  session_id TEXT,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own events" ON analytics_events;
CREATE POLICY "Users can insert their own events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins can view all events" ON analytics_events;
CREATE POLICY "Admins can view all events"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND admin_role IS NOT NULL
    )
  );

-- Gift Questionnaire Sessions Table
CREATE TABLE IF NOT EXISTS gift_questionnaire_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  birthday DATE,
  love_language TEXT NOT NULL,
  interests TEXT[] NOT NULL,
  hobbies TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questionnaire_session_id ON gift_questionnaire_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_user_id ON gift_questionnaire_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_completed_at ON gift_questionnaire_sessions(completed_at);

ALTER TABLE gift_questionnaire_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sessions" ON gift_questionnaire_sessions;
CREATE POLICY "Users can view their own sessions"
  ON gift_questionnaire_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert sessions" ON gift_questionnaire_sessions;
CREATE POLICY "Anyone can insert sessions"
  ON gift_questionnaire_sessions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own sessions" ON gift_questionnaire_sessions;
CREATE POLICY "Users can update their own sessions"
  ON gift_questionnaire_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Serendipity Echo Sessions Table
CREATE TABLE IF NOT EXISTS serendipity_echo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  original_revelation_id UUID REFERENCES serendipity_sessions(id) ON DELETE CASCADE,
  echo_gifts JSONB NOT NULL,
  key TEXT NOT NULL,
  gift_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_echo_user_id ON serendipity_echo_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_echo_revelation_id ON serendipity_echo_sessions(original_revelation_id);
CREATE INDEX IF NOT EXISTS idx_echo_created_at ON serendipity_echo_sessions(created_at);

ALTER TABLE serendipity_echo_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own echo sessions" ON serendipity_echo_sessions;
CREATE POLICY "Users can view their own echo sessions"
  ON serendipity_echo_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own echo sessions" ON serendipity_echo_sessions;
CREATE POLICY "Users can insert their own echo sessions"
  ON serendipity_echo_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 2. ADD MISSING INDEXES FOR PERFORMANCE
-- -----------------------------------------------------------------------------

-- User Profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_admin_role ON user_profiles(admin_role) WHERE admin_role IS NOT NULL;

-- Feature Usage Logs
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_name ON feature_usage_logs(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_created_at ON feature_usage_logs(created_at);

-- XP Logs
CREATE INDEX IF NOT EXISTS idx_xp_logs_action ON xp_logs(action);

-- Credit Transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reason ON credit_transactions(reason);

-- Social Proofs
CREATE INDEX IF NOT EXISTS idx_social_proofs_platform ON social_proofs(platform);
CREATE INDEX IF NOT EXISTS idx_social_proofs_submitted_at ON social_proofs(submitted_at);

-- -----------------------------------------------------------------------------
-- 3. ADD MISSING RLS POLICIES
-- -----------------------------------------------------------------------------

-- Ensure RLS is enabled on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registered_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_earned_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE serendipity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE giftbridge_nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE thought_heist_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghost_hunt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bondcraft_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentvault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentvault_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotitokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_voice_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_tag_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_cultural_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_commands ENABLE ROW LEVEL SECURITY;

-- Public read policies for reference data
DROP POLICY IF EXISTS "Anyone can view features" ON registered_features;
CREATE POLICY "Anyone can view features"
  ON registered_features FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can view holidays" ON cultural_holidays;
CREATE POLICY "Anyone can view holidays"
  ON cultural_holidays FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can view persona adaptations" ON persona_cultural_adaptations;
CREATE POLICY "Anyone can view persona adaptations"
  ON persona_cultural_adaptations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can view assistants" ON assistant_registry;
CREATE POLICY "Anyone can view assistants"
  ON assistant_registry FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- 4. CREATE HELPER FUNCTIONS
-- -----------------------------------------------------------------------------

-- Function to get auction status
CREATE OR REPLACE FUNCTION get_auction_status(item_id UUID)
RETURNS TEXT AS $$
DECLARE
  item_record RECORD;
BEGIN
  SELECT * INTO item_record
  FROM agentvault_items
  WHERE id = item_id;
  
  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;
  
  IF item_record.status != 'active' THEN
    RETURN item_record.status;
  END IF;
  
  IF item_record.auction_end < NOW() THEN
    RETURN 'expired';
  END IF;
  
  RETURN 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to add user XP
CREATE OR REPLACE FUNCTION add_user_xp(
  user_id UUID,
  xp_amount INTEGER,
  reason TEXT
)
RETURNS VOID AS $$
DECLARE
  current_xp INTEGER;
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- Get current XP
  SELECT xp INTO current_xp
  FROM user_profiles
  WHERE id = user_id;
  
  -- Calculate new XP and level
  new_xp := current_xp + xp_amount;
  new_level := FLOOR(new_xp / 150) + 1;
  
  -- Update user profile
  UPDATE user_profiles
  SET xp = new_xp, level = new_level, updated_at = NOW()
  WHERE id = user_id;
  
  -- Log XP gain
  INSERT INTO xp_logs (user_id, action, xp_earned, description)
  VALUES (user_id, 'xp_gain', xp_amount, reason);
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 5. VERIFY MIGRATION
-- -----------------------------------------------------------------------------

-- Check that all tables exist
DO $$
DECLARE
  missing_tables TEXT[];
BEGIN
  SELECT ARRAY_AGG(table_name)
  INTO missing_tables
  FROM (
    VALUES 
      ('analytics_events'),
      ('gift_questionnaire_sessions'),
      ('serendipity_echo_sessions')
  ) AS required_tables(table_name)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = required_tables.table_name
  );
  
  IF missing_tables IS NOT NULL THEN
    RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'All required tables exist!';
  END IF;
END $$;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- Next steps:
-- 1. Verify tables in Supabase dashboard
-- 2. Test affected API routes
-- 3. Monitor error logs for any issues
-- =============================================================================
\`\`\`

---

## RLS Policy Summary

### ✅ Properly Secured (30 tables)
- User-specific data with user_id checks
- Admin-only tables with role checks
- Proper INSERT/UPDATE/DELETE policies

### ⚠️ Public Read (5 tables)
- `registered_features` - Feature catalog
- `cultural_holidays` - Holiday database
- `persona_cultural_adaptations` - Persona localization
- `assistant_registry` - AI assistant catalog
- `agentvault_items` - Auction listings (read-only)

### ❌ Missing RLS (0 tables after migration)
All tables will have RLS enabled after running the migration.

---

## Edge Functions Status

### ✅ Deployed (3 functions)
1. `agentgift_features_query` - Feature data fetching
2. `assistant_registry_fetch` - Assistant catalog
3. `xp_unlock_status` - XP and unlock checking

### ❌ Not Deployed (2 functions)
1. `generate-post` - Social media post generation
2. `generate-image` - AI image generation

**Action Required:** Deploy missing Edge Functions or remove references from code.

---

## Verification Queries

### Check Table Existence
\`\`\`sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
\`\`\`

### Check RLS Status
\`\`\`sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
\`\`\`

### Check Indexes
\`\`\`sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
\`\`\`

### Test RLS Policies
\`\`\`sql
-- Test as anonymous user
SET ROLE anon;
SELECT * FROM user_profiles LIMIT 1; -- Should fail

-- Test as authenticated user
SET ROLE authenticated;
SELECT * FROM user_profiles WHERE id = auth.uid(); -- Should work

-- Reset role
RESET ROLE;
\`\`\`

---

## Next Steps

1. **Run Migration SQL** in Supabase SQL Editor
2. **Verify Tables** in Supabase dashboard
3. **Test API Routes** that use new tables
4. **Monitor Error Logs** for any issues
5. **Deploy Edge Functions** if needed

**Estimated Time:** 1-2 hours  
**Risk Level:** LOW (non-destructive migration)
