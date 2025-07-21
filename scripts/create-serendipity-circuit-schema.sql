-- Create serendipity_sessions table
CREATE TABLE IF NOT EXISTS serendipity_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  occasion_type TEXT NOT NULL,
  emotional_state TEXT NOT NULL,
  recent_life_event TEXT,
  gift_frequency TEXT NOT NULL,
  preferred_format TEXT NOT NULL DEFAULT 'Text Reveal',
  affirmations JSONB NOT NULL DEFAULT '[]',
  gift_suggestion JSONB,
  xp_earned INTEGER DEFAULT 0,
  is_saved BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_vault table for saved items
CREATE TABLE IF NOT EXISTS user_vault (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_data JSONB NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table for badge tracking
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context TEXT,
  UNIQUE(user_id, badge_id)
);

-- Create xp_logs table for XP tracking
CREATE TABLE IF NOT EXISTS xp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  feature TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create badges reference table
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  xp_reward INTEGER DEFAULT 0
);

-- Insert Soul-Gifter badge
INSERT INTO badges (id, name, description, icon, rarity, xp_reward) 
VALUES (
  'soul_gifter',
  'Soul-Gifter',
  'Shared a serendipity reveal with others',
  '✨',
  'rare',
  10
) ON CONFLICT (id) DO NOTHING;

-- Insert Serendipity Explorer badge
INSERT INTO badges (id, name, description, icon, rarity, xp_reward) 
VALUES (
  'serendipity_explorer',
  'Serendipity Explorer',
  'Completed first serendipity circuit journey',
  '🔮',
  'common',
  5
) ON CONFLICT (id) DO NOTHING;

-- Insert Vault Keeper badge
INSERT INTO badges (id, name, description, icon, rarity, xp_reward) 
VALUES (
  'vault_keeper',
  'Vault Keeper',
  'Saved 5 items to personal vault',
  '🗝️',
  'uncommon',
  15
) ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_serendipity_sessions_user_id ON serendipity_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_serendipity_sessions_created_at ON serendipity_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_vault_user_id ON user_vault(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_id ON xp_logs(user_id);

-- Enable Row Level Security
ALTER TABLE serendipity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own serendipity sessions" ON serendipity_sessions
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can create their own serendipity sessions" ON serendipity_sessions
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own serendipity sessions" ON serendipity_sessions
  FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view their own vault items" ON user_vault
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can create their own vault items" ON user_vault
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view their own badges" ON user_badges
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view their own XP logs" ON xp_logs
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for serendipity_sessions
CREATE TRIGGER update_serendipity_sessions_updated_at 
  BEFORE UPDATE ON serendipity_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create sample affirmation templates (for reference)
COMMENT ON TABLE serendipity_sessions IS 'Stores user serendipity circuit sessions with emotional calibration and gift suggestions';
COMMENT ON COLUMN serendipity_sessions.affirmations IS 'Array of 3 personalized affirmations based on emotional state';
COMMENT ON COLUMN serendipity_sessions.gift_suggestion IS 'AI-generated gift suggestion with reasoning and emotional benefits';
COMMENT ON COLUMN serendipity_sessions.xp_earned IS 'Total XP earned from this session (base 5 + bonuses)';
