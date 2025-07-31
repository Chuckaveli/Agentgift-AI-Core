-- Command Deck AI Bot Management Schema
-- Tracks AI bot interactions, status, and performance

-- Bot registry table for tracking all available bots
CREATE TABLE IF NOT EXISTS ai_bots_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_name TEXT UNIQUE NOT NULL,
  bot_display_name TEXT NOT NULL,
  bot_description TEXT,
  bot_icon TEXT DEFAULT '🤖',
  bot_category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  last_health_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  health_status TEXT DEFAULT 'idle' CHECK (health_status IN ('active', 'idle', 'error', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assistant interaction logs for tracking all bot commands and responses
CREATE TABLE IF NOT EXISTS assistant_interaction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('summon', 'pause', 'reset', 'status_check', 'command', 'error')),
  command_input TEXT,
  bot_response TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'timeout')),
  error_message TEXT,
  execution_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bot performance metrics for monitoring health and usage
CREATE TABLE IF NOT EXISTS bot_performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_name TEXT NOT NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  total_commands INTEGER DEFAULT 0,
  successful_commands INTEGER DEFAULT 0,
  failed_commands INTEGER DEFAULT 0,
  average_response_time_ms INTEGER DEFAULT 0,
  uptime_percentage DECIMAL(5,2) DEFAULT 100.00,
  last_error_message TEXT,
  last_error_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bot_name, metric_date)
);

-- Command history for tracking recent admin commands
CREATE TABLE IF NOT EXISTS command_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  command_text TEXT NOT NULL,
  bot_target TEXT,
  action_taken TEXT,
  command_result TEXT,
  voice_input BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bot alerts for tracking failures and issues
CREATE TABLE IF NOT EXISTS bot_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_name TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('failure', 'performance', 'timeout', 'maintenance')),
  alert_message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_bots_registry_name ON ai_bots_registry(bot_name);
CREATE INDEX IF NOT EXISTS idx_ai_bots_registry_status ON ai_bots_registry(health_status);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_user_session ON assistant_interaction_logs(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_bot_created ON assistant_interaction_logs(bot_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_status ON assistant_interaction_logs(status);
CREATE INDEX IF NOT EXISTS idx_bot_metrics_name_date ON bot_performance_metrics(bot_name, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_command_history_user_created ON command_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_alerts_unresolved ON bot_alerts(is_resolved, created_at DESC);

-- Row Level Security
ALTER TABLE ai_bots_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_alerts ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admin bots registry access" ON ai_bots_registry
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin interaction logs access" ON assistant_interaction_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin bot metrics access" ON bot_performance_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin command history access" ON command_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin bot alerts access" ON bot_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

-- Insert default bots into registry
INSERT INTO ai_bots_registry (bot_name, bot_display_name, bot_description, bot_icon, bot_category) VALUES
('ag-tokenomics-v3', 'AG Tokenomics v3 Bot', 'Manages XP, badges, and token economy systems', '🧮', 'economy'),
('emotional-signature-engine', 'Emotional Signature Engine Bot', 'Analyzes and processes emotional intelligence data', '🧠', 'intelligence'),
('gift-intel-blog-generator', 'Gift Intel Blog Generator Bot', 'Creates content and blog posts about gifting trends', '📢', 'content'),
('social-media-manager', 'Social Media Manager Bot', 'Handles social media posting and engagement', '📅', 'marketing'),
('giftverse-game-engine', 'Giftverse Game Engine Bot', 'Powers gamification and interactive experiences', '🎁', 'gaming'),
('silent-intent-detection', 'Silent Intent Detection Bot', 'Analyzes user behavior and predicts intentions', '🕵️‍♂️', 'intelligence'),
('voice-assistant-engine', 'Voice Assistant Engine Bot', 'Manages voice interactions and TTS/STT processing', '💬', 'interface'),
('referral-system', 'Referral System Bot', 'Handles user referrals and reward distribution', '👥', 'growth')
ON CONFLICT (bot_name) DO UPDATE SET
  bot_display_name = EXCLUDED.bot_display_name,
  bot_description = EXCLUDED.bot_description,
  bot_icon = EXCLUDED.bot_icon,
  bot_category = EXCLUDED.bot_category,
  updated_at = NOW();

-- Function to update bot health status
CREATE OR REPLACE FUNCTION update_bot_health_status(
  p_bot_name TEXT,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE ai_bots_registry 
  SET 
    health_status = p_status,
    last_health_check = NOW(),
    updated_at = NOW()
  WHERE bot_name = p_bot_name;
  
  -- Log performance metrics
  INSERT INTO bot_performance_metrics (bot_name, metric_date, last_error_message, last_error_timestamp)
  VALUES (p_bot_name, CURRENT_DATE, p_error_message, CASE WHEN p_error_message IS NOT NULL THEN NOW() ELSE NULL END)
  ON CONFLICT (bot_name, metric_date) 
  DO UPDATE SET
    last_error_message = COALESCE(EXCLUDED.last_error_message, bot_performance_metrics.last_error_message),
    last_error_timestamp = COALESCE(EXCLUDED.last_error_timestamp, bot_performance_metrics.last_error_timestamp),
    updated_at = NOW();
    
  -- Create alert if error
  IF p_status = 'error' AND p_error_message IS NOT NULL THEN
    INSERT INTO bot_alerts (bot_name, alert_type, alert_message, severity)
    VALUES (p_bot_name, 'failure', p_error_message, 'high');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check for repeated failures
CREATE OR REPLACE FUNCTION check_bot_failure_alerts()
RETURNS TABLE(bot_name TEXT, failure_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ail.bot_name,
    COUNT(*) as failure_count
  FROM assistant_interaction_logs ail
  WHERE 
    ail.status = 'failed' 
    AND ail.created_at >= NOW() - INTERVAL '24 hours'
  GROUP BY ail.bot_name
  HAVING COUNT(*) >= 3;
END;
$$ LANGUAGE plpgsql;
