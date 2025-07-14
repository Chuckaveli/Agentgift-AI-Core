-- Complete Supabase Setup Script
-- Run this entire script in your Supabase SQL Editor to fix all deployment issues

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create feature_templates table (missing table causing build error)
CREATE TABLE IF NOT EXISTS public.feature_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    ui_type VARCHAR(50) NOT NULL DEFAULT 'tile',
    default_credit_cost INTEGER DEFAULT 1,
    default_xp_award INTEGER DEFAULT 25,
    template_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create social_campaigns table (missing table causing build error)
CREATE TABLE IF NOT EXISTS public.social_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- 3. Fix registered_features table - add missing columns
DO $$ 
BEGIN
    -- Check if registered_features table exists, create if not
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registered_features') THEN
        CREATE TABLE public.registered_features (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            credit_cost INTEGER DEFAULT 1,
            xp_award INTEGER DEFAULT 25,
            tier_access TEXT[] DEFAULT '{"free_agent"}',
            ui_type VARCHAR(50) DEFAULT 'tile',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Add missing columns to registered_features
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'registered_features' AND column_name = 'is_active') THEN
        ALTER TABLE public.registered_features ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'registered_features' AND column_name = 'show_locked_preview') THEN
        ALTER TABLE public.registered_features ADD COLUMN show_locked_preview BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'registered_features' AND column_name = 'show_on_homepage') THEN
        ALTER TABLE public.registered_features ADD COLUMN show_on_homepage BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'registered_features' AND column_name = 'hide_from_free_tier') THEN
        ALTER TABLE public.registered_features ADD COLUMN hide_from_free_tier BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'registered_features' AND column_name = 'usage_count') THEN
        ALTER TABLE public.registered_features ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 4. Create user_profiles table for XP system
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID UNIQUE,
    email VARCHAR(255),
    display_name VARCHAR(100),
    tier VARCHAR(50) DEFAULT 'free_agent',
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    credits INTEGER DEFAULT 100,
    badges TEXT[] DEFAULT '{}',
    cultural_preferences JSONB DEFAULT '{}',
    identity_filters TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create xp_logs table for tracking XP transactions
CREATE TABLE IF NOT EXISTS public.xp_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    xp_amount INTEGER NOT NULL,
    reason TEXT,
    feature_used VARCHAR(100),
    quest_completed VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create pride_alliance_quests table for Pride Alliance feature
CREATE TABLE IF NOT EXISTS public.pride_alliance_quests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    quest_id VARCHAR(100) NOT NULL,
    quest_type VARCHAR(50) NOT NULL,
    progress INTEGER DEFAULT 0,
    max_progress INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    xp_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, quest_id)
);

-- 7. Create ally_squads table
CREATE TABLE IF NOT EXISTS public.ally_squads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    member_count INTEGER DEFAULT 0,
    current_mission TEXT,
    xp_bonus INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create ally_squad_members table
CREATE TABLE IF NOT EXISTS public.ally_squad_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    squad_id UUID NOT NULL REFERENCES public.ally_squads(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, squad_id)
);

-- 9. Create care_kits table for tracking sent care kits
CREATE TABLE IF NOT EXISTS public.care_kits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID NOT NULL,
    recipient_name VARCHAR(100),
    template_id VARCHAR(100),
    personal_message TEXT,
    delivery_method VARCHAR(50) DEFAULT 'text',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    xp_awarded INTEGER DEFAULT 40
);

-- 10. Insert default data for feature_templates
INSERT INTO public.feature_templates (name, description, ui_type, default_credit_cost, default_xp_award, template_config) VALUES
('Gift Finder Template', 'Interactive gift discovery with personality matching', 'quiz', 2, 50, '{"questions": 5, "categories": ["personal", "interests", "budget"]}'),
('Care Package Builder', 'Curated care packages for different occasions', 'form', 3, 75, '{"components": ["message", "items", "delivery"], "max_items": 10}'),
('Memory Jar Creator', 'Digital memory collection and sharing', 'modal', 1, 25, '{"max_memories": 50, "sharing_options": ["private", "family", "public"]}'),
('Pride Alliance Template', 'LGBTQ+ inclusive gifting features', 'tile', 2, 50, '{"identity_filters": true, "care_kits": true, "seasonal_quests": true}'),
('Social Proof Verifier', 'Verify and share gift experiences', 'modal', 1, 30, '{"platforms": ["instagram", "twitter", "tiktok"], "hashtag_tracking": true}')
ON CONFLICT DO NOTHING;

