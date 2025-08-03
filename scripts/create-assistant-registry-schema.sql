-- Create assistant_registry table
CREATE TABLE IF NOT EXISTS assistant_registry (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    assistant_id TEXT UNIQUE NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('Free', 'Pro', 'Pro+', 'Enterprise')),
    unlock_type TEXT NOT NULL CHECK (unlock_type IN ('tier', 'xp_level', 'loyalty_nft')),
    unlock_requirement INTEGER,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    persona_hint TEXT,
    voice_enabled BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    xp_reward INTEGER DEFAULT 5,
    interaction_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assistant_interactions table for logging
CREATE TABLE IF NOT EXISTS assistant_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    assistant_id TEXT NOT NULL,
    input_message TEXT NOT NULL,
    response_message TEXT,
    user_tier TEXT NOT NULL,
    user_xp_level INTEGER NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (assistant_id) REFERENCES assistant_registry(assistant_id)
);

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    tier TEXT DEFAULT 'Free' CHECK (tier IN ('Free', 'Pro', 'Pro+', 'Enterprise')),
    xp_level INTEGER DEFAULT 1,
    xp_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    has_loyalty_nft BOOLEAN DEFAULT false,
    loyalty_nfts TEXT[] DEFAULT '{}',
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create XP transactions table for audit trail
CREATE TABLE IF NOT EXISTS xp_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assistant_registry_tier ON assistant_registry(tier);
CREATE INDEX IF NOT EXISTS idx_assistant_registry_active ON assistant_registry(is_active);
CREATE INDEX IF NOT EXISTS idx_assistant_registry_category ON assistant_registry(category);
CREATE INDEX IF NOT EXISTS idx_assistant_interactions_user ON assistant_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_interactions_assistant ON assistant_interactions(assistant_id);
CREATE INDEX IF NOT EXISTS idx_assistant_interactions_created ON assistant_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions(user_id);

-- Enable Row Level Security
ALTER TABLE assistant_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assistant_registry
CREATE POLICY "Anyone can view active assistants" ON assistant_registry
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all assistants" ON assistant_registry
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR email = 'admin@agentgift.ai')
        )
    );

CREATE POLICY "Admins can manage assistants" ON assistant_registry
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR email = 'admin@agentgift.ai')
        )
    );

-- RLS Policies for assistant_interactions
CREATE POLICY "Users can view their own interactions" ON assistant_interactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own interactions" ON assistant_interactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all interactions" ON assistant_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR email = 'admin@agentgift.ai')
        )
    );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR email = 'admin@agentgift.ai')
        )
    );

-- RLS Policies for xp_transactions
CREATE POLICY "Users can view their own XP transactions" ON xp_transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert XP transactions" ON xp_transactions
    FOR INSERT WITH CHECK (true);

