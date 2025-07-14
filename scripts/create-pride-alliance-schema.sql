-- Pride Alliance Feature Schema
-- Supports LGBTQIA+ inclusive gifting with identity-aware suggestions, care kits, and seasonal quests

-- Pride quest completions tracking
CREATE TABLE IF NOT EXISTS pride_quest_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    quest_id VARCHAR(100) NOT NULL,
    quest_type VARCHAR(50) NOT NULL, -- 'pride_drops', 'ally_squad', 'care_kit', 'postcard'
    xp_earned INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    seasonal_bonus_applied BOOLEAN DEFAULT FALSE,
    
    UNIQUE(user_id, quest_id)
);

-- Ally squads for community missions
CREATE TABLE IF NOT EXISTS ally_squads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    member_count INTEGER DEFAULT 0,
    current_mission TEXT,
    xp_bonus INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Ally squad memberships
CREATE TABLE IF NOT EXISTS ally_squad_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    squad_id UUID NOT NULL REFERENCES ally_squads(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, squad_id)
);

-- Coming-out care kits
CREATE TABLE IF NOT EXISTS pride_care_kits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    template_id VARCHAR(50) NOT NULL, -- 'coming_out_support', 'transition_celebration', etc.
    recipient_name VARCHAR(100),
    personal_message TEXT,
    delivery_method VARCHAR(20) NOT NULL, -- 'text', 'voice', 'qr', 'email'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'created' -- 'created', 'sent', 'delivered', 'viewed'
);

-- LGBTQ+ friend nominations
CREATE TABLE IF NOT EXISTS pride_nominations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nominator_id UUID NOT NULL,
    nominee_name VARCHAR(100) NOT NULL,
    nomination_reason TEXT,
    preferred_gift_category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'fulfilled', 'declined'
    admin_notes TEXT
);

-- Identity-aware gifting filters (user preferences)
CREATE TABLE IF NOT EXISTS pride_identity_filters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    identity_tags TEXT[] NOT NULL, -- ['lesbian', 'gay', 'bisexual', 'transgender', etc.]
    filter_preferences JSONB, -- Additional filter settings
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Pride Alliance badges and achievements
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    badge_category VARCHAR(50) NOT NULL, -- 'pride_alliance', 'general', etc.
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    
    UNIQUE(user_id, badge_name)
);

-- Seasonal Pride events and multipliers
CREATE TABLE IF NOT EXISTS pride_seasonal_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    event_description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    xp_multiplier DECIMAL(3,2) DEFAULT 1.0,
    special_features JSONB, -- Event-specific features and unlocks
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift drop reactions for community engagement
CREATE TABLE IF NOT EXISTS pride_gift_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    gift_id UUID, -- Reference to gift/recommendation
    reaction_type VARCHAR(20) NOT NULL, -- 'love', 'support', 'celebrate', 'affirm'
    reaction_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pride_quest_completions_user_id ON pride_quest_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_pride_quest_completions_quest_type ON pride_quest_completions(quest_type);
CREATE INDEX IF NOT EXISTS idx_ally_squad_members_user_id ON ally_squad_members(user_id);
CREATE INDEX IF NOT EXISTS idx_ally_squad_members_squad_id ON ally_squad_members(squad_id);
CREATE INDEX IF NOT EXISTS idx_pride_care_kits_user_id ON pride_care_kits(user_id);
CREATE INDEX IF NOT EXISTS idx_pride_nominations_nominator_id ON pride_nominations(nominator_id);
CREATE INDEX IF NOT EXISTS idx_pride_identity_filters_user_id ON pride_identity_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_category ON user_badges(badge_category);
CREATE INDEX IF NOT EXISTS idx_pride_gift_reactions_user_id ON pride_gift_reactions(user_id);

-- Insert default ally squads
INSERT INTO ally_squads (name, description, member_count, current_mission, xp_bonus) VALUES
('Rainbow Warriors', 'Supporting LGBTQ+ youth through thoughtful gifting', 247, 'Send care packages to LGBTQ+ teens', 15),
('Pride Parents', 'Parents and allies supporting LGBTQ+ family members', 189, 'Create coming-out celebration kits', 20),
('Trans Allies', 'Supporting transgender community with affirming gifts', 156, 'Curate transition milestone gifts', 25),
('Queer Creatives', 'Artists and creators celebrating LGBTQ+ identity through gifts', 203, 'Design pride-themed gift collections', 18),
('Workplace Allies', 'Creating inclusive workplace gifting experiences', 134, 'Develop corporate pride initiatives', 22)
ON CONFLICT DO NOTHING;

-- Insert seasonal events
INSERT INTO pride_seasonal_events (event_name, event_description, start_date, end_date, xp_multiplier, special_features) VALUES
('Pride Month 2024', 'Celebrate identity and love with enhanced rewards', '2024-06-01', '2024-07-31', 1.5, '{"enhanced_care_kits": true, "rainbow_ui": true, "special_badges": ["Pride Champion", "Love Warrior"]}'),
('Coming Out Day 2024', 'Support those sharing their authentic selves', '2024-10-01', '2024-10-31', 1.3, '{"coming_out_templates": true, "support_resources": true, "special_badges": ["Courage Supporter"]}'),
('Trans Day of Remembrance 2024', 'Honor and support the transgender community', '2024-11-15', '2024-11-30', 1.4, '{"memorial_support": true, "trans_resources": true, "special_badges": ["Trans Ally Champion"]}')
ON CONFLICT DO NOTHING;

-- Function to increment squad member count
CREATE OR REPLACE FUNCTION increment_squad_member_count(squad_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE ally_squads 
    SET member_count = member_count + 1 
    WHERE id = squad_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add user XP (if not exists from main schema)
CREATE OR REPLACE FUNCTION add_user_xp(user_id UUID, xp_amount INTEGER, reason TEXT)
RETURNS VOID AS $$
BEGIN
    -- Update user profile XP
    UPDATE user_profiles 
    SET xp = xp + xp_amount,
        level = FLOOR((xp + xp_amount) / 1000) + 1,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Insert XP log entry
    INSERT INTO xp_logs (user_id, xp_amount, reason, created_at)
    VALUES (user_id, xp_amount, reason, NOW());
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ally squad member count
CREATE OR REPLACE FUNCTION update_squad_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE ally_squads SET member_count = member_count + 1 WHERE id = NEW.squad_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE ally_squads SET member_count = member_count - 1 WHERE id = OLD.squad_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_squad_member_count
    AFTER INSERT OR DELETE ON ally_squad_members
    FOR EACH ROW EXECUTE FUNCTION update_squad_member_count();

-- Comments for documentation
COMMENT ON TABLE pride_quest_completions IS 'Tracks completion of Pride Alliance seasonal quests with XP rewards';
COMMENT ON TABLE ally_squads IS 'Community groups for collaborative LGBTQ+ support missions';
COMMENT ON TABLE ally_squad_members IS 'User memberships in ally squads';
COMMENT ON TABLE pride_care_kits IS 'Coming-out and transition support care packages';
COMMENT ON TABLE pride_nominations IS 'User nominations of LGBTQ+ friends for surprise gifts';
COMMENT ON TABLE pride_identity_filters IS 'User identity preferences for personalized gift suggestions';
COMMENT ON TABLE user_badges IS 'Achievement badges including Pride Alliance exclusive tiers';
COMMENT ON TABLE pride_seasonal_events IS 'Seasonal events with XP multipliers and special features';
COMMENT ON TABLE pride_gift_reactions IS 'Community reactions to gifts for engagement tracking';
