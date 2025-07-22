-- Serendipity Circuit tables for "No One Knows I Needed This™" feature

-- Main serendipity sessions table
CREATE TABLE IF NOT EXISTS serendipity_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  occasion_type TEXT NOT NULL,
  emotional_state TEXT NOT NULL,
  recent_life_event TEXT,
  gift_frequency TEXT,
  preferred_format TEXT DEFAULT 'text',
  
  -- Generated content
  gift_name TEXT NOT NULL,
  gift_reasoning TEXT NOT NULL,
  emotional_benefit TEXT NOT NULL,
  gift_url TEXT,
  price TEXT,
  category TEXT,
  confidence_score INTEGER DEFAULT 85,
  affirmations JSONB,
  
  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Echo gifts for Premium users
CREATE TABLE IF NOT EXISTS serendipity_echo_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_revelation_id UUID REFERENCES serendipity_sessions(id) ON DELETE CASCADE NOT NULL,
  echo_gifts JSONB NOT NULL, -- Array of echo gift suggestions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift vault for saving revelations
CREATE TABLE IF NOT EXISTS gift_vault (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gift_name TEXT NOT NULL,
  gift_reasoning TEXT,
  emotional_benefit TEXT,
  gift_url TEXT,
  source TEXT NOT NULL, -- 'serendipity', 'gut_check', 'manual'
  source_id UUID, -- Reference to source record
  tags TEXT[],
  notes TEXT,
  is_purchased BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift sharing tracking
CREATE TABLE IF NOT EXISTS gift_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gift_name TEXT NOT NULL,
  share_type TEXT NOT NULL, -- 'serendipity', 'gut_check', 'manual'
  source_id UUID,
  recipient_email TEXT,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift rituals and scheduling
CREATE TABLE IF NOT EXISTS gift_rituals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gift_name TEXT NOT NULL,
  ritual_type TEXT NOT NULL, -- 'serendipity_followup', 'occasion_reminder'
  scheduled_for TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges system
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, badge_name)
);

-- Add serendipity usage tracking to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS serendipity_used_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_serendipity_reset DATE DEFAULT CURRENT_DATE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_serendipity_sessions_user_id ON serendipity_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_serendipity_sessions_created_at ON serendipity_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_gift_vault_user_id ON gift_vault(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_vault_source ON gift_vault(source, source_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_rituals_user_scheduled ON gift_rituals(user_id, scheduled_for);

-- Row Level Security (RLS)
ALTER TABLE serendipity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE serendipity_echo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own serendipity sessions" ON serendipity_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own serendipity sessions" ON serendipity_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own echo sessions" ON serendipity_echo_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own echo sessions" ON serendipity_echo_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own gift vault" ON gift_vault
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own gift shares" ON gift_shares
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create gift shares" ON gift_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own rituals" ON gift_rituals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can award badges" ON user_badges
  FOR INSERT WITH CHECK (true);

-- Function to reset daily serendipity usage
CREATE OR REPLACE FUNCTION reset_daily_serendipity_usage()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles 
  SET serendipity_used_today = 0,
      last_serendipity_reset = CURRENT_DATE
  WHERE last_serendipity_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically reset daily usage
CREATE OR REPLACE FUNCTION check_serendipity_reset()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_serendipity_reset < CURRENT_DATE THEN
    NEW.serendipity_used_today = 0;
    NEW.last_serendipity_reset = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER serendipity_daily_reset_trigger
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_serendipity_reset();

-- Sample serendipity badges
INSERT INTO user_badges (user_id, badge_name, badge_description, badge_icon, rarity) VALUES
-- These will be awarded dynamically, this is just for reference
('00000000-0000-0000-0000-000000000000', 'Soul-Gifter', 'Shared emotional gifts with others', '💝', 'rare'),
('00000000-0000-0000-0000-000000000000', 'Serendipity Seeker', 'Completed first emotional revelation', '✨', 'common'),
('00000000-0000-0000-0000-000000000000', 'Echo Explorer', 'Discovered theme-linked gifts', '🔄', 'epic'),
('00000000-0000-0000-0000-000000000000', 'Vault Keeper', 'Saved 10 gifts to vault', '🏛️', 'rare'),
('00000000-0000-0000-0000-000000000000', 'Ritual Master', 'Used gifts in 5 rituals', '📅', 'legendary')
ON CONFLICT (user_id, badge_name) DO NOTHING;
