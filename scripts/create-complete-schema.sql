-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'pro_plus', 'enterprise')),
    xp_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    cultural_locale VARCHAR(10) DEFAULT 'en-US',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Features table
CREATE TABLE IF NOT EXISTS public.features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tier_required VARCHAR(20) DEFAULT 'free',
    xp_cost INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User feature usage tracking
CREATE TABLE IF NOT EXISTS public.user_feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES public.features(id) ON DELETE CASCADE,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- XP transactions
CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'earned', 'spent', 'bonus'
    source VARCHAR(100), -- feature name or activity
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cultural preferences
CREATE TABLE IF NOT EXISTS public.cultural_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    cultural_adaptation BOOLEAN DEFAULT true,
    holiday_reminders BOOLEAN DEFAULT true,
    cultural_gift_suggestions BOOLEAN DEFAULT true,
    respect_cultural_taboos BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift recommendations
CREATE TABLE IF NOT EXISTS public.gift_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255),
    occasion VARCHAR(100),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    recommendations JSONB,
    cultural_context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default features
INSERT INTO public.features (name, slug, description, category, tier_required, xp_cost) VALUES
('Gift DNA', 'gift-dna', 'AI-powered personality analysis for perfect gift matching', 'gifting', 'free', 0),
('Cultural Respect', 'cultural-respect', 'Ensure culturally appropriate and respectful gifting', 'culture', 'free', 0),
('Smart Search', 'smart-search', 'Intelligent gift discovery with AI-powered search', 'search', 'free', 0),
('Group Gifting', 'group-gifting', 'Coordinate group gifts and split costs', 'social', 'pro', 10),
('Emotion Tags', 'emotion-tags', 'Emotional intelligence for gift selection', 'analysis', 'pro', 15),
('Gift Gut Check', 'gift-gut-check', 'Validate your gift choices with AI feedback', 'validation', 'free', 5)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_tier ON public.users(tier);
CREATE INDEX IF NOT EXISTS idx_features_slug ON public.features(slug);
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_user_id ON public.user_feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cultural_preferences_user_id ON public.cultural_preferences(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON public.features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cultural_preferences_updated_at BEFORE UPDATE ON public.cultural_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
