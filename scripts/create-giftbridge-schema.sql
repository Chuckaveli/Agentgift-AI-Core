-- GiftBridge™ Database Schema
-- One World, One Gift at a Time™

-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Create GiftBridge nominations table
CREATE TABLE IF NOT EXISTS giftbridge_nominations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    story TEXT NOT NULL CHECK (char_length(story) <= 500),
    wishlist TEXT[] NOT NULL,
    nominator_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    nominator_name VARCHAR(255) NOT NULL,
    votes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'finalist', 'winner', 'rejected')),
    season VARCHAR(20) DEFAULT 'Q1_2024',
    admin_notes TEXT,
    is_monthly_winner BOOLEAN DEFAULT FALSE,
    is_global_winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create GiftBridge votes table
CREATE TABLE IF NOT EXISTS giftbridge_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nomination_id UUID REFERENCES giftbridge_nominations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    season VARCHAR(20) DEFAULT 'Q1_2024',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, season, nomination_id) -- One vote per user per nomination per season
);

-- Create GiftBridge seasons table
CREATE TABLE IF NOT EXISTS giftbridge_seasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    season_name VARCHAR(20) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    voting_end_date DATE NOT NULL,
    finale_date DATE,
    is_active BOOLEAN DEFAULT FALSE,
    total_prize_pool DECIMAL(10,2) DEFAULT 10000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create GiftBridge winners table
CREATE TABLE IF NOT EXISTS giftbridge_winners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nomination_id UUID REFERENCES giftbridge_nominations(id) ON DELETE CASCADE,
    season VARCHAR(20) NOT NULL,
    winner_type VARCHAR(20) NOT NULL CHECK (winner_type IN ('monthly', 'country', 'global')),
    country VARCHAR(100),
    prize_amount DECIMAL(10,2),
    prize_description TEXT,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fulfillment_status VARCHAR(20) DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'completed')),
    tracking_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create GiftBridge analytics table
CREATE TABLE IF NOT EXISTS giftbridge_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    nomination_id UUID REFERENCES giftbridge_nominations(id) ON DELETE SET NULL,
    country VARCHAR(100),
    season VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_giftbridge_nominations_status ON giftbridge_nominations(status);
CREATE INDEX IF NOT EXISTS idx_giftbridge_nominations_country ON giftbridge_nominations(country);
CREATE INDEX IF NOT EXISTS idx_giftbridge_nominations_season ON giftbridge_nominations(season);
CREATE INDEX IF NOT EXISTS idx_giftbridge_nominations_votes ON giftbridge_nominations(votes DESC);
CREATE INDEX IF NOT EXISTS idx_giftbridge_nominations_created_at ON giftbridge_nominations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_giftbridge_votes_user_season ON giftbridge_votes(user_id, season);
CREATE INDEX IF NOT EXISTS idx_giftbridge_votes_nomination ON giftbridge_votes(nomination_id);

CREATE INDEX IF NOT EXISTS idx_giftbridge_analytics_event_type ON giftbridge_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_giftbridge_analytics_created_at ON giftbridge_analytics(created_at DESC);

-- Enable Row Level Security
ALTER TABLE giftbridge_nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE giftbridge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE giftbridge_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE giftbridge_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE giftbridge_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nominations
CREATE POLICY "Anyone can view approved nominations" ON giftbridge_nominations
    FOR SELECT USING (status IN ('approved', 'finalist', 'winner'));

CREATE POLICY "Users can create nominations" ON giftbridge_nominations
    FOR INSERT WITH CHECK (auth.uid() = nominator_id);

CREATE POLICY "Users can view their own nominations" ON giftbridge_nominations
    FOR SELECT USING (auth.uid() = nominator_id);

-- RLS Policies for votes
CREATE POLICY "Users can view their own votes" ON giftbridge_votes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create votes" ON giftbridge_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for seasons (public read)
CREATE POLICY "Anyone can view seasons" ON giftbridge_seasons
    FOR SELECT USING (true);

-- RLS Policies for winners (public read)
CREATE POLICY "Anyone can view winners" ON giftbridge_winners
    FOR SELECT USING (true);

-- RLS Policies for analytics (restricted)
CREATE POLICY "Only service role can access analytics" ON giftbridge_analytics
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Insert initial season
INSERT INTO giftbridge_seasons (season_name, start_date, end_date, voting_end_date, finale_date, is_active)
VALUES 
    ('Q1_2024', '2024-01-01', '2024-03-31', '2024-03-25', '2024-03-31', TRUE),
    ('Q2_2024', '2024-04-01', '2024-06-30', '2024-06-25', '2024-06-30', FALSE),
    ('Q3_2024', '2024-07-01', '2024-09-30', '2024-09-25', '2024-09-30', FALSE),
    ('Q4_2024', '2024-10-01', '2024-12-31', '2024-12-25', '2024-12-31', FALSE)
ON CONFLICT (season_name) DO NOTHING;

-- Create functions for vote counting
CREATE OR REPLACE FUNCTION update_nomination_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE giftbridge_nominations 
        SET votes = votes + 1, updated_at = NOW()
        WHERE id = NEW.nomination_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE giftbridge_nominations 
        SET votes = votes - 1, updated_at = NOW()
        WHERE id = OLD.nomination_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote counting
DROP TRIGGER IF EXISTS trigger_update_vote_count ON giftbridge_votes;
CREATE TRIGGER trigger_update_vote_count
    AFTER INSERT OR DELETE ON giftbridge_votes
    FOR EACH ROW EXECUTE FUNCTION update_nomination_vote_count();

-- Create function to track analytics
CREATE OR REPLACE FUNCTION track_giftbridge_event(
    p_event_type VARCHAR(50),
    p_user_id UUID DEFAULT NULL,
    p_nomination_id UUID DEFAULT NULL,
    p_country VARCHAR(100) DEFAULT NULL,
    p_season VARCHAR(20) DEFAULT 'Q1_2024',
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO giftbridge_analytics (event_type, user_id, nomination_id, country, season, metadata)
    VALUES (p_event_type, p_user_id, p_nomination_id, p_country, p_season, p_metadata)
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON giftbridge_nominations TO authenticated;
GRANT SELECT, INSERT ON giftbridge_votes TO authenticated;
GRANT SELECT ON giftbridge_seasons TO authenticated;
GRANT SELECT ON giftbridge_winners TO authenticated;
GRANT EXECUTE ON FUNCTION track_giftbridge_event TO authenticated;

-- Admin permissions
GRANT ALL ON giftbridge_nominations TO service_role;
GRANT ALL ON giftbridge_votes TO service_role;
GRANT ALL ON giftbridge_seasons TO service_role;
GRANT ALL ON giftbridge_winners TO service_role;
GRANT ALL ON giftbridge_analytics TO service_role;
