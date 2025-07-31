-- Emotional Memory Vault Schema for AgentGift.ai
-- Comprehensive memory storage and recall system for admin analysis

-- Context Memory Vault - Core emotional and interaction memories
CREATE TABLE IF NOT EXISTS context_memory_vault (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  memory_type VARCHAR(50) NOT NULL CHECK (memory_type IN ('emotional', 'gifting', 'interaction', 'behavioral', 'preference')),
  emotional_context VARCHAR(100) NOT NULL,
  emotional_intensity DECIMAL(3,2) CHECK (emotional_intensity >= 0 AND emotional_intensity <= 5),
  tags TEXT[] DEFAULT '{}',
  source VARCHAR(100) NOT NULL, -- 'bondcraft', 'lumience', 'agent_gifty', etc.
  related_gift_id UUID,
  related_feature VARCHAR(100),
  memory_content TEXT NOT NULL,
  context_metadata JSONB DEFAULT '{}',
  sentiment_score DECIMAL(4,3) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  confidence_level DECIMAL(3,2) DEFAULT 0.8,
  is_significant BOOLEAN DEFAULT FALSE,
  is_anomaly BOOLEAN DEFAULT FALSE,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Assistant Interaction Logs (extending existing)
CREATE TABLE IF NOT EXISTS assistant_interaction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id VARCHAR(100),
  bot_name VARCHAR(100),
  action_type VARCHAR(50) NOT NULL,
  command_input TEXT,
  response_output TEXT,
  emotional_tone VARCHAR(50),
  success_rating INTEGER CHECK (success_rating >= 1 AND success_rating <= 5),
  user_satisfaction VARCHAR(20) CHECK (user_satisfaction IN ('very_low', 'low', 'neutral', 'high', 'very_high')),
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error', 'pending', 'timeout')),
  error_message TEXT,
  processing_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Feedback Logs - Captures user sentiment and reactions
CREATE TABLE IF NOT EXISTS user_feedback_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('gift_reaction', 'feature_rating', 'emotional_response', 'suggestion_feedback')),
  related_feature VARCHAR(100),
  related_gift_id UUID,
  sentiment VARCHAR(50) NOT NULL,
  sentiment_score DECIMAL(4,3) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  feedback_message TEXT,
  gift_tone VARCHAR(50),
  emotional_tags TEXT[] DEFAULT '{}',
  reaction_intensity INTEGER CHECK (reaction_intensity >= 1 AND reaction_intensity <= 10),
  context_data JSONB DEFAULT '{}',
  is_constructive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Click Logs - Enhanced with emotional context
CREATE TABLE IF NOT EXISTS gift_click_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  gift_id VARCHAR(100),
  gift_category VARCHAR(100),
  gift_subcategory VARCHAR(100),
  interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('view', 'click', 'save', 'share', 'purchase', 'reject')),
  emotional_context VARCHAR(100),
  mood_at_interaction VARCHAR(50),
  reaction_score INTEGER CHECK (reaction_score >= 1 AND reaction_score <= 10),
  time_spent_seconds INTEGER,
  source_feature VARCHAR(100),
  recipient_relationship VARCHAR(50),
  occasion_type VARCHAR(100),
  price_range VARCHAR(50),
  interaction_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory Search Queries - Track admin searches for analytics
CREATE TABLE IF NOT EXISTS memory_search_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  search_type VARCHAR(50) NOT NULL CHECK (search_type IN ('natural_language', 'filter', 'voice', 'semantic')),
  search_filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  search_duration_ms INTEGER,
  is_voice_query BOOLEAN DEFAULT FALSE,
  query_intent VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory Insights - Store generated insights and patterns
CREATE TABLE IF NOT EXISTS memory_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('pattern', 'anomaly', 'trend', 'correlation', 'prediction')),
  insight_title VARCHAR(200) NOT NULL,
  insight_description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  affected_users_count INTEGER DEFAULT 0,
  time_period_start TIMESTAMP WITH TIME ZONE,
  time_period_end TIMESTAMP WITH TIME ZONE,
  related_features TEXT[] DEFAULT '{}',
  emotional_themes TEXT[] DEFAULT '{}',
  insight_data JSONB DEFAULT '{}',
  is_actionable BOOLEAN DEFAULT FALSE,
  action_taken TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory Vault Sessions - Track admin memory exploration sessions
CREATE TABLE IF NOT EXISTS memory_vault_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_name VARCHAR(200),
  session_purpose TEXT,
  queries_count INTEGER DEFAULT 0,
  insights_generated INTEGER DEFAULT 0,
  session_duration_minutes INTEGER,
  key_findings TEXT[],
  export_generated BOOLEAN DEFAULT FALSE,
  session_metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for optimal search performance
