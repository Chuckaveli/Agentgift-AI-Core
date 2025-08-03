-- Create ecosystem_health table for system monitoring
CREATE TABLE IF NOT EXISTS ecosystem_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  health_score INTEGER NOT NULL DEFAULT 100,
  active_users INTEGER DEFAULT 0,
  active_assistants INTEGER DEFAULT 0,
  api_response_time DECIMAL(10,2) DEFAULT 0,
  error_rate DECIMAL(5,2) DEFAULT 0,
  system_alerts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ecosystem_health_created_at ON ecosystem_health(created_at);
CREATE INDEX IF NOT EXISTS idx_assistant_interactions_created_at ON assistant_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON user_profiles(tier);

-- Add missing columns to existing tables if they don't exist
ALTER TABLE assistant_interactions 
ADD COLUMN IF NOT EXISTS assistant_name TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS api_cost DECIMAL(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5);

ALTER TABLE agentgift_features 
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unique_users INTEGER DEFAULT 0;

-- Insert initial ecosystem health record
INSERT INTO ecosystem_health (health_score, active_users, active_assistants)
VALUES (98, 0, 11)
ON CONFLICT DO NOTHING;

-- Create function to update ecosystem health
CREATE OR REPLACE FUNCTION update_ecosystem_health()
RETURNS TRIGGER AS $$
BEGIN
  -- Update health metrics based on recent activity
  INSERT INTO ecosystem_health (
    health_score,
    active_users,
    active_assistants,
    api_response_time,
    error_rate
  )
  VALUES (
    CASE 
      WHEN (SELECT COUNT(*) FROM assistant_interactions WHERE created_at > NOW() - INTERVAL '1 hour') > 100 THEN 95
      WHEN (SELECT COUNT(*) FROM assistant_interactions WHERE created_at > NOW() - INTERVAL '1 hour') > 50 THEN 98
      ELSE 100
    END,
    (SELECT COUNT(DISTINCT user_id) FROM assistant_interactions WHERE created_at > NOW() - INTERVAL '24 hours'),
    (SELECT COUNT(DISTINCT assistant_id) FROM assistant_interactions WHERE created_at > NOW() - INTERVAL '24 hours'),
    RANDOM() * 200 + 50, -- Mock API response time
    RANDOM() * 2 -- Mock error rate
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update ecosystem health
DROP TRIGGER IF EXISTS trigger_update_ecosystem_health ON assistant_interactions;
CREATE TRIGGER trigger_update_ecosystem_health
  AFTER INSERT ON assistant_interactions
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_ecosystem_health();

-- Enable RLS
ALTER TABLE ecosystem_health ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin can view ecosystem health" ON ecosystem_health
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND (user_profiles.role = 'admin' OR user_profiles.email = 'admin@agentgift.ai')
    )
  );

CREATE POLICY "System can insert ecosystem health" ON ecosystem_health
  FOR INSERT WITH CHECK (true);
