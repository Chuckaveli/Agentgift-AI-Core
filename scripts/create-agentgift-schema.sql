-- AgentGift.ai Complete Database Schema

-- Users and Authentication
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tier VARCHAR(50) DEFAULT 'free_agent',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  credits INTEGER DEFAULT 100,
  prestige_level VARCHAR(20) NULL,
  badges TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies (B2B)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  tier VARCHAR(50) DEFAULT 'small_biz',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  credits INTEGER DEFAULT 500,
  prestige_level VARCHAR(20) NULL,
  badges TEXT[] DEFAULT '{}',
  logo_url TEXT,
  industry VARCHAR(100),
  employee_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Members
CREATE TABLE IF NOT EXISTS company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- XP Logs
CREATE TABLE IF NOT EXISTS xp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  feature_used VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company XP Logs
CREATE TABLE IF NOT EXISTS company_xp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  action_type VARCHAR(100),
  performed_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Logs
CREATE TABLE IF NOT EXISTS credit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  feature_used VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges System
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  type VARCHAR(50) NOT NULL, -- level, seasonal, prestige, action
  rarity VARCHAR(50) DEFAULT 'common', -- common, rare, epic, legendary
  requirements JSONB DEFAULT '{}',
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badge Unlocks
CREATE TABLE IF NOT EXISTS badge_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Prestige Logs
CREATE TABLE IF NOT EXISTS prestige_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  prestige_level VARCHAR(20) NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Gut Check Results
CREATE TABLE IF NOT EXISTS gut_check_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  gift_description TEXT,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Gifty Drops
CREATE TABLE IF NOT EXISTS gift_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_name VARCHAR(255) NOT NULL,
  gift_description TEXT NOT NULL,
  location TEXT NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  claimed_by UUID REFERENCES user_profiles(id),
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emotion Tags
CREATE TABLE IF NOT EXISTS emotion_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7), -- hex color
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift DNA Quiz Results
CREATE TABLE IF NOT EXISTS gift_dna_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  personality_type VARCHAR(100) NOT NULL,
  traits JSONB NOT NULL,
  recommendations TEXT[],
  quiz_answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Gift Sessions
CREATE TABLE IF NOT EXISTS group_gift_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2),
  current_amount DECIMAL(10,2) DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Gift Participants
CREATE TABLE IF NOT EXISTS group_gift_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES group_gift_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  contribution_amount DECIMAL(10,2) DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Gift Reveals
CREATE TABLE IF NOT EXISTS gift_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  gift_title VARCHAR(255) NOT NULL,
  gift_description TEXT,
  gift_image_url TEXT,
  price VARCHAR(50),
  category VARCHAR(100),
  tags TEXT[],
  rating DECIMAL(3,2),
  special_message TEXT,
  reveal_animation VARCHAR(50) DEFAULT 'fade',
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Actions (B2B Events)
CREATE TABLE IF NOT EXISTS company_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL, -- desk_drop, gift_chain, welcome_photo, etc.
  performed_by UUID REFERENCES user_profiles(id),
  details JSONB DEFAULT '{}',
  xp_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Chain Events (B2B)
CREATE TABLE IF NOT EXISTS gift_chain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  participant_count INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  started_by UUID REFERENCES user_profiles(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- External Service Integrations
CREATE TABLE IF NOT EXISTS external_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  service_name VARCHAR(100) NOT NULL, -- amazon, expedia, doordash, etc.
  api_key_encrypted TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature Usage Tracking
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_name)
);

-- Seasonal Triggers
CREATE TABLE IF NOT EXISTS seasonal_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  trigger_type VARCHAR(50) NOT NULL, -- holiday, season, event
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  notification_settings JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  theme_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level);
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_id ON xp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_created_at ON xp_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_companies_tier ON companies(tier);
CREATE INDEX IF NOT EXISTS idx_gift_drops_user_id ON gift_drops(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_drops_active ON gift_drops(is_active);
CREATE INDEX IF NOT EXISTS idx_group_gift_sessions_creator ON group_gift_sessions(creator_id);
CREATE INDEX IF NOT EXISTS idx_company_actions_company_id ON company_actions(company_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature ON feature_usage(user_id, feature_name);

-- Insert Default Badges
INSERT INTO badges (name, description, icon, type, rarity, xp_reward) VALUES
('First Steps', 'Welcome to AgentGift.ai! You''ve taken your first steps into the world of AI-powered gifting.', '🎯', 'level', 'common', 25),
('Getting Started', 'You''re getting the hang of this! Keep exploring our features.', '🚀', 'level', 'common', 50),
('Experienced', 'You''ve become quite the gifting expert! Your skills are showing.', '⭐', 'level', 'rare', 100),
('Expert', 'Wow! You''re a true gifting master. Others look up to your expertise.', '🏆', 'level', 'epic', 200),
('Master', 'Legendary status achieved! You''ve mastered the art of AI-powered gifting.', '👑', 'level', 'legendary', 500),
('Team Builder', 'Building stronger teams through thoughtful gifting.', '🤝', 'action', 'rare', 75),
('Culture Champion', 'Championing company culture through meaningful experiences.', '🎭', 'action', 'epic', 150),
('Gift Master', 'Master of corporate gifting and team experiences.', '🎁', 'action', 'legendary', 300)
ON CONFLICT (name) DO NOTHING;

-- Insert Default Emotion Tags
INSERT INTO emotion_tags (name, description, color, category) VALUES
('Joy', 'Gifts that bring happiness and delight', '#FFD700', 'positive'),
('Love', 'Gifts that express deep affection and care', '#FF69B4', 'positive'),
('Gratitude', 'Gifts that show appreciation and thankfulness', '#32CD32', 'positive'),
('Excitement', 'Gifts that create anticipation and thrill', '#FF4500', 'positive'),
('Comfort', 'Gifts that provide solace and peace', '#87CEEB', 'supportive'),
('Encouragement', 'Gifts that motivate and inspire', '#9370DB', 'supportive'),
('Celebration', 'Gifts for marking special occasions', '#FFB6C1', 'celebratory'),
('Achievement', 'Gifts that recognize accomplishments', '#DAA520', 'celebratory')
ON CONFLICT (name) DO NOTHING;

-- Insert Default Seasonal Triggers
INSERT INTO seasonal_triggers (name, description, start_date, end_date, trigger_type) VALUES
('Valentine''s Day', 'Love and romance themed gifting', '2024-02-01', '2024-02-14', 'holiday'),
('Mother''s Day', 'Celebrating mothers and maternal figures', '2024-05-01', '2024-05-12', 'holiday'),
('Father''s Day', 'Honoring fathers and paternal figures', '2024-06-01', '2024-06-16', 'holiday'),
('Christmas Season', 'Holiday gifting and celebration', '2024-12-01', '2024-12-25', 'holiday'),
('Spring Season', 'Fresh starts and renewal', '2024-03-20', '2024-06-20', 'season'),
('Summer Season', 'Fun, adventure, and relaxation', '2024-06-21', '2024-09-22', 'season'),
('Fall Season', 'Cozy, warm, and reflective', '2024-09-23', '2024-12-20', 'season'),
('Winter Season', 'Comfort, togetherness, and reflection', '2024-12-21', '2024-03-19', 'season')
ON CONFLICT (name) DO NOTHING;
