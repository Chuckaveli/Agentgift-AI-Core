-- Giftverse Economy Architect Schema
-- Voice-enabled reward economy management system

-- Reward settings configuration table
CREATE TABLE IF NOT EXISTS reward_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  base_xp_reward INTEGER DEFAULT 0,
  base_credit_cost INTEGER DEFAULT 0,
  multiplier DECIMAL(4,2) DEFAULT 1.0,
  cooldown_minutes INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT NULL,
  tier_requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Economy adjustment logs for audit trail
CREATE TABLE IF NOT EXISTS reward_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('xp_adjustment', 'credit_adjustment', 'badge_assignment', 'rule_change', 'simulation', 'cooldown', 'bonus')),
  feature_id TEXT,
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  impact_prediction JSONB,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_session_id TEXT,
  voice_command TEXT,
  ai_recommendation BOOLEAN DEFAULT false
);

-- Economy simulation results
CREATE TABLE IF NOT EXISTS economy_simulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_name TEXT NOT NULL,
  proposed_changes JSONB NOT NULL,
  predicted_outcomes JSONB NOT NULL,
  confidence_score DECIMAL(4,3),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badge forecast tracking
CREATE TABLE IF NOT EXISTS badge_forecasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  predicted_unlocks INTEGER NOT NULL,
  confidence_level DECIMAL(4,3),
  forecast_period TEXT DEFAULT '7_days',
  factors JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Economy health metrics
CREATE TABLE IF NOT EXISTS economy_health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_date DATE NOT NULL,
  total_xp_earned BIGINT DEFAULT 0,
  total_xp_spent BIGINT DEFAULT 0,
  total_credits_earned BIGINT DEFAULT 0,
  total_credits_spent BIGINT DEFAULT 0,
  badges_unlocked INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  economy_balance_score DECIMAL(5,2),
  inflation_risk DECIMAL(4,3),
  engagement_score DECIMAL(4,3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice interaction logs for economy architect
CREATE TABLE IF NOT EXISTS economy_voice_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  voice_input TEXT,
  ai_response TEXT,
  action_taken TEXT,
  voice_assistant TEXT DEFAULT 'avelyn',
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Economy architect settings
CREATE TABLE IF NOT EXISTS economy_architect_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_enabled BOOLEAN DEFAULT true,
  selected_voice TEXT DEFAULT 'avelyn' CHECK (selected_voice IN ('avelyn', 'galen')),
  auto_simulation BOOLEAN DEFAULT true,
  risk_tolerance TEXT DEFAULT 'medium' CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  notification_threshold DECIMAL(4,3) DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default reward settings for existing features
INSERT INTO reward_settings (feature_id, feature_name, base_xp_reward, base_credit_cost) VALUES
('agent_gifty', 'Agent Gifty', 10, 1),
('bondcraft', 'BondCraft', 25, 3),
('lumience', 'LUMIENCE Mood Mirror', 15, 2),
('ghost_hunt', 'Ghost Hunt', 20, 2),
('thought_heist', 'Thought Heist', 30, 4),
('serendipity', 'Serendipity Engine', 12, 1),
('cultural_intelligence', 'Cultural Intelligence', 18, 2),
('emotitokens', 'EmotiTokens', 8, 1),
('agentvault', 'AgentVault', 35, 5),
('giftbridge', 'GiftBridge', 22, 3)
ON CONFLICT (feature_id) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reward_settings_feature ON reward_settings(feature_id);
CREATE INDEX IF NOT EXISTS idx_reward_logs_admin_date ON reward_logs(admin_id, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_logs_feature ON reward_logs(feature_id);
CREATE INDEX IF NOT EXISTS idx_economy_simulations_admin ON economy_simulations(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_badge_forecasts_date ON badge_forecasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_economy_health_date ON economy_health_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_voice_logs_session ON economy_voice_logs(admin_id, session_id);

-- Row Level Security
ALTER TABLE reward_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_voice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_architect_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admin reward settings access" ON reward_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin reward logs access" ON reward_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin economy simulations access" ON economy_simulations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin badge forecasts access" ON badge_forecasts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin economy health access" ON economy_health_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin voice logs access" ON economy_voice_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin architect settings access" ON economy_architect_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

-- Function to calculate economy balance score
CREATE OR REPLACE FUNCTION calculate_economy_balance()
RETURNS DECIMAL(5,2) AS $$
DECLARE
  xp_ratio DECIMAL(5,2);
  credit_ratio DECIMAL(5,2);
  balance_score DECIMAL(5,2);
BEGIN
  -- Get XP earned vs spent ratio
  SELECT 
    CASE 
      WHEN SUM(total_xp_spent) = 0 THEN 1.0
      ELSE SUM(total_xp_earned)::DECIMAL / NULLIF(SUM(total_xp_spent), 0)
    END INTO xp_ratio
  FROM economy_health_metrics 
  WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days';
  
  -- Get credit earned vs spent ratio
  SELECT 
    CASE 
      WHEN SUM(total_credits_spent) = 0 THEN 1.0
      ELSE SUM(total_credits_earned)::DECIMAL / NULLIF(SUM(total_credits_spent), 0)
    END INTO credit_ratio
  FROM economy_health_metrics 
  WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days';
  
  -- Calculate balanced score (ideal ratio is around 1.2-1.5)
  balance_score := (
    CASE 
      WHEN xp_ratio BETWEEN 1.2 AND 1.5 THEN 100
      WHEN xp_ratio BETWEEN 1.0 AND 2.0 THEN 80
      ELSE 60
    END +
    CASE 
      WHEN credit_ratio BETWEEN 1.2 AND 1.5 THEN 100
      WHEN credit_ratio BETWEEN 1.0 AND 2.0 THEN 80
      ELSE 60
    END
  ) / 2.0;
  
  RETURN balance_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update economy health metrics daily
CREATE OR REPLACE FUNCTION update_daily_economy_metrics()
RETURNS void AS $$
BEGIN
  INSERT INTO economy_health_metrics (
    metric_date,
    total_xp_earned,
    total_xp_spent,
    total_credits_earned,
    total_credits_spent,
    badges_unlocked,
    active_users,
    economy_balance_score
  )
  SELECT 
    CURRENT_DATE,
    COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as xp_earned,
    COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as xp_spent,
    COALESCE((SELECT SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) FROM credit_logs WHERE DATE(created_at) = CURRENT_DATE), 0) as credits_earned,
    COALESCE((SELECT SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) FROM credit_logs WHERE DATE(created_at) = CURRENT_DATE), 0) as credits_spent,
    COALESCE((SELECT COUNT(*) FROM badge_unlocks WHERE DATE(unlocked_at) = CURRENT_DATE), 0) as badges_unlocked,
    COALESCE((SELECT COUNT(DISTINCT user_id) FROM xp_logs WHERE DATE(created_at) = CURRENT_DATE), 0) as active_users,
    calculate_economy_balance()
  FROM xp_logs 
  WHERE DATE(created_at) = CURRENT_DATE
  ON CONFLICT (metric_date) DO UPDATE SET
    total_xp_earned = EXCLUDED.total_xp_earned,
    total_xp_spent = EXCLUDED.total_xp_spent,
    total_credits_earned = EXCLUDED.total_credits_earned,
    total_credits_spent = EXCLUDED.total_credits_spent,
    badges_unlocked = EXCLUDED.badges_unlocked,
    active_users = EXCLUDED.active_users,
    economy_balance_score = EXCLUDED.economy_balance_score;
END;
$$ LANGUAGE plpgsql;
