-- Extend assistant_registry table with universal tags
ALTER TABLE assistant_registry ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('internal', 'user-facing', 'hybrid'));
ALTER TABLE assistant_registry ADD COLUMN IF NOT EXISTS tier_required TEXT;
ALTER TABLE assistant_registry ADD COLUMN IF NOT EXISTS voice_persona BOOLEAN DEFAULT false;
ALTER TABLE assistant_registry ADD COLUMN IF NOT EXISTS api_required TEXT[] DEFAULT '{}';
ALTER TABLE assistant_registry ADD COLUMN IF NOT EXISTS connected_features TEXT[] DEFAULT '{}';
ALTER TABLE assistant_registry ADD COLUMN IF NOT EXISTS category_tag TEXT CHECK (category_tag IN ('Emotional Engine', 'Gifting Logic', 'Multilingual Voice', 'Seasonal Drop', 'Internal Bot', 'Game Engine', 'XP Controller'));
ALTER TABLE assistant_registry ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'seasonal', 'beta', 'maintenance')) DEFAULT 'active';
ALTER TABLE assistant_registry ADD COLUMN IF NOT EXISTS linked_to JSONB DEFAULT '{}';
ALTER TABLE assistant_registry ADD COLUMN IF NOT EXISTS performance_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE assistant_registry ADD COLUMN IF NOT EXISTS user_satisfaction DECIMAL(3,2) DEFAULT 0;

-- Create assistant_overrides table for admin controls
CREATE TABLE IF NOT EXISTS assistant_overrides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assistant_id TEXT NOT NULL,
    user_id UUID NOT NULL,
    override_type TEXT NOT NULL CHECK (override_type IN ('force_unlock', 'temporary_access', 'beta_access')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (assistant_id) REFERENCES assistant_registry(assistant_id),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id),
    FOREIGN KEY (created_by) REFERENCES user_profiles(id)
);

-- Create emotional_signatures table
CREATE TABLE IF NOT EXISTS emotional_signatures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    recipient_id UUID,
    text_input TEXT NOT NULL,
    context_type TEXT NOT NULL,
    emotional_tags TEXT[] DEFAULT '{}',
    emotional_intensity INTEGER DEFAULT 0,
    dominant_emotion TEXT,
    confidence_score INTEGER DEFAULT 0,
    emotion_breakdown JSONB DEFAULT '{}',
    processed_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

-- Create ecosystem_health table for monitoring
CREATE TABLE IF NOT EXISTS ecosystem_health (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    snapshot_date DATE DEFAULT CURRENT_DATE,
    total_assistants INTEGER DEFAULT 0,
    active_assistants INTEGER DEFAULT 0,
    total_features INTEGER DEFAULT 0,
    active_features INTEGER DEFAULT 0,
    daily_interactions INTEGER DEFAULT 0,
    category_breakdown JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assistant_registry_type ON assistant_registry(type);
CREATE INDEX IF NOT EXISTS idx_assistant_registry_category_tag ON assistant_registry(category_tag);
CREATE INDEX IF NOT EXISTS idx_assistant_registry_status ON assistant_registry(status);
CREATE INDEX IF NOT EXISTS idx_assistant_overrides_user ON assistant_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_overrides_assistant ON assistant_overrides(assistant_id);
CREATE INDEX IF NOT EXISTS idx_assistant_overrides_expires ON assistant_overrides(expires_at);
CREATE INDEX IF NOT EXISTS idx_emotional_signatures_user ON emotional_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_signatures_dominant ON emotional_signatures(dominant_emotion);
CREATE INDEX IF NOT EXISTS idx_ecosystem_health_date ON ecosystem_health(snapshot_date);

-- Enable RLS for new tables
ALTER TABLE assistant_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_health ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assistant_overrides
CREATE POLICY "Users can view their own overrides" ON assistant_overrides
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all overrides" ON assistant_overrides
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR email = 'admin@agentgift.ai')
        )
    );

-- RLS Policies for emotional_signatures
CREATE POLICY "Users can view their own emotional signatures" ON emotional_signatures
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own emotional signatures" ON emotional_signatures
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all emotional signatures" ON emotional_signatures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR email = 'admin@agentgift.ai')
        )
    );

-- RLS Policies for ecosystem_health
CREATE POLICY "Anyone can view ecosystem health" ON ecosystem_health
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage ecosystem health" ON ecosystem_health
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR email = 'admin@agentgift.ai')
        )
    );

