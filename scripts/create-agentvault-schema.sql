-- AgentVault™ - Seasonal Live Auction Chamber Schema
-- Creates all tables, functions, and policies for the prestige auction system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main auction seasons table
CREATE TABLE IF NOT EXISTS agentvault_seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_name VARCHAR(50) NOT NULL, -- 'Spring 2025', 'Summer 2025', etc.
  season_type VARCHAR(20) NOT NULL, -- 'spring', 'summer', 'fall', 'winter'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  vault_coins_distributed INTEGER DEFAULT 0,
  total_bids INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VaultCoins balance and earning history
CREATE TABLE IF NOT EXISTS agentvault_coins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  last_earned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- VaultCoin earning transactions
CREATE TABLE IF NOT EXISTS agentvault_coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'earned', 'spent', 'refund'
  amount INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'emotitokens', 'bondcraft', 'sentiment_sync', etc.
  source_id UUID,
  description TEXT,
  season_id UUID REFERENCES agentvault_seasons(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auction rewards/items
CREATE TABLE IF NOT EXISTS agentvault_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID REFERENCES agentvault_seasons(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  tier VARCHAR(20) NOT NULL, -- 'common', 'uncommon', 'rare', 'legendary'
  starting_bid INTEGER NOT NULL,
  current_bid INTEGER DEFAULT 0,
  bid_increment INTEGER DEFAULT 10,
  max_stock INTEGER DEFAULT 1,
  current_stock INTEGER DEFAULT 1,
  image_url TEXT,
  rarity_aura VARCHAR(50), -- CSS class for visual effects
  ritual_requirement VARCHAR(100), -- Optional: specific ritual needed
  is_active BOOLEAN DEFAULT true,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live auction bids
CREATE TABLE IF NOT EXISTS agentvault_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reward_id UUID REFERENCES agentvault_rewards(id),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  bid_amount INTEGER NOT NULL,
  is_winning BOOLEAN DEFAULT false,
  is_final BOOLEAN DEFAULT false,
  anonymized_name VARCHAR(50), -- "Team Alpha", "Team Beta", etc.
  bid_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auction history and winners
CREATE TABLE IF NOT EXISTS agentvault_auction_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID REFERENCES agentvault_seasons(id),
  reward_id UUID REFERENCES agentvault_rewards(id),
  winning_company_id UUID NOT NULL,
  winning_user_id UUID NOT NULL,
  final_bid_amount INTEGER NOT NULL,
  total_bids INTEGER DEFAULT 0,
  claimed_at TIMESTAMP WITH TIME ZONE,
  reward_delivered BOOLEAN DEFAULT false,
  delivery_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company eligibility tracking
CREATE TABLE IF NOT EXISTS agentvault_eligibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  season_id UUID REFERENCES agentvault_seasons(id),
  is_eligible BOOLEAN DEFAULT false,
  qualification_score INTEGER DEFAULT 0,
  requirements_met JSONB DEFAULT '{}',
  qualified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, season_id)
);