-- Function to add XP to user
CREATE OR REPLACE FUNCTION add_user_xp(user_id UUID, xp_amount INTEGER, reason TEXT DEFAULT 'Assistant interaction')
RETURNS void AS $$
BEGIN
    -- Update user XP and level
    UPDATE user_profiles 
    SET 
        xp_points = xp_points + xp_amount,
        level = GREATEST(1, (xp_points + xp_amount) / 100),
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Log XP transaction
    INSERT INTO xp_transactions (user_id, amount, reason, created_at)
    VALUES (user_id, xp_amount, reason, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update assistant interaction count
CREATE OR REPLACE FUNCTION update_assistant_interaction_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE assistant_registry 
    SET 
        interaction_count = interaction_count + 1,
        last_used = NOW(),
        updated_at = NOW()
    WHERE assistant_id = NEW.assistant_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update interaction count
CREATE TRIGGER assistant_interaction_count_trigger
    AFTER INSERT ON assistant_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_assistant_interaction_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_assistant_registry_updated_at 
    BEFORE UPDATE ON assistant_registry 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assistant_interactions_updated_at 
    BEFORE UPDATE ON assistant_interactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial assistant data with all provided OpenAI Assistant IDs
INSERT INTO assistant_registry (name, description, assistant_id, tier, unlock_type, unlock_requirement, category, icon, persona_hint, voice_enabled, xp_reward) VALUES
('Concierge Core', 'Central Intelligence Hub for comprehensive gift planning', 'asst_mDwC9xbBkSKPVoVpBYs4fbTw', 'Pro+', 'tier', null, 'Core Logic', 'Brain', null, true, 20),
('Gift Engine Mastermind', 'Ultimate AI-powered gift recommendation engine', 'asst_nG0Wk33h0SJYiwGrs1DCVDme', 'Pro+', 'tier', null, 'Gift Recommendations', 'Gift', null, true, 25),
('Love Language Listener', 'Emotional intelligence for perfect gift matching', 'asst_lCOoCbKoCEaZ6fcL1VZznURq', 'Free', 'tier', null, 'Emotion Matching', 'Heart', null, true, 10),
('Tokenomics XP Controller', 'Advanced economy and reward management system', 'asst_OFoqYv80ueCqggzWEQywmYtg', 'Enterprise', 'tier', null, 'XP/Rewards', 'Coins', null, false, 50),
('Occasion Mapper', 'Giftworthy date decoder and event planner', 'asst_AhdxKJOkBwuKEgrvqpbZJFH1', 'Pro', 'tier', null, 'Occasion Planning', 'Calendar', null, false, 15),
('Agent Identity Optimizer', 'Persona matcher for optimal gift personalization', 'asst_xSuf7lto2ooTwl6ANpfSHNbQ', 'Pro+', 'tier', null, 'Persona Matching', 'Users', null, true, 20),
('Knowledge Upload Bot', 'Data structuring for enhanced AI responses', 'asst_mVzUCLJMf8w34wEzuXGKuHLF', 'Pro+', 'tier', null, 'Data Processing', 'Activity', null, false, 15),
('Agent Zola', 'Chaos Concierge for unique gift solutions', 'asst_6wU3S0voUEQluQOpRg9lpdvm', 'Pro+', 'loyalty_nft', null, 'Special', 'Star', 'chaos', true, 30),
('Agent Lola', 'Spanish gifting persona and cultural expert', 'asst_P6t69u4XrYa15UjkFENMLsf4', 'Pro+', 'tier', null, 'Language Voice Bots', 'Languages', 'spanish', true, 20),
('Agent Arya', 'Hindi gifting persona for Indian traditions', 'asst_nWRcJT1Oce8zw8nbOYSkaw1E', 'Pro+', 'xp_level', 50, 'Language Voice Bots', 'Languages', 'hindi', true, 25),
('Agent Mei', 'Chinese gifting persona and cultural intelligence', 'asst_ZcWT3DmUVB9qRUk4yWNgP86', 'Pro+', 'xp_level', 50, 'Language Voice Bots', 'Languages', 'chinese', true, 25)
ON CONFLICT (assistant_id) DO NOTHING;

-- Create view for assistant analytics
CREATE OR REPLACE VIEW assistant_analytics AS
SELECT 
    ar.id,
    ar.name,
    ar.assistant_id,
    ar.tier,
    ar.category,
    ar.is_active,
    ar.xp_reward,
    COUNT(ai.id) as total_interactions,
    COUNT(DISTINCT ai.user_id) as unique_users,
    SUM(ai.tokens_used) as total_tokens,
    SUM(ai.cost) as total_cost,
    AVG(ai.tokens_used) as avg_tokens_per_interaction,
    MAX(ai.created_at) as last_interaction
FROM assistant_registry ar
LEFT JOIN assistant_interactions ai ON ar.assistant_id = ai.assistant_id
GROUP BY ar.id, ar.name, ar.assistant_id, ar.tier, ar.category, ar.is_active, ar.xp_reward;

-- Grant permissions for the view
GRANT SELECT ON assistant_analytics TO authenticated;

-- Create function to get user assistant access
CREATE OR REPLACE FUNCTION get_user_assistant_access(user_id UUID)
RETURNS TABLE (
    assistant_id TEXT,
    has_access BOOLEAN,
    unlock_progress INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ar.assistant_id,
        CASE 
            WHEN ar.unlock_type = 'tier' THEN
                CASE ar.tier
                    WHEN 'Free' THEN true
                    WHEN 'Pro' THEN up.tier IN ('Pro', 'Pro+', 'Enterprise')
                    WHEN 'Pro+' THEN up.tier IN ('Pro+', 'Enterprise')
                    WHEN 'Enterprise' THEN up.tier = 'Enterprise'
                    ELSE false
                END
            WHEN ar.unlock_type = 'xp_level' THEN
                up.level >= COALESCE(ar.unlock_requirement, 0)
            WHEN ar.unlock_type = 'loyalty_nft' THEN
                up.has_loyalty_nft OR array_length(up.loyalty_nfts, 1) > 0
            ELSE false
        END as has_access,
        CASE 
            WHEN ar.unlock_type = 'xp_level' AND ar.unlock_requirement IS NOT NULL THEN
                LEAST(100, (up.level * 100 / ar.unlock_requirement))
            ELSE 
                CASE 
                    WHEN ar.unlock_type = 'tier' THEN
                        CASE ar.tier
                            WHEN 'Free' THEN 100
                            WHEN 'Pro' THEN CASE WHEN up.tier IN ('Pro', 'Pro+', 'Enterprise') THEN 100 ELSE 0 END
                            WHEN 'Pro+' THEN CASE WHEN up.tier IN ('Pro+', 'Enterprise') THEN 100 ELSE 0 END
                            WHEN 'Enterprise' THEN CASE WHEN up.tier = 'Enterprise' THEN 100 ELSE 0 END
                            ELSE 0
                        END
                    ELSE 0
                END
        END as unlock_progress
    FROM assistant_registry ar
    CROSS JOIN user_profiles up
    WHERE up.id = user_id AND ar.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