-- Function to update ecosystem health snapshot
CREATE OR REPLACE FUNCTION update_ecosystem_health_snapshot()
RETURNS void AS $$
DECLARE
    assistant_count INTEGER;
    active_assistant_count INTEGER;
    feature_count INTEGER;
    active_feature_count INTEGER;
    interaction_count INTEGER;
    category_stats JSONB;
BEGIN
    -- Get assistant counts
    SELECT COUNT(*) INTO assistant_count FROM assistant_registry;
    SELECT COUNT(*) INTO active_assistant_count FROM assistant_registry WHERE is_active = true;
    
    -- Get feature counts
    SELECT COUNT(*) INTO feature_count FROM agentgift_features;
    SELECT COUNT(*) INTO active_feature_count FROM agentgift_features WHERE is_active = true;
    
    -- Get daily interaction count
    SELECT COUNT(*) INTO interaction_count 
    FROM assistant_interactions 
    WHERE created_at >= CURRENT_DATE;
    
    -- Get category breakdown
    SELECT jsonb_object_agg(category_tag, count) INTO category_stats
    FROM (
        SELECT category_tag, COUNT(*) as count
        FROM assistant_registry
        WHERE is_active = true
        GROUP BY category_tag
    ) category_counts;
    
    -- Insert or update today's snapshot
    INSERT INTO ecosystem_health (
        snapshot_date,
        total_assistants,
        active_assistants,
        total_features,
        active_features,
        daily_interactions,
        category_breakdown
    ) VALUES (
        CURRENT_DATE,
        assistant_count,
        active_assistant_count,
        feature_count,
        active_feature_count,
        interaction_count,
        category_stats
    )
    ON CONFLICT (snapshot_date) DO UPDATE SET
        total_assistants = EXCLUDED.total_assistants,
        active_assistants = EXCLUDED.active_assistants,
        total_features = EXCLUDED.total_features,
        active_features = EXCLUDED.active_features,
        daily_interactions = EXCLUDED.daily_interactions,
        category_breakdown = EXCLUDED.category_breakdown,
        created_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired overrides
CREATE OR REPLACE FUNCTION cleanup_expired_overrides()
RETURNS void AS $$
BEGIN
    DELETE FROM assistant_overrides 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing assistants with universal tags
UPDATE assistant_registry SET
    type = CASE 
        WHEN name LIKE '%Admin%' OR name LIKE '%Internal%' OR name LIKE '%Upload%' OR name LIKE '%Identity%' THEN 'internal'
        WHEN name LIKE '%Agent%' OR name LIKE '%Concierge%' OR name LIKE '%Engine%' THEN 'hybrid'
        ELSE 'user-facing'
    END,
    tier_required = CASE 
        WHEN unlock_type = 'loyalty_nft' THEN 'NFT'
        WHEN unlock_type = 'xp_level' THEN 'XP_Unlock'
        ELSE tier
    END,
    voice_persona = voice_enabled,
    api_required = CASE 
        WHEN voice_enabled THEN ARRAY['GPT', 'ElevenLabs']
        ELSE ARRAY['GPT']
    END,
    category_tag = CASE 
        WHEN name LIKE '%Love Language%' OR name LIKE '%Emotion%' THEN 'Emotional Engine'
        WHEN name LIKE '%Gift%' OR name LIKE '%Concierge%' OR name LIKE '%Occasion%' THEN 'Gifting Logic'
        WHEN name LIKE '%Agent Arya%' OR name LIKE '%Agent Mei%' OR name LIKE '%Agent Lola%' THEN 'Multilingual Voice'
        WHEN name LIKE '%Zola%' THEN 'Seasonal Drop'
        WHEN name LIKE '%Tokenomics%' OR name LIKE '%XP%' THEN 'XP Controller'
        WHEN name LIKE '%Upload%' OR name LIKE '%Identity%' OR name LIKE '%Admin%' THEN 'Internal Bot'
        ELSE 'Gifting Logic'
    END,
    status = CASE 
        WHEN name LIKE '%Zola%' THEN 'seasonal'
        WHEN name LIKE '%Beta%' THEN 'beta'
        WHEN is_active = false THEN 'maintenance'
        ELSE 'active'
    END
WHERE type IS NULL OR category_tag IS NULL;

-- Create unique constraint on ecosystem_health snapshot_date
ALTER TABLE ecosystem_health ADD CONSTRAINT unique_snapshot_date UNIQUE (snapshot_date);

-- Schedule ecosystem health updates (requires pg_cron extension)
-- SELECT cron.schedule('update-ecosystem-health', '0 0 * * *', 'SELECT update_ecosystem_health_snapshot();');
-- SELECT cron.schedule('cleanup-expired-overrides', '0 1 * * *', 'SELECT cleanup_expired_overrides();');
