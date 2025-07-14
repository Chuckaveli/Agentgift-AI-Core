-- Fix missing tables and columns for deployment

-- Create feature_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS feature_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    ui_type VARCHAR(50) NOT NULL DEFAULT 'tile',
    default_credit_cost INTEGER DEFAULT 1,
    default_xp_award INTEGER DEFAULT 25,
    template_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Add missing columns to registered_features if they don't exist
DO $$ 
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'registered_features' AND column_name = 'is_active') THEN
        ALTER TABLE registered_features ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Add show_locked_preview column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'registered_features' AND column_name = 'show_locked_preview') THEN
        ALTER TABLE registered_features ADD COLUMN show_locked_preview BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Add show_on_homepage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'registered_features' AND column_name = 'show_on_homepage') THEN
        ALTER TABLE registered_features ADD COLUMN show_on_homepage BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add hide_from_free_tier column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'registered_features' AND column_name = 'hide_from_free_tier') THEN
        ALTER TABLE registered_features ADD COLUMN hide_from_free_tier BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add usage_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'registered_features' AND column_name = 'usage_count') THEN
        ALTER TABLE registered_features ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create social_campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS social_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    required_hashtags TEXT[] DEFAULT '{}',
    optional_hashtags TEXT[] DEFAULT '{}',
    xp_reward INTEGER DEFAULT 50,
    badge_reward VARCHAR(100),
    min_posts_for_badge INTEGER DEFAULT 1,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table if it doesn't exist (needed for XP system)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE,
    email VARCHAR(255),
    display_name VARCHAR(100),
    tier VARCHAR(50) DEFAULT 'free_agent',
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    credits INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create xp_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS xp_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    xp_amount INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default feature templates
INSERT INTO feature_templates (name, description, ui_type, default_credit_cost, default_xp_award) VALUES
('Gift Finder Template', 'Interactive gift discovery with personality matching', 'quiz', 2, 50),
('Care Package Builder', 'Curated care packages for different occasions', 'form', 3, 75),
('Memory Jar Creator', 'Digital memory collection and sharing', 'modal', 1, 25),
('Pride Alliance Template', 'LGBTQ+ inclusive gifting features', 'tile', 2, 50)
ON CONFLICT DO NOTHING;

-- Insert default social campaigns
INSERT INTO social_campaigns (name, description, required_hashtags, optional_hashtags, xp_reward, badge_reward, min_posts_for_badge) VALUES
('Pride Month 2024', 'Celebrate identity and love with enhanced rewards', ARRAY['#AgentGifted', '#PrideMonth2024'], ARRAY['#LoveIsLove', '#PrideAlways'], 75, 'Pride Champion', 3),
('Gift Reveal Challenge', 'Share your perfect gift moments', ARRAY['#AgentGifted', '#GiftRevealChallenge'], ARRAY['#PerfectGift', '#GiftingMagic'], 50, 'Gift Revealer', 5),
('Coming Out Support', 'Supporting those sharing their authentic selves', ARRAY['#AgentGifted', '#ComingOutSupport'], ARRAY['#Courage', '#Authentic'], 60, 'Courage Supporter', 2)
ON CONFLICT DO NOTHING;

-- Insert some default registered features if table is empty
INSERT INTO registered_features (name, slug, description, credit_cost, xp_award, tier_access, ui_type, is_active, show_locked_preview, show_on_homepage, hide_from_free_tier, usage_count) VALUES
('GiftVerse Pride Alliance™', 'pride-alliance', 'Inclusive emotional gifting with identity-aware suggestions', 2, 50, ARRAY['premium_spy', 'pro_agent'], 'tile', true, true, true, false, 0),
('Gift Gut Check', 'gift-gut-check', 'AI-powered gift validation and improvement suggestions', 1, 25, ARRAY['free_agent', 'premium_spy'], 'modal', true, true, true, false, 0),
('Social Proof Verifier', 'social-proof-verifier', 'Share your AgentGift moments and earn XP', 1, 30, ARRAY['premium_spy', 'pro_agent'], 'tile', true, true, false, true, 0)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_templates_active ON feature_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_social_campaigns_active ON social_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_registered_features_active ON registered_features(is_active);
CREATE INDEX IF NOT EXISTS idx_registered_features_homepage ON registered_features(show_on_homepage);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_id ON xp_logs(user_id);

-- Comments for documentation
COMMENT ON TABLE feature_templates IS 'Templates for creating new features in the feature builder';
COMMENT ON TABLE social_campaigns IS 'Social media campaigns for community engagement';
COMMENT ON TABLE user_profiles IS 'User profile information including XP and tier data';
COMMENT ON TABLE xp_logs IS 'Log of all XP transactions for users';