-- 11. Insert default data for social_campaigns
INSERT INTO public.social_campaigns (name, description, required_hashtags, optional_hashtags, xp_reward, badge_reward, min_posts_for_badge, start_date, end_date) VALUES
('Pride Month 2024', 'Celebrate identity and love with enhanced rewards', ARRAY['#AgentGifted', '#PrideMonth2024'], ARRAY['#LoveIsLove', '#PrideAlways', '#PrideMonth'], 75, 'Pride Champion', 3, '2024-06-01', '2024-07-31'),
('Gift Reveal Challenge', 'Share your perfect gift moments', ARRAY['#AgentGifted', '#GiftRevealChallenge'], ARRAY['#PerfectGift', '#GiftingMagic', '#Surprise'], 50, 'Gift Revealer', 5, '2024-01-01', '2024-12-31'),
('Coming Out Support', 'Supporting those sharing their authentic selves', ARRAY['#AgentGifted', '#ComingOutSupport'], ARRAY['#Courage', '#Authentic', '#Support'], 60, 'Courage Supporter', 2, '2024-10-01', '2024-10-31'),
('Holiday Gifting Spree', 'Spread joy during the holiday season', ARRAY['#AgentGifted', '#HolidayGifting'], ARRAY['#HolidayJoy', '#Giving', '#Family'], 40, 'Holiday Hero', 7, '2024-11-01', '2025-01-15')
ON CONFLICT DO NOTHING;

-- 12. Insert default data for registered_features
INSERT INTO public.registered_features (name, slug, description, credit_cost, xp_award, tier_access, ui_type, is_active, show_locked_preview, show_on_homepage, hide_from_free_tier, usage_count) VALUES
('GiftVerse Pride Alliance™', 'pride-alliance', 'Inclusive emotional gifting with identity-aware suggestions, coming-out care kits, and seasonal quests', 2, 50, ARRAY['premium_spy', 'pro_agent'], 'tile', true, true, true, false, 0),
('Gift Gut Check', 'gift-gut-check', 'AI-powered gift validation and improvement suggestions', 1, 25, ARRAY['free_agent', 'premium_spy', 'pro_agent'], 'modal', true, true, true, false, 0),
('Social Proof Verifier', 'social-proof-verifier', 'Share your AgentGift moments and earn XP through social media', 1, 30, ARRAY['premium_spy', 'pro_agent'], 'tile', true, true, false, true, 0),
('Agent Gifty', 'agent-gifty', 'Create personalized gift drops with custom messages and QR codes', 3, 75, ARRAY['pro_agent'], 'tile', true, true, true, true, 0),
('Cultural Intelligence', 'cultural-respect', 'Navigate cultural gifting with AI-powered cultural awareness', 2, 40, ARRAY['premium_spy', 'pro_agent'], 'tile', true, true, false, false, 0)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    credit_cost = EXCLUDED.credit_cost,
    xp_award = EXCLUDED.xp_award,
    tier_access = EXCLUDED.tier_access,
    ui_type = EXCLUDED.ui_type,
    is_active = EXCLUDED.is_active,
    show_locked_preview = EXCLUDED.show_locked_preview,
    show_on_homepage = EXCLUDED.show_on_homepage,
    hide_from_free_tier = EXCLUDED.hide_from_free_tier,
    updated_at = NOW();

-- 13. Insert default ally squads
INSERT INTO public.ally_squads (name, description, member_count, current_mission, xp_bonus) VALUES
('Rainbow Warriors', 'Supporting LGBTQ+ youth through thoughtful gifting', 247, 'Send care packages to LGBTQ+ teens', 15),
('Pride Parents', 'Parents and allies supporting LGBTQ+ family members', 189, 'Create coming-out celebration kits', 20),
('Trans Allies', 'Supporting transgender community with affirming gifts', 156, 'Curate transition milestone gifts', 25),
('Queer Creatives', 'Artists and creators spreading love through gifts', 98, 'Design pride-themed gift collections', 18),
('Workplace Allies', 'Creating inclusive workplace gifting culture', 134, 'Develop professional pride gift guides', 22)
ON CONFLICT DO NOTHING;

-- 14. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_templates_active ON public.feature_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_feature_templates_ui_type ON public.feature_templates(ui_type);

