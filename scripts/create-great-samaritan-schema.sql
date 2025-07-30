-- Great Samaritan Award System Schema
-- Admin-only internal tracking system

-- Bonus rewards log table
CREATE TABLE IF NOT EXISTS bonus_rewards_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    reward_type TEXT NOT NULL, -- 'heygen_film', 'beta_access', 'legacy_badge'
    awarded_by UUID NOT NULL REFERENCES user_profiles(id), -- admin who awarded
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending', -- 'pending', 'delivered', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Great Samaritan awards tracking
CREATE TABLE IF NOT EXISTS great_samaritan_awards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    award_type TEXT NOT NULL, -- 'monthly_lunch', 'annual_winner', 'annual_runner_up'
    award_period TEXT NOT NULL, -- '2024-01', '2024-annual', etc.
    xp_at_award INTEGER NOT NULL,
    total_actions INTEGER NOT NULL,
    qualifying_features TEXT[], -- array of feature names
    awarded_by UUID NOT NULL REFERENCES user_profiles(id),
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active', -- 'active', 'revoked'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lunch drop logs
CREATE TABLE IF NOT EXISTS lunch_drop_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    drop_type TEXT NOT NULL, -- 'monthly_samaritan', 'manual_admin'
    triggered_by UUID NOT NULL REFERENCES user_profiles(id), -- admin who triggered
    webhook_url TEXT,
    webhook_status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    delivery_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legacy badge unlocked tracking
CREATE TABLE IF NOT EXISTS legacy_badge_unlocked (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    badge_name TEXT NOT NULL,
    badge_tier TEXT, -- 'bronze', 'silver', 'gold', 'platinum'
    unlocked_via TEXT, -- 'great_samaritan', 'manual_admin', 'achievement'
    unlocked_by UUID REFERENCES user_profiles(id), -- admin if manual
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Short story videos tracking (HeyGen integration)
CREATE TABLE IF NOT EXISTS short_story_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    video_type TEXT NOT NULL, -- 'great_samaritan_winner', 'custom_story'
    heygen_video_id TEXT,
    video_url TEXT,
    script_content TEXT,
    generation_status TEXT DEFAULT 'pending', -- 'pending', 'generating', 'completed', 'failed'
    requested_by UUID NOT NULL REFERENCES user_profiles(id), -- admin who requested
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bonus_rewards_user_id ON bonus_rewards_log(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_rewards_awarded_at ON bonus_rewards_log(awarded_at);
CREATE INDEX IF NOT EXISTS idx_great_samaritan_user_id ON great_samaritan_awards(user_id);
CREATE INDEX IF NOT EXISTS idx_great_samaritan_period ON great_samaritan_awards(award_period);
CREATE INDEX IF NOT EXISTS idx_lunch_drop_user_id ON lunch_drop_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_badge_user_id ON legacy_badge_unlocked(user_id);
CREATE INDEX IF NOT EXISTS idx_short_story_user_id ON short_story_videos(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE bonus_rewards_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE great_samaritan_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lunch_drop_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_badge_unlocked ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_story_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin-only access)
CREATE POLICY "Admin only access to bonus_rewards_log" ON bonus_rewards_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND (tier = 'admin' OR tier = 'super_admin')
        )
    );

CREATE POLICY "Admin only access to great_samaritan_awards" ON great_samaritan_awards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND (tier = 'admin' OR tier = 'super_admin')
        )
    );

CREATE POLICY "Admin only access to lunch_drop_logs" ON lunch_drop_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND (tier = 'admin' OR tier = 'super_admin')
        )
    );

CREATE POLICY "Admin only access to legacy_badge_unlocked" ON legacy_badge_unlocked
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND (tier = 'admin' OR tier = 'super_admin')
        )
    );

CREATE POLICY "Admin only access to short_story_videos" ON short_story_videos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND (tier = 'admin' OR tier = 'super_admin')
        )
    );

-- Create a view for easy participant tracking
CREATE OR REPLACE VIEW great_samaritan_participant_view AS
SELECT 
    up.id as user_id,
    up.email as username,
    up.xp as xp_total,
    COALESCE(action_counts.total_actions, 0) as total_game_actions,
    action_counts.last_action as last_qualifying_action,
    CASE 
        WHEN COALESCE(action_counts.total_actions, 0) >= 1000 THEN true 
        ELSE false 
    END as lunch_drop_qualified,
    CASE 
        WHEN COALESCE(action_counts.total_actions, 0) >= 5000 THEN 'Platinum'
        WHEN COALESCE(action_counts.total_actions, 0) >= 2500 THEN 'Gold'
        WHEN COALESCE(action_counts.total_actions, 0) >= 1000 THEN 'Silver'
        WHEN COALESCE(action_counts.total_actions, 0) >= 500 THEN 'Bronze'
        ELSE 'Novice'
    END as award_tier,
    up.created_at,
    up.updated_at
FROM user_profiles up
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_actions,
        MAX(created_at) as last_action
    FROM xp_logs 
    WHERE reason IN (
        'EmotionCraft completion',
        'Sentiment Sync usage',
        'Culture Cam upload',
        'Spin the Wheel play',
        'BondCraft session',
        'Ghost Hunt participation',
        'Thought Heist completion',
        'Pride Alliance quest',
        'Gift DNA analysis',
        'Smart Search usage'
    )
    GROUP BY user_id
) action_counts ON up.id = action_counts.user_id
WHERE up.tier NOT IN ('admin', 'super_admin')
ORDER BY COALESCE(action_counts.total_actions, 0) DESC;
