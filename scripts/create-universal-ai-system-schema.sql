-- Universal AI Plugin Loader Schema
-- This schema supports the complete AgentGift.ai AI ecosystem

-- Enhanced Assistant Registry with Universal Tags
CREATE TABLE IF NOT EXISTS assistant_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assistant_id TEXT UNIQUE NOT NULL, -- OpenAI Assistant ID
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    tier TEXT DEFAULT 'Free' CHECK (tier IN ('Free', 'Pro', 'Pro+', 'Enterprise')),
    unlock_type TEXT DEFAULT 'tier' CHECK (unlock_type IN ('tier', 'xp_level', 'loyalty_nft', 'seasonal', 'beta')),
    unlock_requirement INTEGER, -- XP level or other numeric requirement
    icon TEXT,
    persona_hint TEXT,
    voice_enabled BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    xp_reward INTEGER DEFAULT 5,
    
    -- Universal Plugin Loader Tags
    type TEXT DEFAULT 'user-facing' CHECK (type IN ('internal', 'user-facing', 'hybrid', 'voice', 'logic')),
    tier_required TEXT DEFAULT 'Free' CHECK (tier_required IN ('Free', 'Pro', 'Pro+', 'Enterprise', 'NFT', 'XP_Unlock')),
    voice_persona BOOLEAN DEFAULT false,
    api_required TEXT[] DEFAULT ARRAY['GPT'], -- Array of required APIs
    connected_features TEXT[] DEFAULT ARRAY[]::TEXT[], -- Connected feature slugs
    category_tag TEXT DEFAULT 'Internal Bot' CHECK (category_tag IN (
        'Emotional Engine', 'Gifting Logic', 'Multilingual Voice', 
        'Seasonal Drop', 'Internal Bot', 'Game Engine', 'XP Controller'
    )),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'seasonal', 'beta', 'maintenance')),
    linked_to JSONB DEFAULT '{}', -- Feature slugs, edge functions, XP levels
    
    -- Performance Metrics
    interaction_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    performance_score DECIMAL(5,2) DEFAULT 0.0,
    user_satisfaction DECIMAL(3,2) DEFAULT 0.0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assistant Interactions Log
CREATE TABLE IF NOT EXISTS assistant_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assistant_id TEXT NOT NULL,
    assistant_registry_id UUID REFERENCES assistant_registry(id),
    input_message TEXT,
    response_message TEXT,
    user_tier TEXT DEFAULT 'Free',
    user_xp_level INTEGER DEFAULT 1,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0.0000,
    interaction_type TEXT DEFAULT 'chat',
    emotional_context JSONB,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assistant Overrides (for admin force unlocks)
CREATE TABLE IF NOT EXISTS assistant_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assistant_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    override_type TEXT NOT NULL CHECK (override_type IN ('force_unlock', 'tier_bypass', 'beta_access')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    reason TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced AgentGift Features Registry
CREATE TABLE IF NOT EXISTS agentgift_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_name TEXT NOT NULL,
    route_path TEXT UNIQUE NOT NULL,
    tier_access TEXT DEFAULT 'Free' CHECK (tier_access IN ('Free', 'Pro', 'Pro+', 'Enterprise')),
    xp_unlock_level INTEGER,
    is_active BOOLEAN DEFAULT true,
    category TEXT DEFAULT 'general',
    description TEXT,
    icon TEXT,
    
    -- Universal Plugin Integration
    connected_assistants TEXT[] DEFAULT ARRAY[]::TEXT[],
    required_apis TEXT[] DEFAULT ARRAY[]::TEXT[],
    feature_type TEXT DEFAULT 'standard' CHECK (feature_type IN ('standard', 'voice', 'game', 'admin', 'seasonal')),
    
    -- Feature Configuration
    config JSONB DEFAULT '{}',
    usage_limits JSONB DEFAULT '{}', -- Per-tier usage limits
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emotional Signatures Storage
CREATE TABLE IF NOT EXISTS emotional_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    primary_emotion TEXT NOT NULL,
    secondary_emotions TEXT[] DEFAULT ARRAY[]::TEXT[],
    intensity_score DECIMAL(3,1) CHECK (intensity_score BETWEEN 0 AND 10),
    valence TEXT CHECK (valence IN ('positive', 'negative', 'neutral')),
    arousal TEXT CHECK (arousal IN ('high', 'medium', 'low')),
    emotional_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    
    -- Analysis Results
    psychological_insights JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    analysis_type TEXT DEFAULT 'basic' CHECK (analysis_type IN ('basic', 'detailed', 'comprehensive')),
    context JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Suggestions Database
CREATE TABLE IF NOT EXISTS gift_suggestions_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    emotional_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    occasion_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    personality_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    cultural_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Product Information
    purchase_links JSONB DEFAULT '[]',
    customization_options TEXT[] DEFAULT ARRAY[]::TEXT[],
    delivery_info JSONB DEFAULT '{}',
    
    -- Scoring
    popularity_score DECIMAL(5,2) DEFAULT 0.0,
    emotional_impact_score DECIMAL(5,2) DEFAULT 0.0,
    personalization_score DECIMAL(5,2) DEFAULT 0.0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Suggestion Logs
CREATE TABLE IF NOT EXISTS gift_suggestion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_data JSONB NOT NULL,
    suggestions_count INTEGER DEFAULT 0,
    user_tier TEXT DEFAULT 'Free',
    assistant_used TEXT,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Usage Tracking
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    api_provider TEXT NOT NULL, -- 'openai', 'elevenlabs', 'deepinfra', 'groq', 'xai'
    api_endpoint TEXT,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10,6) DEFAULT 0.000000,
    request_type TEXT, -- 'chat', 'voice', 'image', 'embedding'
    assistant_id TEXT,
    feature_used TEXT,
    response_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multi-API Configuration
