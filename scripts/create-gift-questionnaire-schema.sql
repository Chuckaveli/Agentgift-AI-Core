-- Create gift questionnaire sessions table
CREATE TABLE IF NOT EXISTS gift_questionnaire_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  birthday DATE,
  love_language TEXT NOT NULL,
  interests TEXT[] NOT NULL,
  hobbies TEXT,
  suggestions JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  credits INTEGER DEFAULT 0,
  subscription_id TEXT,
  subscription_status TEXT,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create XP logs table for gamification
CREATE TABLE IF NOT EXISTS xp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  xp_earned INTEGER NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gift_sessions_user_id ON gift_questionnaire_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_sessions_session_id ON gift_questionnaire_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_gift_sessions_completed_at ON gift_questionnaire_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_id ON xp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_created_at ON xp_logs(created_at);

-- Enable Row Level Security
ALTER TABLE gift_questionnaire_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gift_questionnaire_sessions
CREATE POLICY "Users can view their own questionnaire sessions" ON gift_questionnaire_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaire sessions" ON gift_questionnaire_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own questionnaire sessions" ON gift_questionnaire_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for xp_logs
CREATE POLICY "Users can view their own XP logs" ON xp_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert XP logs" ON xp_logs
  FOR INSERT WITH CHECK (true);

-- Function to calculate user level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  -- Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
  RETURN FLOOR(SQRT(xp / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update user level when XP changes
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    level = calculate_level(NEW.xp),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update level when XP changes
CREATE TRIGGER trigger_update_user_level
  AFTER UPDATE OF xp ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

-- Function to add XP and log it
CREATE OR REPLACE FUNCTION add_user_xp(
  p_user_id UUID,
  p_action TEXT,
  p_xp_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_xp INTEGER;
  new_xp INTEGER;
BEGIN
  -- Get current XP
  SELECT xp INTO current_xp FROM user_profiles WHERE id = p_user_id;
  
  IF current_xp IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate new XP
  new_xp := current_xp + p_xp_amount;
  
  -- Update user XP
  UPDATE user_profiles 
  SET xp = new_xp, updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the XP gain
  INSERT INTO xp_logs (user_id, action, xp_earned, description, metadata)
  VALUES (p_user_id, p_action, p_xp_amount, p_description, p_metadata);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing (optional)
-- This will be removed in production
INSERT INTO gift_questionnaire_sessions (session_id, recipient_name, relationship, love_language, interests, suggestions) VALUES
('sample_session_1', 'Sarah', 'Best Friend', 'Quality Time', ARRAY['Books & Reading', 'Cooking & Baking'], '[{"name": "Cookbook Collection", "description": "Curated cookbooks for inspiration", "price": "$25-50", "category": "Books", "confidence": 90, "reasoning": "Perfect for someone who loves quality time and cooking together"}]'::jsonb)
ON CONFLICT (session_id) DO NOTHING;
