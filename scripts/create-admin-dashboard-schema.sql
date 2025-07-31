-- Create Admin Action Logs Table
CREATE TABLE IF NOT EXISTS admin_action_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    action_type VARCHAR(100) NOT NULL,
    action_detail TEXT,
    target_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    target_feature VARCHAR(100),
    before_state JSONB DEFAULT '{}',
    after_state JSONB DEFAULT '{}',
    request_data JSONB DEFAULT '{}',
    response_data JSONB DEFAULT '{}',
    execution_status VARCHAR(20) DEFAULT 'success' CHECK (execution_status IN ('success', 'error', 'pending')),
    execution_time_ms INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Admin Voice Settings Table
CREATE TABLE IF NOT EXISTS admin_voice_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
    selected_voice VARCHAR(50) DEFAULT 'galen',
    voice_enabled BOOLEAN DEFAULT TRUE,
    voice_speed FLOAT DEFAULT 1.0,
    auto_speak_results BOOLEAN DEFAULT TRUE,
    voice_timeout_seconds INTEGER DEFAULT 5,
    fallback_phrases JSONB DEFAULT '["Shall I log this reaction as emotionally neutral, Agent?", "I serve the Giftverse heartbeat, one log at a time.", "Voice input not detected. Please speak your command, Agent."]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Admin Voice Transcripts Table
CREATE TABLE IF NOT EXISTS admin_voice_transcripts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    transcript_type VARCHAR(20) CHECK (transcript_type IN ('speech_to_text', 'text_to_speech')),
    content TEXT NOT NULL,
    voice_assistant VARCHAR(50) DEFAULT 'galen',
    confidence_score FLOAT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Feature Test Variants Table
CREATE TABLE IF NOT EXISTS feature_test_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_name VARCHAR(100) NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    variant_config JSONB DEFAULT '{}',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    conversion_event VARCHAR(100),
    conversion_value FLOAT,
    UNIQUE(test_name, user_id)
);

-- Create Ghost Mode Sessions Table
CREATE TABLE IF NOT EXISTS ghost_mode_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    actions_performed JSONB DEFAULT '[]',
    insights_gathered JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE
);

-- Create Giftverse Health Snapshots Table
CREATE TABLE IF NOT EXISTS giftverse_health_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    snapshot_date DATE DEFAULT CURRENT_DATE,
    total_users INTEGER DEFAULT 0,
    active_users_24h INTEGER DEFAULT 0,
    total_xp_circulation BIGINT DEFAULT 0,
    total_credits_circulation BIGINT DEFAULT 0,
    badges_unlocked_today INTEGER DEFAULT 0,
    features_used_today INTEGER DEFAULT 0,
    engagement_rate FLOAT DEFAULT 0,
    economy_health_score FLOAT DEFAULT 0,
    top_features JSONB DEFAULT '[]',
    emotional_sentiment_avg FLOAT DEFAULT 0,
    referral_success_rate FLOAT DEFAULT 0,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(snapshot_date)
);

-- Create User Impersonation Logs Table
CREATE TABLE IF NOT EXISTS user_impersonation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    impersonation_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    impersonation_end TIMESTAMP WITH TIME ZONE,
    actions_performed JSONB DEFAULT '[]',
    xp_changes JSONB DEFAULT '{}',
    badge_changes JSONB DEFAULT '{}',
    credit_changes JSONB DEFAULT '{}',
    reason TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert default admin voice settings for existing admins
INSERT INTO admin_voice_settings (admin_id, selected_voice, voice_enabled)
SELECT id, 'galen', TRUE 
FROM user_profiles 
WHERE admin_role IS NOT NULL
ON CONFLICT (admin_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_admin_id ON admin_action_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_created_at ON admin_action_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_action_type ON admin_action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_voice_transcripts_admin_id ON admin_voice_transcripts(admin_id);
CREATE INDEX IF NOT EXISTS idx_feature_test_variants_user_id ON feature_test_variants(user_id);
CREATE INDEX IF NOT EXISTS idx_ghost_mode_sessions_admin_id ON ghost_mode_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_user_impersonation_logs_admin_id ON user_impersonation_logs(admin_id);

-- Create RLS policies for admin-only access
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_voice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_voice_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghost_mode_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE giftverse_health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_impersonation_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admin only access to admin_action_logs" ON admin_action_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND admin_role IS NOT NULL
        )
    );

CREATE POLICY "Admin only access to admin_voice_settings" ON admin_voice_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND admin_role IS NOT NULL
        )
    );

CREATE POLICY "Admin only access to admin_voice_transcripts" ON admin_voice_transcripts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND admin_role IS NOT NULL
        )
    );

CREATE POLICY "Admin only access to feature_test_variants" ON feature_test_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND admin_role IS NOT NULL
        )
    );

CREATE POLICY "Admin only access to ghost_mode_sessions" ON ghost_mode_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND admin_role IS NOT NULL
        )
    );