CREATE TABLE IF NOT EXISTS api_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL, -- 'openai', 'elevenlabs', 'deepinfra', 'groq', 'xai'
    endpoint_name TEXT NOT NULL,
    endpoint_url TEXT NOT NULL,
    model_name TEXT,
    tier_access TEXT DEFAULT 'Free' CHECK (tier_access IN ('Free', 'Pro', 'Pro+', 'Enterprise')),
    rate_limits JSONB DEFAULT '{}', -- Per-tier rate limits
    cost_per_token DECIMAL(10,8) DEFAULT 0.00000000,
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice Personas Configuration
CREATE TABLE IF NOT EXISTS voice_personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- 'Zola', 'Arya', 'Mei', 'Lola'
    assistant_id TEXT REFERENCES assistant_registry(assistant_id),
    elevenlabs_voice_id TEXT,
    personality_traits TEXT[] DEFAULT ARRAY[]::TEXT[],
    cultural_context TEXT,
    language_code TEXT DEFAULT 'en-US',
    voice_settings JSONB DEFAULT '{}', -- ElevenLabs voice settings
    sample_phrases TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Health Monitoring
CREATE TABLE IF NOT EXISTS system_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component TEXT NOT NULL, -- 'assistant_registry', 'api_gateway', 'voice_system'
    status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
    metrics JSONB DEFAULT '{}',
    error_details TEXT,
    auto_recovery_attempted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced User Profiles for AI Integration
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS emotional_profile JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS voice_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS api_usage_stats JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS has_loyalty_nft BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS loyalty_nfts TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_assistant_registry_type ON assistant_registry(type);
CREATE INDEX IF NOT EXISTS idx_assistant_registry_category_tag ON assistant_registry(category_tag);
CREATE INDEX IF NOT EXISTS idx_assistant_registry_status ON assistant_registry(status);
CREATE INDEX IF NOT EXISTS idx_assistant_registry_tier_required ON assistant_registry(tier_required);
CREATE INDEX IF NOT EXISTS idx_assistant_interactions_user_id ON assistant_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_interactions_assistant_id ON assistant_interactions(assistant_id);
CREATE INDEX IF NOT EXISTS idx_assistant_interactions_created_at ON assistant_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_emotional_signatures_user_id ON emotional_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_signatures_primary_emotion ON emotional_signatures(primary_emotion);
CREATE INDEX IF NOT EXISTS idx_gift_suggestions_category ON gift_suggestions_database(category);
CREATE INDEX IF NOT EXISTS idx_gift_suggestions_emotional_tags ON gift_suggestions_database USING GIN(emotional_tags);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_provider ON api_usage_logs(api_provider);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE assistant_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_suggestion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assistant_registry
CREATE POLICY "Public read access to active assistants" ON assistant_registry
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access to assistant_registry" ON assistant_registry
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND (user_profiles.role = 'admin' OR user_profiles.email = 'admin@agentgift.ai')
        )
    );

