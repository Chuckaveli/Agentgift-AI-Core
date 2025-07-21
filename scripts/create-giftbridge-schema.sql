-- GiftBridge™ Database Schema
-- Global nomination and voting system

-- Create giftbridge_nominations table
CREATE TABLE IF NOT EXISTS giftbridge_nominations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    story TEXT NOT NULL,
    wishlist JSONB NOT NULL DEFAULT '[]',
    nominator_name VARCHAR(255) NOT NULL,
    nominator_user_id UUID,
    votes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'finalist', 'winner', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    season VARCHAR(20) DEFAULT 'Q1-2024'
);

-- Create giftbridge_votes table
CREATE TABLE IF NOT EXISTS giftbridge_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nomination_id UUID NOT NULL REFERENCES giftbridge_nominations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    season VARCHAR(20) DEFAULT 'Q1-2024',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(nomination_id, user_id, season)
);

-- Create giftbridge_seasons table
CREATE TABLE IF NOT EXISTS giftbridge_seasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    season_name VARCHAR(50) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    voting_start DATE NOT NULL,
    voting_end DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    max_votes_per_user INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(is_active) WHERE is_active = TRUE
);

-- Create giftbridge_winners table
CREATE TABLE IF NOT EXISTS giftbridge_winners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nomination_id UUID NOT NULL REFERENCES giftbridge_nominations(id),
    season VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    winner_type VARCHAR(20) NOT NULL CHECK (winner_type IN ('monthly', 'finalist', 'global')),
    prize_value DECIMAL(10,2),
    prize_description TEXT,
    awarded_at TIMESTAMP WITH TIME ZONE,
    fulfillment_status VARCHAR(20) DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create giftbridge_transactions table
CREATE TABLE IF NOT EXISTS giftbridge_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('nomination_fee', 'vote_reward', 'refund')),
    amount INTEGER NOT NULL,
    nomination_id UUID REFERENCES giftbridge_nominations(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create giftbridge_country_settings table
CREATE TABLE IF NOT EXISTS giftbridge_country_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country VARCHAR(100) NOT NULL UNIQUE,
    is_eligible BOOLEAN DEFAULT TRUE,
    max_monthly_winners INTEGER DEFAULT 1,
    local_currency VARCHAR(10) DEFAULT 'USD',
    shipping_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_giftbridge_nominations_status ON giftbridge_nominations(status);
CREATE INDEX IF NOT EXISTS idx_giftbridge_nominations_country ON giftbridge_nominations(country);
CREATE INDEX IF NOT EXISTS idx_giftbridge_nominations_season ON giftbridge_nominations(season);
CREATE INDEX IF NOT EXISTS idx_giftbridge_nominations_votes ON giftbridge_nominations(votes DESC);
CREATE INDEX IF NOT EXISTS idx_giftbridge_nominations_created_at ON giftbridge_nominations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_giftbridge_votes_nomination ON giftbridge_votes(nomination_id);
CREATE INDEX IF NOT EXISTS idx_giftbridge_votes_user ON giftbridge_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_giftbridge_votes_season ON giftbridge_votes(season);
CREATE INDEX IF NOT EXISTS idx_giftbridge_winners_season ON giftbridge_winners(season);
CREATE INDEX IF NOT EXISTS idx_giftbridge_winners_country ON giftbridge_winners(country);
CREATE INDEX IF NOT EXISTS idx_giftbridge_winners_type ON giftbridge_winners(winner_type);
CREATE INDEX IF NOT EXISTS idx_giftbridge_transactions_user ON giftbridge_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_giftbridge_transactions_type ON giftbridge_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_giftbridge_transactions_created_at ON giftbridge_transactions(created_at DESC);

-- Create function to update nomination vote count
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

-- Create trigger to automatically update vote counts
DROP TRIGGER IF EXISTS trigger_update_nomination_vote_count ON giftbridge_votes;
CREATE TRIGGER trigger_update_nomination_vote_count
    AFTER INSERT OR DELETE ON giftbridge_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_nomination_vote_count();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_giftbridge_nominations_updated_at
    BEFORE UPDATE ON giftbridge_nominations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial season data
INSERT INTO giftbridge_seasons (season_name, start_date, end_date, voting_start, voting_end, is_active) 
VALUES (
    'Q1-2024', 
    '2024-01-01', 
    '2024-03-31', 
    '2024-01-01', 
    '2024-03-31', 
    TRUE
) ON CONFLICT (season_name) DO NOTHING;

-- Insert sample country eligibility data
INSERT INTO giftbridge_country_settings (country, is_eligible, max_monthly_winners, local_currency, shipping_enabled) VALUES
('United States', TRUE, 3, 'USD', TRUE),
('Canada', TRUE, 2, 'CAD', TRUE),
('United Kingdom', TRUE, 2, 'GBP', TRUE),
('Australia', TRUE, 2, 'AUD', TRUE),
('Germany', TRUE, 2, 'EUR', TRUE),
('France', TRUE, 2, 'EUR', TRUE),
('Japan', TRUE, 2, 'JPY', TRUE),
('Brazil', TRUE, 2, 'BRL', TRUE),
('India', TRUE, 3, 'INR', TRUE),
('Mexico', TRUE, 2, 'MXN', TRUE)
ON CONFLICT (country) DO NOTHING;

-- Create RLS policies
ALTER TABLE giftbridge_nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE giftbridge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE giftbridge_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE giftbridge_transactions ENABLE ROW LEVEL SECURITY;

-- Public read access for approved nominations
CREATE POLICY "Public can view approved nominations" ON giftbridge_nominations
    FOR SELECT USING (status IN ('approved', 'finalist', 'winner'));

-- Users can view their own nominations
CREATE POLICY "Users can view own nominations" ON giftbridge_nominations
    FOR SELECT USING (nominator_user_id = auth.uid());

-- Users can create nominations
CREATE POLICY "Users can create nominations" ON giftbridge_nominations
    FOR INSERT WITH CHECK (nominator_user_id = auth.uid());

-- Users can view votes
CREATE POLICY "Users can view votes" ON giftbridge_votes
    FOR SELECT USING (TRUE);

-- Users can create votes
CREATE POLICY "Users can create votes" ON giftbridge_votes
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON giftbridge_transactions
    FOR SELECT USING (user_id = auth.uid());

-- Public can view winners
CREATE POLICY "Public can view winners" ON giftbridge_winners
    FOR SELECT USING (TRUE);

COMMENT ON TABLE giftbridge_nominations IS 'Global gift nominations submitted by users';
COMMENT ON TABLE giftbridge_votes IS 'Community votes for nominations';
COMMENT ON TABLE giftbridge_seasons IS 'Voting seasons and periods';
COMMENT ON TABLE giftbridge_winners IS 'Monthly and global winners';
COMMENT ON TABLE giftbridge_transactions IS 'Credit transactions for nominations and rewards';
COMMENT ON TABLE giftbridge_country_settings IS 'Country-specific eligibility and settings';