CREATE POLICY "Admin only access to giftverse_health_snapshots" ON giftverse_health_snapshots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND admin_role IS NOT NULL
        )
    );

CREATE POLICY "Admin only access to user_impersonation_logs" ON user_impersonation_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND admin_role IS NOT NULL
        )
    );

-- Create function to generate giftverse health snapshot
CREATE OR REPLACE FUNCTION generate_giftverse_health_snapshot(admin_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    snapshot_data JSONB;
    total_users_count INTEGER;
    active_users_count INTEGER;
    xp_circulation BIGINT;
    credits_circulation BIGINT;
    badges_today INTEGER;
    features_today INTEGER;
    engagement FLOAT;
    health_score FLOAT;
    top_features_data JSONB;
    sentiment_avg FLOAT;
    referral_rate FLOAT;
BEGIN
    -- Calculate metrics
    SELECT COUNT(*) INTO total_users_count FROM user_profiles;
    
    SELECT COUNT(*) INTO active_users_count 
    FROM user_profiles 
    WHERE last_activity >= NOW() - INTERVAL '24 hours';
    
    SELECT COALESCE(SUM(xp), 0) INTO xp_circulation FROM user_profiles;
    SELECT COALESCE(SUM(credits), 0) INTO credits_circulation FROM user_profiles;
    
    SELECT COUNT(*) INTO badges_today 
    FROM badge_earned_logs 
    WHERE created_at >= CURRENT_DATE;
    
    SELECT COUNT(DISTINCT feature_name) INTO features_today 
    FROM feature_usage_logs 
    WHERE created_at >= CURRENT_DATE;
    
    -- Calculate engagement rate
    engagement := CASE 
        WHEN total_users_count > 0 THEN (active_users_count::FLOAT / total_users_count::FLOAT) * 100
        ELSE 0 
    END;
    
    -- Calculate health score (simplified)
    health_score := LEAST(100, (engagement + 
        CASE WHEN badges_today > 0 THEN 20 ELSE 0 END +
        CASE WHEN features_today > 5 THEN 15 ELSE features_today * 3 END));
    
    -- Get top features
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'feature_name', feature_name,
            'usage_count', usage_count
        ) ORDER BY usage_count DESC
    ), '[]'::jsonb) INTO top_features_data
    FROM (
        SELECT feature_name, COUNT(*) as usage_count
        FROM feature_usage_logs 
        WHERE created_at >= CURRENT_DATE
        GROUP BY feature_name
        LIMIT 5
    ) top_features;
    
    -- Get average emotional sentiment
    SELECT COALESCE(AVG(intensity_score), 0) INTO sentiment_avg
    FROM emotional_tag_logs 
    WHERE created_at >= CURRENT_DATE;
    
    -- Calculate referral success rate (simplified)
    SELECT COALESCE(
        (COUNT(CASE WHEN status = 'completed' THEN 1 END)::FLOAT / 
         NULLIF(COUNT(*)::FLOAT, 0)) * 100, 0
    ) INTO referral_rate
    FROM referral_logs 
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
    
    -- Insert snapshot
    INSERT INTO giftverse_health_snapshots (
        total_users, active_users_24h, total_xp_circulation, total_credits_circulation,
        badges_unlocked_today, features_used_today, engagement_rate, economy_health_score,
        top_features, emotional_sentiment_avg, referral_success_rate, created_by
    ) VALUES (
        total_users_count, active_users_count, xp_circulation, credits_circulation,
        badges_today, features_today, engagement, health_score,
        top_features_data, sentiment_avg, referral_rate, admin_user_id
    ) ON CONFLICT (snapshot_date) DO UPDATE SET
        total_users = EXCLUDED.total_users,
        active_users_24h = EXCLUDED.active_users_24h,
        total_xp_circulation = EXCLUDED.total_xp_circulation,
        total_credits_circulation = EXCLUDED.total_credits_circulation,
        badges_unlocked_today = EXCLUDED.badges_unlocked_today,
        features_used_today = EXCLUDED.features_used_today,
        engagement_rate = EXCLUDED.engagement_rate,
        economy_health_score = EXCLUDED.economy_health_score,
        top_features = EXCLUDED.top_features,
        emotional_sentiment_avg = EXCLUDED.emotional_sentiment_avg,
        referral_success_rate = EXCLUDED.referral_success_rate,
        created_by = EXCLUDED.created_by;
    
    -- Build response
    snapshot_data := jsonb_build_object(
        'total_users', total_users_count,
        'active_users_24h', active_users_count,
        'total_xp_circulation', xp_circulation,
        'total_credits_circulation', credits_circulation,
        'badges_unlocked_today', badges_today,
        'features_used_today', features_today,
        'engagement_rate', engagement,
        'economy_health_score', health_score,
        'top_features', top_features_data,
        'emotional_sentiment_avg', sentiment_avg,
        'referral_success_rate', referral_rate,
        'snapshot_date', CURRENT_DATE
    );
    
    RETURN snapshot_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
