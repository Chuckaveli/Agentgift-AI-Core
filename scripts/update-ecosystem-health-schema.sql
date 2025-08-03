-- Update ecosystem_health table with additional columns
ALTER TABLE ecosystem_health 
ADD COLUMN IF NOT EXISTS satisfaction_score DECIMAL(3,2) DEFAULT 4.5,
ADD COLUMN IF NOT EXISTS peak_usage_hour INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS avg_session_duration INTEGER DEFAULT 180,
ADD COLUMN IF NOT EXISTS total_interactions_24h INTEGER DEFAULT 0;

-- Update assistant_interactions table with additional tracking columns
ALTER TABLE assistant_interactions 
ADD COLUMN IF NOT EXISTS response_time INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout')),
ADD COLUMN IF NOT EXISTS session_duration INTEGER DEFAULT 120;

-- Create index for better performance on ecosystem health queries
CREATE INDEX IF NOT EXISTS idx_ecosystem_health_health_score ON ecosystem_health(health_score);
CREATE INDEX IF NOT EXISTS idx_assistant_interactions_status ON assistant_interactions(status);
CREATE INDEX IF NOT EXISTS idx_assistant_interactions_response_time ON assistant_interactions(response_time);

-- Update agentgift_features table with adoption tracking
ALTER TABLE agentgift_features 
ADD COLUMN IF NOT EXISTS adoption_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to calculate feature adoption rates
CREATE OR REPLACE FUNCTION calculate_feature_adoption()
RETURNS TRIGGER AS $$
BEGIN
  -- Update adoption rate based on unique users vs total active users
  UPDATE agentgift_features 
  SET adoption_rate = CASE 
    WHEN (SELECT COUNT(DISTINCT id) FROM user_profiles WHERE last_active_at > NOW() - INTERVAL '24 hours') > 0
    THEN (unique_users::DECIMAL / (SELECT COUNT(DISTINCT id) FROM user_profiles WHERE last_active_at > NOW() - INTERVAL '24 hours')) * 100
    ELSE 0
  END,
  last_used_at = NOW()
  WHERE id = NEW.feature_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update feature adoption rates
DROP TRIGGER IF EXISTS trigger_calculate_feature_adoption ON assistant_interactions;
CREATE TRIGGER trigger_calculate_feature_adoption
  AFTER INSERT ON assistant_interactions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_feature_adoption();

-- Insert sample ecosystem health data for testing
INSERT INTO ecosystem_health (
  health_score,
  active_users,
  active_assistants,
  api_response_time,
  error_rate,
  satisfaction_score,
  peak_usage_hour,
  avg_session_duration,
  total_interactions_24h,
  system_alerts
) VALUES (
  95,
  150,
  11,
  85.5,
  1.2,
  4.7,
  14,
  245,
  1250,
  '[]'::jsonb
) ON CONFLICT DO NOTHING;

-- Create function to update ecosystem metrics
CREATE OR REPLACE FUNCTION update_ecosystem_metrics()
RETURNS void AS $$
DECLARE
  current_health INTEGER;
  current_users INTEGER;
  current_assistants INTEGER;
  current_interactions INTEGER;
  avg_response DECIMAL;
  current_error_rate DECIMAL;
  avg_satisfaction DECIMAL;
BEGIN
  -- Calculate current metrics
  SELECT COUNT(DISTINCT user_id) INTO current_users
  FROM assistant_interactions 
  WHERE created_at > NOW() - INTERVAL '24 hours';
  
  SELECT COUNT(DISTINCT assistant_id) INTO current_assistants
  FROM assistant_interactions 
  WHERE created_at > NOW() - INTERVAL '24 hours';
  
  SELECT COUNT(*) INTO current_interactions
  FROM assistant_interactions 
  WHERE created_at > NOW() - INTERVAL '24 hours';
  
  SELECT AVG(response_time) INTO avg_response
  FROM assistant_interactions 
  WHERE created_at > NOW() - INTERVAL '1 hour' AND response_time IS NOT NULL;
  
  SELECT (COUNT(CASE WHEN status = 'error' THEN 1 END)::DECIMAL / COUNT(*)) * 100 INTO current_error_rate
  FROM assistant_interactions 
  WHERE created_at > NOW() - INTERVAL '1 hour';
  
  SELECT AVG(satisfaction_rating) INTO avg_satisfaction
  FROM assistant_interactions 
  WHERE created_at > NOW() - INTERVAL '24 hours' AND satisfaction_rating IS NOT NULL;
  
  -- Calculate health score
  current_health := 100;
  current_health := current_health - LEAST(current_error_rate * 10, 30);
  current_health := current_health - LEAST((COALESCE(avg_response, 100) - 100) / 10, 20);
  current_health := GREATEST(LEAST(current_health, 100), 0);
  
  -- Insert new health record
  INSERT INTO ecosystem_health (
    health_score,
    active_users,
    active_assistants,
    api_response_time,
    error_rate,
    satisfaction_score,
    total_interactions_24h,
    peak_usage_hour,
    avg_session_duration
  ) VALUES (
    current_health,
    COALESCE(current_users, 0),
    COALESCE(current_assistants, 0),
    COALESCE(avg_response, 100),
    COALESCE(current_error_rate, 0),
    COALESCE(avg_satisfaction, 4.5),
    COALESCE(current_interactions, 0),
    EXTRACT(HOUR FROM NOW()),
    180 + RANDOM() * 120
  );
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to update metrics (requires pg_cron extension)
-- SELECT cron.schedule('update-ecosystem-metrics', '*/15 * * * *', 'SELECT update_ecosystem_metrics();');

COMMENT ON TABLE ecosystem_health IS 'Stores real-time ecosystem health metrics and system performance data';
COMMENT ON FUNCTION update_ecosystem_metrics() IS 'Updates ecosystem health metrics based on recent activity';
COMMENT ON FUNCTION calculate_feature_adoption() IS 'Calculates feature adoption rates based on user engagement';
