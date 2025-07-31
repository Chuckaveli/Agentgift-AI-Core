-- Giftverse Visual Analytics Schema
-- Supporting tables for comprehensive admin dashboard analytics

-- User XP tracking table
CREATE TABLE IF NOT EXISTS user_xp (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL DEFAULT 0,
  xp_source TEXT NOT NULL, -- 'feature_usage', 'badge_unlock', 'daily_bonus', etc.
  feature_name TEXT,
  description TEXT,
  multiplier DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature usage logging
CREATE TABLE IF NOT EXISTS feature_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  feature_category TEXT,
  usage_duration_seconds INTEGER,
  success_status BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift interaction tracking
CREATE TABLE IF NOT EXISTS gift_click_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_category TEXT NOT NULL,
  gift_subcategory TEXT,
  recipient_persona_type TEXT,
  interaction_type TEXT NOT NULL, -- 'click', 'save', 'share', 'purchase'
  gift_metadata JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced emotional tag logs (if not exists)
CREATE TABLE IF NOT EXISTS emotional_tag_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion_category TEXT NOT NULL,
  emotion_intensity DECIMAL(3,2) CHECK (emotion_intensity >= 0 AND emotion_intensity <= 5),
  trigger_feature TEXT,
  context_data JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice session logs (if not exists)
CREATE TABLE IF NOT EXISTS voice_session_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_name TEXT NOT NULL, -- 'avelyn', 'galen', 'sage', 'echo'
  session_duration_seconds INTEGER,
  interaction_count INTEGER DEFAULT 0,
  session_type TEXT DEFAULT 'standard', -- 'admin', 'standard', 'support'
  session_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Admin roles table (if not exists)
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role_name TEXT NOT NULL DEFAULT 'admin',
  permissions TEXT[] DEFAULT ARRAY['read', 'write'],
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_user_xp_user_created ON user_xp(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_xp_created_at ON user_xp(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_xp_source ON user_xp(xp_source);

CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_created ON feature_usage_logs(feature_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_created ON feature_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_usage_category ON feature_usage_logs(feature_category);

CREATE INDEX IF NOT EXISTS idx_gift_clicks_category_created ON gift_click_logs(gift_category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gift_clicks_user_created ON gift_click_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gift_clicks_persona ON gift_click_logs(recipient_persona_type);

CREATE INDEX IF NOT EXISTS idx_emotional_tags_category_created ON emotional_tag_logs(emotion_category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emotional_tags_user_created ON emotional_tag_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_voice_created ON voice_session_logs(voice_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user_created ON voice_session_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_roles_user_active ON admin_roles(user_id, is_active);

-- Row Level Security
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_click_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_tag_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies for analytics
CREATE POLICY "Admin analytics access" ON user_xp
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE admin_roles.user_id = auth.uid() 
      AND admin_roles.is_active = true
    )
  );

CREATE POLICY "Admin feature usage access" ON feature_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE admin_roles.user_id = auth.uid() 
      AND admin_roles.is_active = true
    )
  );

CREATE POLICY "Admin gift clicks access" ON gift_click_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE admin_roles.user_id = auth.uid() 
      AND admin_roles.is_active = true
    )
  );

CREATE POLICY "Admin emotional tags access" ON emotional_tag_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE admin_roles.user_id = auth.uid() 
      AND admin_roles.is_active = true
    )
  );

CREATE POLICY "Admin voice sessions access" ON voice_session_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE admin_roles.user_id = auth.uid() 
      AND admin_roles.is_active = true
    )
  );

CREATE POLICY "Admin roles self access" ON admin_roles
  FOR SELECT USING (user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM admin_roles ar 
      WHERE ar.user_id = auth.uid() 
      AND ar.is_active = true
    )
  );

-- Insert sample data for testing
INSERT INTO user_xp (user_id, xp_amount, xp_source, feature_name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 150, 'feature_usage', 'agent-gifty', 'Completed AI gift recommendation'),
  ('00000000-0000-0000-0000-000000000002', 200, 'badge_unlock', 'cultural-ambassador', 'Unlocked Cultural Ambassador badge'),
  ('00000000-0000-0000-0000-000000000003', 100, 'daily_bonus', 'login', 'Daily login bonus'),
  ('00000000-0000-0000-0000-000000000001', 300, 'feature_usage', 'bondcraft', 'Completed BondCraft session'),
  ('00000000-0000-0000-0000-000000000004', 250, 'feature_usage', 'lumience', 'Used LUMIENCE emotional analysis')
ON CONFLICT DO NOTHING;

INSERT INTO feature_usage_logs (user_id, feature_name, feature_category, usage_duration_seconds, success_status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'agent-gifty', 'ai-recommendations', 180, true),
  ('00000000-0000-0000-0000-000000000002', 'bondcraft', 'relationship-tools', 720, true),
  ('00000000-0000-0000-0000-000000000003', 'lumience', 'emotional-intelligence', 300, true),
  ('00000000-0000-0000-0000-000000000001', 'ghost-hunt', 'gamification', 450, true),
  ('00000000-0000-0000-0000-000000000004', 'serendipity', 'discovery', 240, true)
ON CONFLICT DO NOTHING;

INSERT INTO gift_click_logs (user_id, gift_category, gift_subcategory, recipient_persona_type, interaction_type) VALUES
  ('00000000-0000-0000-0000-000000000001', 'technology', 'smart-home', 'tech-enthusiast', 'click'),
  ('00000000-0000-0000-0000-000000000002', 'wellness', 'mindfulness', 'wellness-seeker', 'save'),
  ('00000000-0000-0000-0000-000000000003', 'experiences', 'adventure', 'adventurer', 'share'),
  ('00000000-0000-0000-0000-000000000001', 'books', 'fiction', 'bookworm', 'click'),
  ('00000000-0000-0000-0000-000000000004', 'art', 'handmade', 'creative-soul', 'purchase')
ON CONFLICT DO NOTHING;

INSERT INTO emotional_tag_logs (user_id, emotion_category, emotion_intensity, trigger_feature) VALUES
  ('00000000-0000-0000-0000-000000000001', 'joy', 4.2, 'agent-gifty'),
  ('00000000-0000-0000-0000-000000000002', 'gratitude', 4.8, 'bondcraft'),
  ('00000000-0000-0000-0000-000000000003', 'excitement', 3.9, 'ghost-hunt'),
  ('00000000-0000-0000-0000-000000000001', 'satisfaction', 4.5, 'lumience'),
  ('00000000-0000-0000-0000-000000000004', 'curiosity', 3.7, 'serendipity')
ON CONFLICT DO NOTHING;

INSERT INTO voice_session_logs (user_id, voice_name, session_duration_seconds, interaction_count, session_type) VALUES
  ('00000000-0000-0000-0000-000000000001', 'avelyn', 180, 5, 'standard'),
  ('00000000-0000-0000-0000-000000000002', 'galen', 240, 3, 'admin'),
  ('00000000-0000-0000-0000-000000000003', 'sage', 320, 7, 'standard'),
  ('00000000-0000-0000-0000-000000000001', 'echo', 150, 4, 'support'),
  ('00000000-0000-0000-0000-000000000004', 'avelyn', 200, 6, 'standard')
ON CONFLICT DO NOTHING;