-- Auction event logs for Orion narrator
CREATE TABLE IF NOT EXISTS agentvault_auction_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID REFERENCES agentvault_seasons(id),
  reward_id UUID REFERENCES agentvault_rewards(id),
  company_id UUID,
  user_id UUID,
  event_type VARCHAR(50) NOT NULL, -- 'bid_placed', 'bid_won', 'bid_lost', 'auction_start', etc.
  event_data JSONB DEFAULT '{}',
  orion_narration TEXT,
  emotion_intensity INTEGER DEFAULT 1, -- 1-10 scale for UI effects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agentvault_seasons_active ON agentvault_seasons(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_agentvault_coins_company ON agentvault_coins(company_id);
CREATE INDEX IF NOT EXISTS idx_agentvault_bids_reward ON agentvault_bids(reward_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agentvault_eligibility_season ON agentvault_eligibility(season_id, is_eligible);

-- Function to check if auction is currently active
CREATE OR REPLACE FUNCTION is_vault_auction_active()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM agentvault_seasons 
    WHERE is_active = true 
    AND NOW() BETWEEN start_date AND end_date
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get current active season
CREATE OR REPLACE FUNCTION get_active_vault_season()
RETURNS UUID AS $$
DECLARE
  season_id UUID;
BEGIN
  SELECT id INTO season_id
  FROM agentvault_seasons 
  WHERE is_active = true 
  AND NOW() BETWEEN start_date AND end_date
  LIMIT 1;
  
  RETURN season_id;
END;
$$ LANGUAGE plpgsql;

-- Function to place a bid
CREATE OR REPLACE FUNCTION place_vault_bid(
  p_reward_id UUID,
  p_company_id UUID,
  p_user_id UUID,
  p_bid_amount INTEGER,
  p_bid_message TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_season_id UUID;
  v_current_bid INTEGER;
  v_user_balance INTEGER;
  v_bid_increment INTEGER;
  v_anonymized_name VARCHAR(50);
  v_bid_id UUID;
  v_result JSONB;
BEGIN
  -- Check if auction is active
  IF NOT is_vault_auction_active() THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active auction season');
  END IF;

  -- Get active season
  v_season_id := get_active_vault_season();

  -- Check eligibility
  IF NOT EXISTS (
    SELECT 1 FROM agentvault_eligibility 
    WHERE company_id = p_company_id 
    AND season_id = v_season_id 
    AND is_eligible = true
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Company not eligible for this auction');
  END IF;

  -- Get reward details
  SELECT current_bid, bid_increment INTO v_current_bid, v_bid_increment
  FROM agentvault_rewards 
  WHERE id = p_reward_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward not found or inactive');
  END IF;

  -- Validate bid amount
  IF p_bid_amount <= v_current_bid THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bid must be higher than current bid');
  END IF;

  -- Check user balance
  SELECT balance INTO v_user_balance
  FROM agentvault_coins 
  WHERE company_id = p_company_id AND user_id = p_user_id;

  IF v_user_balance < p_bid_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient VaultCoins');
  END IF;

  -- Generate anonymized team name
  v_anonymized_name := 'Team ' || chr(65 + (random() * 25)::int) || chr(65 + (random() * 25)::int);

  -- Mark previous winning bids as not winning
  UPDATE agentvault_bids 
  SET is_winning = false 
  WHERE reward_id = p_reward_id;

  -- Place the bid
  INSERT INTO agentvault_bids (
    reward_id, company_id, user_id, bid_amount, 
    is_winning, anonymized_name, bid_message
  ) VALUES (
    p_reward_id, p_company_id, p_user_id, p_bid_amount,
    true, v_anonymized_name, p_bid_message
  ) RETURNING id INTO v_bid_id;

  -- Update reward current bid
  UPDATE agentvault_rewards 
  SET current_bid = p_bid_amount, updated_at = NOW()
  WHERE id = p_reward_id;

  -- Deduct VaultCoins (temporarily held)
  UPDATE agentvault_coins 
  SET balance = balance - p_bid_amount, updated_at = NOW()
  WHERE company_id = p_company_id AND user_id = p_user_id;

  -- Log the transaction
  INSERT INTO agentvault_coin_transactions (
    company_id, user_id, transaction_type, amount, 
    source, description, season_id
  ) VALUES (
    p_company_id, p_user_id, 'spent', p_bid_amount,
    'vault_bid', 'Bid placed on ' || (SELECT name FROM agentvault_rewards WHERE id = p_reward_id),
    v_season_id
  );

  -- Log auction event
  INSERT INTO agentvault_auction_logs (
    season_id, reward_id, company_id, user_id,
    event_type, event_data, emotion_intensity
  ) VALUES (
    v_season_id, p_reward_id, p_company_id, p_user_id,
    'bid_placed', 
    jsonb_build_object(
      'bid_amount', p_bid_amount,
      'anonymized_name', v_anonymized_name,
      'message', p_bid_message
    ),
    CASE 
      WHEN p_bid_amount > v_current_bid * 2 THEN 8
      WHEN p_bid_amount > v_current_bid * 1.5 THEN 6
      ELSE 4
    END
  );

  RETURN jsonb_build_object(
    'success', true,
    'bid_id', v_bid_id,
    'anonymized_name', v_anonymized_name,
    'new_current_bid', p_bid_amount
  );
END;
$$ LANGUAGE plpgsql;

-- Function to award VaultCoins
CREATE OR REPLACE FUNCTION award_vault_coins(
  p_company_id UUID,
  p_user_id UUID,
  p_amount INTEGER,
  p_source VARCHAR(50),
  p_source_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_season_id UUID;
BEGIN
  v_season_id := get_active_vault_season();

  -- Insert or update coins balance
  INSERT INTO agentvault_coins (company_id, user_id, balance, total_earned, last_earned_at)
  VALUES (p_company_id, p_user_id, p_amount, p_amount, NOW())
  ON CONFLICT (company_id, user_id)
  DO UPDATE SET 
    balance = agentvault_coins.balance + p_amount,
    total_earned = agentvault_coins.total_earned + p_amount,
    last_earned_at = NOW(),
    updated_at = NOW();

  -- Log transaction
  INSERT INTO agentvault_coin_transactions (
    company_id, user_id, transaction_type, amount,
    source, source_id, description, season_id
  ) VALUES (
    p_company_id, p_user_id, 'earned', p_amount,
    p_source, p_source_id, p_description, v_season_id
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE agentvault_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentvault_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentvault_coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentvault_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentvault_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentvault_auction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentvault_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentvault_auction_logs ENABLE ROW LEVEL SECURITY;

-- Public read access to seasons and rewards
CREATE POLICY "Public can view active seasons" ON agentvault_seasons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active rewards" ON agentvault_rewards
  FOR SELECT USING (is_active = true);

-- Users can view their own coins and transactions
CREATE POLICY "Users can view own coins" ON agentvault_coins
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own transactions" ON agentvault_coin_transactions
  FOR SELECT USING (user_id = auth.uid());

-- Eligible companies can place bids
CREATE POLICY "Eligible users can place bids" ON agentvault_bids
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM agentvault_eligibility e
      JOIN agentvault_seasons s ON e.season_id = s.id
      WHERE e.company_id = agentvault_bids.company_id
      AND e.is_eligible = true
      AND s.is_active = true
    )
  );

-- Public can view anonymized bids
CREATE POLICY "Public can view bids" ON agentvault_bids
  FOR SELECT USING (true);

-- Public can view auction history
CREATE POLICY "Public can view auction history" ON agentvault_auction_history
  FOR SELECT USING (true);

-- Users can view eligibility for their company
CREATE POLICY "Users can view company eligibility" ON agentvault_eligibility
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND company_id = agentvault_eligibility.company_id
    )
  );

-- Public can view auction logs (for Orion narrator)
CREATE POLICY "Public can view auction logs" ON agentvault_auction_logs
  FOR SELECT USING (true);

-- Insert initial seasonal data
INSERT INTO agentvault_seasons (season_name, season_type, start_date, end_date, is_active) VALUES
('Winter 2025', 'winter', '2025-02-01 00:00:00+00', '2025-02-07 23:59:59+00', false),
('Spring 2025', 'spring', '2025-05-01 00:00:00+00', '2025-05-07 23:59:59+00', false),
('Summer 2025', 'summer', '2025-08-01 00:00:00+00', '2025-08-07 23:59:59+00', false),
('Fall 2025', 'fall', '2025-11-01 00:00:00+00', '2025-11-07 23:59:59+00', false)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE agentvault_seasons IS 'AgentVault seasonal auction periods - 4 times per year, 7 days each';
COMMENT ON TABLE agentvault_coins IS 'VaultCoin balances earned through rituals and high-value activities';
COMMENT ON TABLE agentvault_rewards IS 'Auction rewards with tiers: common, uncommon, rare, legendary';
COMMENT ON TABLE agentvault_bids IS 'Live auction bids with anonymized team names';
COMMENT ON TABLE agentvault_auction_history IS 'Immutable record of auction winners and rewards claimed';
