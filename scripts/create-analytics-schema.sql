-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    session_id TEXT,
    user_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);

-- Create conversion funnel view
CREATE OR REPLACE VIEW conversion_funnel AS
SELECT 
    event_name,
    COUNT(*) as event_count,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT user_id) as unique_users
FROM analytics_events 
WHERE event_name IN (
    'landing_page_view',
    'questionnaire_started',
    'questionnaire_completed',
    'cta_clicked',
    'signup_started',
    'signup_completed',
    'dashboard_arrived'
)
GROUP BY event_name
ORDER BY 
    CASE event_name
        WHEN 'landing_page_view' THEN 1
        WHEN 'questionnaire_started' THEN 2
        WHEN 'questionnaire_completed' THEN 3
        WHEN 'cta_clicked' THEN 4
        WHEN 'signup_started' THEN 5
        WHEN 'signup_completed' THEN 6
        WHEN 'dashboard_arrived' THEN 7
    END;

-- Function to get conversion rates
CREATE OR REPLACE FUNCTION get_conversion_rates()
RETURNS TABLE (
    step TEXT,
    count BIGINT,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH funnel_data AS (
        SELECT 
            event_name,
            COUNT(DISTINCT session_id) as sessions
        FROM analytics_events 
        WHERE event_name IN (
            'landing_page_view',
            'questionnaire_started', 
            'questionnaire_completed',
            'cta_clicked',
            'signup_started',
            'signup_completed',
            'dashboard_arrived'
        )
        GROUP BY event_name
    ),
    ordered_funnel AS (
        SELECT 
            event_name,
            sessions,
            LAG(sessions) OVER (ORDER BY 
                CASE event_name
                    WHEN 'landing_page_view' THEN 1
                    WHEN 'questionnaire_started' THEN 2
                    WHEN 'questionnaire_completed' THEN 3
                    WHEN 'cta_clicked' THEN 4
                    WHEN 'signup_started' THEN 5
                    WHEN 'signup_completed' THEN 6
                    WHEN 'dashboard_arrived' THEN 7
                END
            ) as previous_sessions
        FROM funnel_data
    )
    SELECT 
        event_name::TEXT,
        sessions,
        CASE 
            WHEN previous_sessions IS NULL OR previous_sessions = 0 THEN 100.0
            ELSE ROUND((sessions::NUMERIC / previous_sessions::NUMERIC) * 100, 2)
        END as conversion_rate
    FROM ordered_funnel
    ORDER BY 
        CASE event_name
            WHEN 'landing_page_view' THEN 1
            WHEN 'questionnaire_started' THEN 2
            WHEN 'questionnaire_completed' THEN 3
            WHEN 'cta_clicked' THEN 4
            WHEN 'signup_started' THEN 5
            WHEN 'signup_completed' THEN 6
            WHEN 'dashboard_arrived' THEN 7
        END;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage analytics_events" ON analytics_events
    FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to view their own events
CREATE POLICY "Users can view own analytics_events" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);
