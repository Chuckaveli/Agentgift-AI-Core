-- Add triggers and functions for demo bridge system

-- Function to update user level based on XP
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate new level based on lifetime XP
  NEW.level = CASE 
    WHEN NEW.lifetime_xp >= 25000 THEN 10
    WHEN NEW.lifetime_xp >= 15000 THEN 9
    WHEN NEW.lifetime_xp >= 8000 THEN 8
    WHEN NEW.lifetime_xp >= 4000 THEN 7
    WHEN NEW.lifetime_xp >= 2000 THEN 6
    WHEN NEW.lifetime_xp >= 1000 THEN 5
    WHEN NEW.lifetime_xp >= 500 THEN 4
    WHEN NEW.lifetime_xp >= 250 THEN 3
    WHEN NEW.lifetime_xp >= 100 THEN 2
    ELSE 1
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update level when XP changes
DROP TRIGGER IF EXISTS trigger_update_user_level ON user_profiles;
CREATE TRIGGER trigger_update_user_level
  BEFORE UPDATE OF lifetime_xp ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

-- Function to add XP transaction and update profile
CREATE OR REPLACE FUNCTION add_user_xp(
  p_user_id UUID,
  p_reason TEXT,
  p_amount INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  old_level INTEGER;
  new_level INTEGER;
BEGIN
  -- Get current level
  SELECT level INTO old_level 
  FROM user_profiles 
  WHERE user_id = p_user_id;
  
  -- Insert XP transaction
  INSERT INTO xp_transactions (user_id, reason, amount)
  VALUES (p_user_id, p_reason, p_amount);
  
  -- Update user profile XP
  UPDATE user_profiles 
  SET 
    current_xp = current_xp + p_amount,
    lifetime_xp = lifetime_xp + p_amount,
    last_active_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Get new level after update
  SELECT level INTO new_level 
  FROM user_profiles 
  WHERE user_id = p_user_id;
  
  -- If level increased, add level up bonus
  IF new_level > old_level THEN
    INSERT INTO xp_transactions (user_id, reason, amount)
    VALUES (p_user_id, 'Level up bonus - Level ' || new_level, 50);
    
    UPDATE user_profiles 
    SET 
      current_xp = current_xp + 50,
      lifetime_xp = lifetime_xp + 50
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to check feature usage limits
CREATE OR REPLACE FUNCTION check_feature_limit(
  p_user_id UUID,
  p_feature TEXT,
  p_period INTERVAL DEFAULT '1 month'
)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier TEXT;
  usage_count INTEGER;
  tier_limit INTEGER;
BEGIN
  -- Get user tier
  SELECT tier[1] INTO user_tier 
  FROM user_profiles 
  WHERE user_id = p_user_id;
  
  -- Count recent usage
  SELECT COUNT(*) INTO usage_count
  FROM feature_usage_logs
  WHERE user_id = p_user_id 
    AND feature_name = p_feature
    AND created_at > NOW() - p_period;
  
  -- Check limits based on tier and feature
  tier_limit := CASE 
    WHEN user_tier = 'FREE' AND p_feature = 'smart-search' THEN 10
    WHEN user_tier = 'PRO' AND p_feature = 'smart-search' THEN 100
    WHEN user_tier = 'PRO+' AND p_feature = 'smart-search' THEN 500
    WHEN user_tier = 'ENTERPRISE' THEN -1 -- unlimited
    WHEN user_tier = 'PRO' AND p_feature = 'voice-interactions' THEN 20
    WHEN user_tier = 'PRO+' AND p_feature = 'voice-interactions' THEN 100
    ELSE -1 -- unlimited for other cases
  END;
  
  -- Return true if under limit or unlimited
  RETURN tier_limit = -1 OR usage_count < tier_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to log feature usage
CREATE OR REPLACE FUNCTION log_feature_usage(
  p_user_id UUID,
  p_feature TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO feature_usage_logs (user_id, feature_name, metadata)
  VALUES (p_user_id, p_feature, p_metadata);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create feature usage logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS feature_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_feature_usage_logs_user_feature_date 
ON feature_usage_logs(user_id, feature_name, created_at);

-- RLS for feature usage logs
ALTER TABLE feature_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own feature usage" ON feature_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Service role can manage feature usage" ON feature_usage_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
