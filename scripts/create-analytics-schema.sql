-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Create a view for conversion funnel analysis
CREATE OR REPLACE VIEW conversion_funnel AS
SELECT 
  event_name,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('day', timestamp) as event_date
FROM analytics_events 
WHERE event_name IN (
  'questionnaire_started',
  'questionnaire_completed', 
  'cta_clicked',
  'signup_started',
  'signup_completed',
  'dashboard_arrived'
)
GROUP BY event_name, DATE_TRUNC('day', timestamp)
ORDER BY event_date DESC, event_name;

-- Function to calculate conversion rates
CREATE OR REPLACE FUNCTION get_conversion_rates(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  step TEXT,
  count BIGINT,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH funnel_steps AS (
    SELECT 
      'questionnaire_started' as step,
      COUNT(DISTINCT session_id) as count
    FROM analytics_events 
    WHERE event_name = 'questionnaire_started'
      AND timestamp::date BETWEEN start_date AND end_date
    
    UNION ALL
    
    SELECT 
      'questionnaire_completed' as step,
      COUNT(DISTINCT session_id) as count
    FROM analytics_events 
    WHERE event_name = 'questionnaire_completed'
      AND timestamp::date BETWEEN start_date AND end_date
    
    UNION ALL
    
    SELECT 
      'cta_clicked' as step,
      COUNT(DISTINCT session_id) as count
    FROM analytics_events 
    WHERE event_name = 'cta_clicked'
      AND timestamp::date BETWEEN start_date AND end_date
    
    UNION ALL
    
    SELECT 
      'signup_started' as step,
      COUNT(DISTINCT session_id) as count
    FROM analytics_events 
    WHERE event_name = 'signup_started'
      AND timestamp::date BETWEEN start_date AND end_date
    
    UNION ALL
    
    SELECT 
      'signup_completed' as step,
      COUNT(DISTINCT session_id) as count
    FROM analytics_events 
    WHERE event_name = 'signup_completed'
      AND timestamp::date BETWEEN start_date AND end_date
    
    UNION ALL
    
    SELECT 
      'dashboard_arrived' as step,
      COUNT(DISTINCT session_id) as count
    FROM analytics_events 
    WHERE event_name = 'dashboard_arrived'
      AND timestamp::date BETWEEN start_date AND end_date
  ),
  total_sessions AS (
    SELECT COUNT(DISTINCT session_id) as total
    FROM analytics_events 
    WHERE event_name = 'questionnaire_started'
      AND timestamp::date BETWEEN start_date AND end_date
  )
  SELECT 
    f.step,
    f.count,
    CASE 
      WHEN t.total > 0 THEN ROUND((f.count::numeric / t.total::numeric) * 100, 2)
      ELSE 0
    END as conversion_rate
  FROM funnel_steps f
  CROSS JOIN total_sessions t
  ORDER BY 
    CASE f.step
      WHEN 'questionnaire_started' THEN 1
      WHEN 'questionnaire_completed' THEN 2
      WHEN 'cta_clicked' THEN 3
      WHEN 'signup_started' THEN 4
      WHEN 'signup_completed' THEN 5
      WHEN 'dashboard_arrived' THEN 6
    END;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read their own analytics
CREATE POLICY "Users can view their own analytics" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for service role to insert analytics
CREATE POLICY "Service role can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Policy for service role to read all analytics (for admin)
CREATE POLICY "Service role can read all analytics" ON analytics_events
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');