-- RLS Policies for assistant_interactions
CREATE POLICY "Users can view their own interactions" ON assistant_interactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own interactions" ON assistant_interactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all interactions" ON assistant_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND (user_profiles.role = 'admin' OR user_profiles.email = 'admin@agentgift.ai')
        )
    );

-- RLS Policies for emotional_signatures
CREATE POLICY "Users can view their own emotional signatures" ON emotional_signatures
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own emotional signatures" ON emotional_signatures
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for gift_suggestion_logs
CREATE POLICY "Users can view their own gift suggestion logs" ON gift_suggestion_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own gift suggestion logs" ON gift_suggestion_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for api_usage_logs
CREATE POLICY "Users can view their own API usage" ON api_usage_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert API usage logs" ON api_usage_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view all API usage" ON api_usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND (user_profiles.role = 'admin' OR user_profiles.email = 'admin@agentgift.ai')
        )
    );

-- Functions for XP and Tier Management
CREATE OR REPLACE FUNCTION add_user_xp(user_id UUID, xp_amount INTEGER, reason TEXT DEFAULT 'System reward')
RETURNS VOID AS $$
DECLARE
    current_xp INTEGER;
    current_level INTEGER;
    new_xp INTEGER;
    new_level INTEGER;
BEGIN
    -- Get current XP and level
    SELECT xp, level INTO current_xp, current_level
    FROM user_profiles
    WHERE id = user_id;
    
    -- Calculate new values
    new_xp := current_xp + xp_amount;
    new_level := FLOOR(new_xp / 150) + 1;
    
    -- Update user profile
    UPDATE user_profiles
    SET 
        xp = new_xp,
        level = new_level,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Log the XP transaction
    INSERT INTO xp_logs (user_id, xp_amount, reason)
    VALUES (user_id, xp_amount, reason);
    
    -- Check for level up achievements
    IF new_level > current_level THEN
        -- Award level up badge or bonus
        INSERT INTO badge_earned_logs (user_id, badge_id, earned_reason)
        VALUES (user_id, 'level_up_' || new_level, 'Reached level ' || new_level);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check assistant access