CREATE INDEX IF NOT EXISTS idx_social_campaigns_active ON public.social_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_social_campaigns_dates ON public.social_campaigns(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_registered_features_active ON public.registered_features(is_active);
CREATE INDEX IF NOT EXISTS idx_registered_features_homepage ON public.registered_features(show_on_homepage);
CREATE INDEX IF NOT EXISTS idx_registered_features_slug ON public.registered_features(slug);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON public.user_profiles(tier);

CREATE INDEX IF NOT EXISTS idx_xp_logs_user_id ON public.xp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_created_at ON public.xp_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_pride_quests_user_id ON public.pride_alliance_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_pride_quests_completed ON public.pride_alliance_quests(completed);

CREATE INDEX IF NOT EXISTS idx_ally_squad_members_user_id ON public.ally_squad_members(user_id);
CREATE INDEX IF NOT EXISTS idx_ally_squad_members_squad_id ON public.ally_squad_members(squad_id);

CREATE INDEX IF NOT EXISTS idx_care_kits_sender_id ON public.care_kits(sender_id);
CREATE INDEX IF NOT EXISTS idx_care_kits_sent_at ON public.care_kits(sent_at);

-- 15. Enable Row Level Security (RLS) for all tables
ALTER TABLE public.feature_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registered_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pride_alliance_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ally_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ally_squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_kits ENABLE ROW LEVEL SECURITY;

-- 16. Create RLS policies for public read access (needed for the app to work)
-- Feature templates - public read
CREATE POLICY "Public read access for feature_templates" ON public.feature_templates
    FOR SELECT USING (is_active = true);

-- Social campaigns - public read
CREATE POLICY "Public read access for social_campaigns" ON public.social_campaigns
    FOR SELECT USING (is_active = true);

-- Registered features - public read
CREATE POLICY "Public read access for registered_features" ON public.registered_features
    FOR SELECT USING (is_active = true);

-- Ally squads - public read
CREATE POLICY "Public read access for ally_squads" ON public.ally_squads
    FOR SELECT USING (is_active = true);

-- User profiles - users can read/write their own data
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- XP logs - users can read their own logs
CREATE POLICY "Users can view own xp_logs" ON public.xp_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp_logs" ON public.xp_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pride quests - users can manage their own quests
CREATE POLICY "Users can view own pride_quests" ON public.pride_alliance_quests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pride_quests" ON public.pride_alliance_quests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pride_quests" ON public.pride_alliance_quests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ally squad members - users can manage their own memberships
CREATE POLICY "Users can view own squad_memberships" ON public.ally_squad_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own squad_memberships" ON public.ally_squad_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own squad_memberships" ON public.ally_squad_members
    FOR DELETE USING (auth.uid() = user_id);

-- Care kits - users can manage their own care kits
CREATE POLICY "Users can view own care_kits" ON public.care_kits
    FOR SELECT USING (auth.uid() = sender_id);

CREATE POLICY "Users can insert own care_kits" ON public.care_kits
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 17. Add helpful comments for documentation
COMMENT ON TABLE public.feature_templates IS 'Templates for creating new features in the feature builder admin panel';
COMMENT ON TABLE public.social_campaigns IS 'Social media campaigns for community engagement and XP rewards';
COMMENT ON TABLE public.registered_features IS 'All registered features available in the platform with access control';
COMMENT ON TABLE public.user_profiles IS 'User profile information including XP, level, tier, and preferences';
COMMENT ON TABLE public.xp_logs IS 'Log of all XP transactions for users with reasons and timestamps';
COMMENT ON TABLE public.pride_alliance_quests IS 'Pride Alliance specific quests and progress tracking';
COMMENT ON TABLE public.ally_squads IS 'Community groups for LGBTQ+ allies and supporters';
COMMENT ON TABLE public.ally_squad_members IS 'Membership tracking for ally squads';
COMMENT ON TABLE public.care_kits IS 'Tracking of sent care kits for coming-out support and celebrations';

-- 18. Create a function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 19. Create triggers for updated_at columns
CREATE TRIGGER update_feature_templates_updated_at BEFORE UPDATE ON public.feature_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_campaigns_updated_at BEFORE UPDATE ON public.social_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registered_features_updated_at BEFORE UPDATE ON public.registered_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pride_quests_updated_at BEFORE UPDATE ON public.pride_alliance_quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ally_squads_updated_at BEFORE UPDATE ON public.ally_squads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'AgentGift.ai database setup completed successfully!';
    RAISE NOTICE 'Created tables: feature_templates, social_campaigns, user_profiles, xp_logs, pride_alliance_quests, ally_squads, ally_squad_members, care_kits';
    RAISE NOTICE 'Added missing columns to registered_features table';
    RAISE NOTICE 'Inserted default data for all tables';
    RAISE NOTICE 'Created indexes for performance optimization';
    RAISE NOTICE 'Enabled Row Level Security with appropriate policies';
    RAISE NOTICE 'Your deployment should now work without errors!';
END $$;