CREATE INDEX IF NOT EXISTS idx_context_memory_vault_user_id ON context_memory_vault(user_id);
CREATE INDEX IF NOT EXISTS idx_context_memory_vault_emotional_context ON context_memory_vault(emotional_context);
CREATE INDEX IF NOT EXISTS idx_context_memory_vault_source ON context_memory_vault(source);
CREATE INDEX IF NOT EXISTS idx_context_memory_vault_logged_at ON context_memory_vault(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_context_memory_vault_tags ON context_memory_vault USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_context_memory_vault_significant ON context_memory_vault(is_significant, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_assistant_logs_user_created ON assistant_interaction_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_emotional_tone ON assistant_interaction_logs(emotional_tone);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_bot_name ON assistant_interaction_logs(bot_name);

CREATE INDEX IF NOT EXISTS idx_user_feedback_sentiment ON user_feedback_logs(sentiment);
CREATE INDEX IF NOT EXISTS idx_user_feedback_feature ON user_feedback_logs(related_feature);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created ON user_feedback_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gift_clicks_emotional_context ON gift_click_logs(emotional_context);
CREATE INDEX IF NOT EXISTS idx_gift_clicks_category ON gift_click_logs(gift_category);
CREATE INDEX IF NOT EXISTS idx_gift_clicks_created ON gift_click_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gift_clicks_reaction_score ON gift_click_logs(reaction_score);

CREATE INDEX IF NOT EXISTS idx_memory_search_admin ON memory_search_queries(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memory_insights_type ON memory_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_memory_vault_sessions_admin ON memory_vault_sessions(admin_id, started_at DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_context_memory_content_fts ON context_memory_vault USING GIN(to_tsvector('english', memory_content));
CREATE INDEX IF NOT EXISTS idx_feedback_message_fts ON user_feedback_logs USING GIN(to_tsvector('english', feedback_message));

-- Row Level Security
ALTER TABLE context_memory_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_click_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_vault_sessions ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admin memory vault access" ON context_memory_vault
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

CREATE POLICY "Admin feedback logs access" ON user_feedback_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin gift clicks access" ON gift_click_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin search queries access" ON memory_search_queries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin insights access" ON memory_insights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin sessions access" ON memory_vault_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

-- Functions for memory analysis
CREATE OR REPLACE FUNCTION search_emotional_memories(
  p_query TEXT,
  p_emotion_filter TEXT DEFAULT NULL,
  p_date_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_date_end TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_feature_filter TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  memory_id UUID,
  user_id UUID,
  emotional_context VARCHAR,
  memory_content TEXT,
  source VARCHAR,
  tags TEXT[],
  logged_at TIMESTAMP WITH TIME ZONE,
  relevance_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cmv.id,
    cmv.user_id,
    cmv.emotional_context,
    cmv.memory_content,
    cmv.source,
    cmv.tags,
    cmv.logged_at,
    ts_rank(to_tsvector('english', cmv.memory_content), plainto_tsquery('english', p_query)) as relevance_score
  FROM context_memory_vault cmv
  WHERE 
    (p_query IS NULL OR to_tsvector('english', cmv.memory_content) @@ plainto_tsquery('english', p_query))
    AND (p_emotion_filter IS NULL OR cmv.emotional_context ILIKE '%' || p_emotion_filter || '%')
    AND (p_date_start IS NULL OR cmv.logged_at >= p_date_start)
    AND (p_date_end IS NULL OR cmv.logged_at <= p_date_end)
    AND (p_feature_filter IS NULL OR cmv.source = p_feature_filter)
  ORDER BY relevance_score DESC, cmv.logged_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to detect emotional anomalies
CREATE OR REPLACE FUNCTION detect_emotional_anomalies(
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  anomaly_date DATE,
  emotional_context VARCHAR,
  user_count BIGINT,
  avg_intensity DECIMAL,
  anomaly_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_emotions AS (
    SELECT 
      DATE(logged_at) as log_date,
      emotional_context,
      COUNT(*) as daily_count,
      AVG(emotional_intensity) as avg_intensity
    FROM context_memory_vault
    WHERE logged_at >= NOW() - INTERVAL '1 day' * p_days_back
    GROUP BY DATE(logged_at), emotional_context
  ),
  emotion_stats AS (
    SELECT 
      emotional_context,
      AVG(daily_count) as avg_count,
      STDDEV(daily_count) as stddev_count,
      AVG(avg_intensity) as overall_avg_intensity
    FROM daily_emotions
    GROUP BY emotional_context
  )
  SELECT 
    de.log_date,
    de.emotional_context,
    de.daily_count,
    de.avg_intensity,
    CASE 
      WHEN es.stddev_count > 0 THEN 
        ABS(de.daily_count - es.avg_count) / es.stddev_count
      ELSE 0
    END as anomaly_score
  FROM daily_emotions de
  JOIN emotion_stats es ON de.emotional_context = es.emotional_context
  WHERE 
    CASE 
      WHEN es.stddev_count > 0 THEN 
        ABS(de.daily_count - es.avg_count) / es.stddev_count > 2
      ELSE FALSE
    END
  ORDER BY anomaly_score DESC, de.log_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert sample memory data for testing
INSERT INTO context_memory_vault (user_id, memory_type, emotional_context, emotional_intensity, tags, source, memory_content, sentiment_score, is_significant) VALUES
('00000000-0000-0000-0000-000000000001', 'emotional', 'Joy', 4.2, ARRAY['celebration', 'birthday', 'family'], 'bondcraft', 'User expressed overwhelming joy when creating a birthday ritual for their mother', 0.85, true),
('00000000-0000-0000-0000-000000000002', 'gifting', 'Anxiety', 3.8, ARRAY['stress', 'deadline', 'work'], 'lumience', 'User showed high anxiety levels when searching for last-minute corporate gifts', -0.45, true),
('00000000-0000-0000-0000-000000000003', 'interaction', 'Love', 4.9, ARRAY['romantic', 'anniversary', 'surprise'], 'agent_gifty', 'User spent 45 minutes crafting the perfect anniversary surprise with AI assistance', 0.92, true),
('00000000-0000-0000-0000-000000000001', 'behavioral', 'Frustration', 2.1, ARRAY['failed_search', 'timeout'], 'smart_search', 'User abandoned gift search after multiple failed attempts to find suitable options', -0.67, false),
('00000000-0000-0000-0000-000000000004', 'preference', 'Excitement', 4.5, ARRAY['discovery', 'new_feature', 'gamification'], 'ghost_hunt', 'User discovered Ghost Hunt feature and played for 2 hours straight', 0.78, true);

INSERT INTO user_feedback_logs (user_id, feedback_type, related_feature, sentiment, sentiment_score, feedback_message, gift_tone, emotional_tags, reaction_intensity) VALUES
('00000000-0000-0000-0000-000000000001', 'gift_reaction', 'bondcraft', 'Delighted', 0.89, 'This ritual idea is absolutely perfect! My mom will love it.', 'Warm', ARRAY['gratitude', 'excitement'], 9),
('00000000-0000-0000-0000-000000000002', 'feature_rating', 'lumience', 'Concerned', -0.23, 'The suggestions feel too generic for my specific situation.', 'Neutral', ARRAY['disappointment', 'skepticism'], 4),
('00000000-0000-0000-0000-000000000003', 'emotional_response', 'agent_gifty', 'Amazed', 0.94, 'I cannot believe how well this AI understands what my partner would love!', 'Enthusiastic', ARRAY['surprise', 'trust'], 10),
('00000000-0000-0000-0000-000000000004', 'suggestion_feedback', 'ghost_hunt', 'Thrilled', 0.87, 'This gamification makes gift discovery so much more fun!', 'Playful', ARRAY['joy', 'engagement'], 8);

INSERT INTO gift_click_logs (user_id, gift_id, gift_category, interaction_type, emotional_context, mood_at_interaction, reaction_score, source_feature, recipient_relationship, occasion_type) VALUES
('00000000-0000-0000-0000-000000000001', 'gift_001', 'Jewelry', 'purchase', 'Love', 'Romantic', 9, 'agent_gifty', 'Partner', 'Anniversary'),
('00000000-0000-0000-0000-000000000002', 'gift_002', 'Books', 'save', 'Thoughtful', 'Contemplative', 7, 'smart_search', 'Friend', 'Birthday'),
('00000000-0000-0000-0000-000000000003', 'gift_003', 'Experience', 'click', 'Excitement', 'Energetic', 8, 'lumience', 'Family', 'Holiday'),
('00000000-0000-0000-0000-000000000001', 'gift_004', 'Tech', 'reject', 'Uncertainty', 'Hesitant', 3, 'reveal', 'Colleague', 'Work Event'),
('00000000-0000-0000-0000-000000000004', 'gift_005', 'Art', 'share', 'Inspiration', 'Creative', 9, 'serendipity', 'Self', 'Personal');