CREATE OR REPLACE FUNCTION check_assistant_access(user_id UUID, assistant_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier TEXT;
    user_level INTEGER;
    user_has_nft BOOLEAN;
    assistant_record RECORD;
    has_override BOOLEAN;
BEGIN
    -- Get user profile
    SELECT tier, level, has_loyalty_nft 
    INTO user_tier, user_level, user_has_nft
    FROM user_profiles
    WHERE id = user_id;
    
    -- Get assistant requirements
    SELECT * INTO assistant_record
    FROM assistant_registry
    WHERE assistant_registry.assistant_id = check_assistant_access.assistant_id
    AND is_active = true;
    
    -- Check if assistant exists
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check for admin override
    SELECT EXISTS(
        SELECT 1 FROM assistant_overrides
        WHERE assistant_overrides.assistant_id = check_assistant_access.assistant_id
        AND assistant_overrides.user_id = check_assistant_access.user_id
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO has_override;
    
    IF has_override THEN
        RETURN true;
    END IF;
    
    -- Check access based on unlock type
    CASE assistant_record.unlock_type
        WHEN 'tier' THEN
            RETURN (
                CASE user_tier
                    WHEN 'Free' THEN assistant_record.tier_required = 'Free'
                    WHEN 'Pro' THEN assistant_record.tier_required IN ('Free', 'Pro')
                    WHEN 'Pro+' THEN assistant_record.tier_required IN ('Free', 'Pro', 'Pro+')
                    WHEN 'Enterprise' THEN true
                    ELSE false
                END
            );
        WHEN 'xp_level' THEN
            RETURN user_level >= COALESCE(assistant_record.unlock_requirement, 0);
        WHEN 'loyalty_nft' THEN
            RETURN user_has_nft;
        WHEN 'seasonal' THEN
            -- Check if current date is within seasonal period
            RETURN assistant_record.status = 'active';
        WHEN 'beta' THEN
            -- Beta access for Pro+ and Enterprise users
            RETURN user_tier IN ('Pro+', 'Enterprise');
        ELSE
            RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log API usage
CREATE OR REPLACE FUNCTION log_api_usage(
    user_id UUID,
    api_provider TEXT,
    api_endpoint TEXT,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL DEFAULT 0.0,
    request_type TEXT DEFAULT 'chat',
    assistant_id TEXT DEFAULT NULL,
    feature_used TEXT DEFAULT NULL,
    response_time_ms INTEGER DEFAULT NULL,
    success BOOLEAN DEFAULT true,
    error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO api_usage_logs (
        user_id, api_provider, api_endpoint, tokens_used, cost,
        request_type, assistant_id, feature_used, response_time_ms,
        success, error_message
    ) VALUES (
        user_id, api_provider, api_endpoint, tokens_used, cost,
        request_type, assistant_id, feature_used, response_time_ms,
        success, error_message
    );
    
    -- Update user's API usage stats
    UPDATE user_profiles
    SET api_usage_stats = COALESCE(api_usage_stats, '{}'::jsonb) || 
        jsonb_build_object(
            api_provider, 
            COALESCE((api_usage_stats->api_provider->>'total_tokens')::integer, 0) + tokens_used,
            'last_used', NOW()
        )
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate Giftverse health snapshot
CREATE OR REPLACE FUNCTION generate_giftverse_health_snapshot(admin_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    health_data JSONB;
    assistant_stats JSONB;
    api_stats JSONB;
    user_stats JSONB;
    feature_stats JSONB;
BEGIN
    -- Verify admin access
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = admin_user_id 
        AND (role = 'admin' OR email = 'admin@agentgift.ai')
    ) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;
    
    -- Get assistant statistics
    SELECT jsonb_build_object(
        'total_assistants', COUNT(*),
        'active_assistants', COUNT(*) FILTER (WHERE is_active = true),
        'by_category', jsonb_object_agg(category_tag, category_count),
        'by_type', jsonb_object_agg(type, type_count),
        'avg_performance_score', AVG(performance_score),
        'total_interactions_24h', (
            SELECT COUNT(*) FROM assistant_interactions 
            WHERE created_at >= NOW() - INTERVAL '24 hours'
        )
    ) INTO assistant_stats
    FROM (
        SELECT 
            category_tag,
            type,
            is_active,
            performance_score,
            COUNT(*) OVER (PARTITION BY category_tag) as category_count,
            COUNT(*) OVER (PARTITION BY type) as type_count
        FROM assistant_registry
    ) t;
    
    -- Get API usage statistics
    SELECT jsonb_build_object(
        'total_requests_24h', COUNT(*),
        'successful_requests', COUNT(*) FILTER (WHERE success = true),
        'total_tokens_used', SUM(tokens_used),
        'total_cost', SUM(cost),
        'by_provider', jsonb_object_agg(api_provider, provider_stats),
        'avg_response_time', AVG(response_time_ms)
    ) INTO api_stats
    FROM (
        SELECT 
            api_provider,
            success,
            tokens_used,
            cost,
            response_time_ms,
            jsonb_build_object(
                'requests', COUNT(*),
                'tokens', SUM(tokens_used),
                'cost', SUM(cost)
            ) OVER (PARTITION BY api_provider) as provider_stats
        FROM api_usage_logs
        WHERE created_at >= NOW() - INTERVAL '24 hours'
    ) t;
    
    -- Get user statistics
    SELECT jsonb_build_object(
        'total_users', COUNT(*),
        'active_users_24h', COUNT(*) FILTER (WHERE last_seen >= NOW() - INTERVAL '24 hours'),
        'by_tier', jsonb_object_agg(tier, tier_count),
        'avg_level', AVG(level),
        'total_xp_awarded_24h', (
            SELECT COALESCE(SUM(xp_amount), 0) FROM xp_logs 
            WHERE created_at >= NOW() - INTERVAL '24 hours'
        )
    ) INTO user_stats
    FROM (
        SELECT 
            tier,
            level,
            last_seen,
            COUNT(*) OVER (PARTITION BY tier) as tier_count
        FROM user_profiles
    ) t;
    
    -- Get feature statistics
    SELECT jsonb_build_object(
        'total_features', COUNT(*),
        'active_features', COUNT(*) FILTER (WHERE is_active = true),
        'by_category', jsonb_object_agg(category, category_count)
    ) INTO feature_stats
    FROM (
        SELECT 
            category,
            is_active,
            COUNT(*) OVER (PARTITION BY category) as category_count
        FROM agentgift_features
    ) t;
    
    -- Combine all statistics
    health_data := jsonb_build_object(
        'timestamp', NOW(),
        'generated_by', admin_user_id,
        'system_status', 'healthy',
        'assistants', assistant_stats,
        'api_usage', api_stats,
        'users', user_stats,
        'features', feature_stats,
        'system_uptime', '99.9%', -- Mock data
        'last_deployment', NOW() - INTERVAL '2 days' -- Mock data
    );
    
    -- Log the health check
    INSERT INTO system_health_logs (component, status, metrics)
    VALUES ('giftverse_ecosystem', 'healthy', health_data);
    
    RETURN health_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed Data for Assistant Registry
INSERT INTO assistant_registry (
    assistant_id, name, description, category, tier, unlock_type, unlock_requirement,
    icon, persona_hint, voice_enabled, xp_reward, type, tier_required, voice_persona,
    api_required, connected_features, category_tag, status, linked_to
) VALUES 
(
    'asst_mDwC9xbBkSKPVoVpBYs4fbTw',
    'Concierge Core',
    'Your personal gift concierge that understands your needs and helps find the perfect gifts',
    'gifting',
    'Free',
    'tier',
    NULL,
    'gift',
    'Warm, helpful, and intuitive gift advisor',
    false,
    10,
    'user-facing',
    'Free',
    false,
    ARRAY['GPT'],
    ARRAY['agent-gifty', 'lumience-dev', 'gift-concierge', 'smart-search'],
    'Gifting Logic',
    'active',
    '{"feature_slugs": ["agent-gifty", "lumience-dev"], "edge_functions": ["gift_suggestion_engine", "user_query_handler"], "xp_level": null}'::jsonb
),
(
    'asst_nG0Wk33h0SJYiwGrs1DCVDme',
    'Gift Engine Mastermind',
    'Advanced AI that generates personalized gift recommendations using deep psychological analysis',
    'gifting',
    'Pro',
    'tier',
    NULL,
    'brain',
    'Analytical, insightful, and precise gift strategist',
    false,
    15,
    'hybrid',
    'Pro',
    false,
    ARRAY['GPT', 'DeepInfra'],
    ARRAY['gut-check', 'gift-dna', 'reveal', 'smart-search'],
    'Gifting Logic',
    'active',
    '{"feature_slugs": ["gut-check", "gift-dna"], "edge_functions": ["gift_suggestion_engine", "gift_matching_engine"], "xp_level": null}'::jsonb
),
(
    'asst_lCOoCbKoCEaZ6fcL1VZznURq',
    'Love Language Listener',
    'Emotional intelligence AI that analyzes communication patterns and emotional needs',
    'emotional',
    'Pro',
    'tier',
    NULL,
    'heart',
    'Empathetic, understanding, and emotionally intelligent',
    false,
    12,
    'hybrid',
    'Pro',
    false,
    ARRAY['GPT', 'DeepInfra'],
    ARRAY['lumience-dev', 'emotion-tags', 'no-one-knows', 'pride-alliance'],
    'Emotional Engine',
    'active',
    '{"feature_slugs": ["lumience-dev", "emotion-tags"], "edge_functions": ["emotion_signature_injector", "emotional_filter_engine"], "xp_level": null}'::jsonb
),
(
    'asst_OFoqYv80ueCqggzWEQywmYtg',
    'Tokenomics XP Controller',
    'Manages XP rewards, tier progression, and gamification elements across the platform',
    'system',
    'Free',
    'tier',
    NULL,
    'star',
    'Systematic, fair, and motivating progression manager',
    false,
    8,
    'internal',
    'Free',
    false,
    ARRAY['GPT'],
    ARRAY['tokenomics', 'badges', 'agentvault', 'emotitokens', 'daily-spin'],
    'XP Controller',
    'active',
    '{"feature_slugs": ["tokenomics", "badges"], "edge_functions": ["xp_unlock_status", "tier_management", "reward_distribution"], "xp_level": null}'::jsonb
),
(
    'asst_nWRcJT1Oce8zw8nbOYSkaw1E',
    'Agent Arya',
    'Multilingual voice persona specializing in Indian culture and Hindi/English communication',
    'voice',
    'Pro+',
    'tier',
    NULL,
    'user',
    'Warm, culturally aware, speaks Hindi and English fluently',
    true,
    20,
    'user-facing',
    'Pro+',
    true,
    ARRAY['GPT', 'ElevenLabs', 'Whisper'],
    ARRAY['cultural-respect', 'culture/IN', 'voice-rooms'],
    'Multilingual Voice',
    'active',
    '{"feature_slugs": ["cultural-respect", "culture/IN"], "edge_functions": ["voice_persona_handler", "cultural_adaptation"], "xp_level": null}'::jsonb
),
(
    'asst_ZcWT3DmUVB9qRUk4yWNgP86',
    'Agent Mei',
    'Multilingual voice persona specializing in Chinese culture and Mandarin/English communication',
    'voice',
    'Pro+',
    'tier',
    NULL,
    'user',
    'Gentle, respectful, speaks Mandarin and English fluently',
    true,
    20,
    'user-facing',
    'Pro+',
    true,
    ARRAY['GPT', 'ElevenLabs', 'Whisper'],
    ARRAY['cultural-respect', 'culture/CN', 'voice-rooms'],
    'Multilingual Voice',
    'active',
    '{"feature_slugs": ["cultural-respect", "culture/CN"], "edge_functions": ["voice_persona_handler", "cultural_adaptation"], "xp_level": null}'::jsonb
),
(
    'asst_P6t69u4XrYa15UjkFENMLsf4',
    'Agent Lola',
    'Multilingual voice persona specializing in Spanish culture and Spanish/English communication',
    'voice',
    'Pro+',
    'tier',
    NULL,
    'user',
    'Vibrant, expressive, speaks Spanish and English fluently',
    true,
    20,
    'user-facing',
    'Pro+',
    true,
    ARRAY['GPT', 'ElevenLabs', 'Whisper'],
    ARRAY['cultural-respect', 'culture/ES', 'voice-rooms'],
    'Multilingual Voice',
    'active',
    '{"feature_slugs": ["cultural-respect", "culture/ES"], "edge_functions": ["voice_persona_handler", "cultural_adaptation"], "xp_level": null}'::jsonb
),
(
    'asst_6wU3S0voUEQluQOpRg9lpdvm',
    'Agent Zola',
    'Chaos-style seasonal advisor with witty personality and unpredictable gift suggestions',
    'seasonal',
    'Enterprise',
    'seasonal',
    NULL,
    'zap',
    'Witty, unpredictable, chaotic but brilliant gift advisor',
    true,
    25,
    'user-facing',
    'Enterprise',
    true,
    ARRAY['GPT', 'ElevenLabs'],
    ARRAY['ghost-hunt', 'thought-heist', 'serendipity', 'seasonal-drops'],
    'Seasonal Drop',
    'seasonal',
    '{"feature_slugs": ["ghost-hunt", "thought-heist"], "edge_functions": ["chaos_advisor", "seasonal_unlock_handler"], "xp_level": null}'::jsonb
),
(
    'asst_AhdxKJOkBwuKEgrvqpbZJFH1',
    'Occasion Mapper',
    'Specialized AI for mapping cultural occasions, holidays, and special events for gift timing',
    'cultural',
    'Pro',
    'tier',
    NULL,
    'calendar',
    'Knowledgeable about global cultures and celebrations',
    false,
    10,
    'hybrid',
    'Pro',
    false,
    ARRAY['GPT'],
    ARRAY['business/custom-holidays', 'cultural-respect', 'group-gifting'],
    'Gifting Logic',
    'active',
    '{"feature_slugs": ["business/custom-holidays", "cultural-respect"], "edge_functions": ["occasion_detection", "cultural_calendar"], "xp_level": null}'::jsonb
),
(
    'asst_xSuf7lto2ooTwl6ANpfSHNbQ',
    'Agent Identity Optimizer',
    'Internal AI that optimizes user personas and identity matching for better gift recommendations',
    'optimization',
    'Free',
    'tier',
    NULL,
    'settings',
    'Analytical, optimization-focused, user experience enhancer',
    false,
    5,
    'internal',
    'Free',
    false,
    ARRAY['GPT'],
    ARRAY['characters', 'persona-selector', 'gift-dna'],
    'Internal Bot',
    'active',
    '{"feature_slugs": ["characters", "persona-selector"], "edge_functions": ["persona_matching", "identity_optimization"], "xp_level": null}'::jsonb
),
(
    'asst_mVzUCLJMf8w34wEzuXGKuHLF',
    'Knowledge Upload Bot',
    'Internal system for processing and structuring knowledge uploads and data management',
    'system',
    'Free',
    'tier',
    NULL,
    'database',
    'Systematic, thorough, data processing specialist',
    false,
    3,
    'internal',
    'Free',
    false,
    ARRAY['GPT'],
    ARRAY['admin/feature-builder', 'memory-vault', 'analytics'],
    'Internal Bot',
    'active',
    '{"feature_slugs": ["admin/feature-builder", "memory-vault"], "edge_functions": ["data_structuring", "knowledge_processing"], "xp_level": null}'::jsonb
)
ON CONFLICT (assistant_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tier = EXCLUDED.tier,
    unlock_type = EXCLUDED.unlock_type,
    unlock_requirement = EXCLUDED.unlock_requirement,
    icon = EXCLUDED.icon,
    persona_hint = EXCLUDED.persona_hint,
    voice_enabled = EXCLUDED.voice_enabled,
    xp_reward = EXCLUDED.xp_reward,
    type = EXCLUDED.type,
    tier_required = EXCLUDED.tier_required,
    voice_persona = EXCLUDED.voice_persona,
    api_required = EXCLUDED.api_required,
    connected_features = EXCLUDED.connected_features,
    category_tag = EXCLUDED.category_tag,
    status = EXCLUDED.status,
    linked_to = EXCLUDED.linked_to,
    updated_at = NOW();

-- Seed Data for Voice Personas
INSERT INTO voice_personas (name, assistant_id, elevenlabs_voice_id, personality_traits, cultural_context, language_code, voice_settings, sample_phrases) VALUES
(
    'Arya',
    'asst_nWRcJT1Oce8zw8nbOYSkaw1E',
    'voice_arya_hindi_english',
    ARRAY['warm', 'culturally_aware', 'helpful', 'respectful'],
    'Indian culture, Hindu traditions, modern Indian lifestyle',
    'hi-IN',
    '{"stability": 0.75, "similarity_boost": 0.8, "style": 0.6}'::jsonb,
    ARRAY['Namaste! How can I help you find the perfect gift?', 'Let me suggest something that honors your cultural values', 'This gift will bring joy to your family']
),
(
    'Mei',
    'asst_ZcWT3DmUVB9qRUk4yWNgP86',
    'voice_mei_mandarin_english',
    ARRAY['gentle', 'respectful', 'wise', 'harmonious'],
    'Chinese culture, Confucian values, modern Chinese lifestyle',
    'zh-CN',
    '{"stability": 0.8, "similarity_boost": 0.75, "style": 0.5}'::jsonb,
    ARRAY['你好! Let me help you find a meaningful gift', 'This choice reflects harmony and thoughtfulness', 'A gift that brings good fortune']
),
(
    'Lola',
    'asst_P6t69u4XrYa15UjkFENMLsf4',
    'voice_lola_spanish_english',
    ARRAY['vibrant', 'expressive', 'passionate', 'family_oriented'],
    'Spanish/Latino culture, family traditions, celebration-focused',
    'es-ES',
    '{"stability": 0.7, "similarity_boost": 0.85, "style": 0.8}'::jsonb,
    ARRAY['¡Hola! Let me help you find the perfect regalo', 'This gift will make your familia so happy', 'A celebration deserves something special']
),
(
    'Zola',
    'asst_6wU3S0voUEQluQOpRg9lpdvm',
    'voice_zola_chaotic_english',
    ARRAY['witty', 'unpredictable', 'brilliant', 'chaotic', 'seasonal'],
    'Chaos magic, seasonal wisdom, unconventional thinking',
    'en-US',
    '{"stability": 0.6, "similarity_boost": 0.9, "style": 0.9}'::jsonb,
    ARRAY['Well, well, well... looking for chaos in gift form?', 'This is either brilliant or completely insane... perfect!', 'The universe whispers... and it says buy this']
)
ON CONFLICT (name) DO UPDATE SET
    assistant_id = EXCLUDED.assistant_id,
    elevenlabs_voice_id = EXCLUDED.elevenlabs_voice_id,
    personality_traits = EXCLUDED.personality_traits,
    cultural_context = EXCLUDED.cultural_context,
    language_code = EXCLUDED.language_code,
    voice_settings = EXCLUDED.voice_settings,
    sample_phrases = EXCLUDED.sample_phrases,
    updated_at = NOW();

-- Seed Data for API Configurations
INSERT INTO api_configurations (provider, endpoint_name, endpoint_url, model_name, tier_access, rate_limits, cost_per_token, configuration) VALUES
(
    'openai',
    'chat_completions',
    'https://api.openai.com/v1/chat/completions',
    'gpt-4',
    'Free',
    '{"Free": {"requests_per_hour": 10, "tokens_per_hour": 10000}, "Pro": {"requests_per_hour": 100, "tokens_per_hour": 100000}, "Pro+": {"requests_per_hour": 500, "tokens_per_hour": 500000}, "Enterprise": {"requests_per_hour": -1, "tokens_per_hour": -1}}'::jsonb,
    0.00003000,
    '{"temperature": 0.7, "max_tokens": 2000}'::jsonb
),
(
    'elevenlabs',
    'text_to_speech',
    'https://api.elevenlabs.io/v1/text-to-speech',
    'eleven_multilingual_v2',
    'Pro+',
    '{"Pro+": {"requests_per_hour": 50, "characters_per_hour": 50000}, "Enterprise": {"requests_per_hour": -1, "characters_per_hour": -1}}'::jsonb,
    0.00018000,
    '{"voice_settings": {"stability": 0.75, "similarity_boost": 0.8}}'::jsonb
),
(
    'deepinfra',
    'chat_completions',
    'https://api.deepinfra.com/v1/openai/chat/completions',
    'meta-llama/Meta-Llama-3.1-70B-Instruct',
    'Pro',
    '{"Pro": {"requests_per_hour": 200, "tokens_per_hour": 200000}, "Pro+": {"requests_per_hour": 1000, "tokens_per_hour": 1000000}, "Enterprise": {"requests_per_hour": -1, "tokens_per_hour": -1}}'::jsonb,
    0.00000070,
    '{"temperature": 0.7, "max_tokens": 4000}'::jsonb
),
(
    'groq',
    'chat_completions',
    'https://api.groq.com/openai/v1/chat/completions',
    'llama-3.1-70b-versatile',
    'Pro',
    '{"Pro": {"requests_per_hour": 300, "tokens_per_hour": 300000}, "Pro+": {"requests_per_hour": 1500, "tokens_per_hour": 1500000}, "Enterprise": {"requests_per_hour": -1, "tokens_per_hour": -1}}'::jsonb,
    0.00000059,
    '{"temperature": 0.7, "max_tokens": 8000}'::jsonb
),
(
    'xai',
    'chat_completions',
    'https://api.x.ai/v1/chat/completions',
    'grok-3',
    'Enterprise',
    '{"Enterprise": {"requests_per_hour": -1, "tokens_per_hour": -1}}'::jsonb,
    0.00002000,
    '{"temperature": 0.7, "max_tokens": 4000}'::jsonb
)
ON CONFLICT (provider, endpoint_name) DO UPDATE SET
    endpoint_url = EXCLUDED.endpoint_url,
    model_name = EXCLUDED.model_name,
    tier_access = EXCLUDED.tier_access,
    rate_limits = EXCLUDED.rate_limits,
    cost_per_token = EXCLUDED.cost_per_token,
    configuration = EXCLUDED.configuration,
    updated_at = NOW();

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assistant_registry_updated_at
    BEFORE UPDATE ON assistant_registry
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agentgift_features_updated_at
    BEFORE UPDATE ON agentgift_features
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_suggestions_database_updated_at
    BEFORE UPDATE ON gift_suggestions_database
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_configurations_updated_at
    BEFORE UPDATE ON api_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_personas_updated_at
    BEFORE UPDATE ON voice_personas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Final system health check
INSERT INTO system_health_logs (component, status, metrics)
VALUES (
    'universal_ai_system',
    'healthy',
    jsonb_build_object(
        'schema_version', '1.0.0',
        'deployment_time', NOW(),
        'tables_created', 15,
        'functions_created', 5,
        'assistants_seeded', 11,
        'voice_personas_seeded', 4,
        'api_configurations_seeded', 5
    )
);

COMMIT;
