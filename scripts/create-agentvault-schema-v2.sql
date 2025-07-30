-- AgentVault™ - Giftverse Mastermind AI Auction System
-- Updated schema for VibeCoins and team-based bidding

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean update)
DROP TABLE IF EXISTS agentvault_auction_logs CASCADE;
DROP TABLE IF EXISTS agentvault_auction_history CASCADE;
DROP TABLE IF EXISTS agentvault_bids CASCADE;
DROP TABLE IF EXISTS agentvault_rewards CASCADE;
DROP TABLE IF EXISTS agentvault_coin_transactions CASCADE;
DROP TABLE IF EXISTS agentvault_coins CASCADE;
DROP TABLE IF EXISTS agentvault_eligibility CASCADE;
DROP TABLE IF EXISTS agentvault_seasons CASCADE;

-- Auction status and timing control
CREATE TABLE vault_auction_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_auction_live BOOLEAN DEFAULT false,
  current_season VARCHAR(50), -- 'Spring 2025', 'Summer 2025', etc.
  auction_start_date TIMESTAMP WITH TIME ZONE,
  auction_end_date TIMESTAMP WITH TIME ZONE,
  phase VARCHAR(20) DEFAULT 'cooldown', -- 'start', 'bid', 'end', 'claim', 'cooldown'
  next_auction_date TIMESTAMP WITH TIME ZONE,
  total_participating_teams INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team VibeCoins balance (shared team currency)
CREATE TABLE vault_coin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL, -- company_id from existing system
  team_name VARCHAR(200),
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  min_xp_met BOOLEAN DEFAULT false,
  event_participation_count INTEGER DEFAULT 0,
  is_qualified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id)
);

-- VibeCoins earning/spending transactions
CREATE TABLE vault_coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'earned', 'spent', 'penalty', 'refund'
  amount INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'gift_off', 'emotitokens', 'emotioncraft', 'bid_placed', etc.
  source_id UUID,
  description TEXT,
  user_id UUID, -- who triggered the transaction
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auction reward items (15 per season)
CREATE TABLE vault_auction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  tier VARCHAR(20) NOT NULL, -- 'common', 'uncommon', 'rare'
  tier_emoji VARCHAR(10) DEFAULT '🟢', -- 🟢 Common, 🟡 Uncommon, 🔵 Rare
  starting_bid INTEGER DEFAULT 10,
  current_top_bid INTEGER DEFAULT 0,
  current_top_team_id UUID,
  current_top_team_name VARCHAR(200),
  bid_count INTEGER DEFAULT 0,
  image_url TEXT,
  rarity_aura VARCHAR(100), -- CSS classes for visual effects
  is_active BOOLEAN DEFAULT true,
  position_in_rotation INTEGER, -- 1-15 for seasonal rotation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live auction bids (teams can edit until auction ends)
CREATE TABLE vault_auction_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES vault_auction_items(id),
  team_id UUID NOT NULL,
  team_name VARCHAR(200),
  bid_amount INTEGER NOT NULL,
  is_current_winner BOOLEAN DEFAULT false,
  bid_message TEXT,
  submitted_by_user_id UUID NOT NULL,
  submitted_by_user_name VARCHAR(200),
  is_edited BOOLEAN DEFAULT false,
  edit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, team_id) -- One bid per team per item
);

-- Auction winners and reward distribution
CREATE TABLE vault_auction_winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season VARCHAR(50) NOT NULL,
  item_id UUID REFERENCES vault_auction_items(id),
  winning_team_id UUID NOT NULL,
  winning_team_name VARCHAR(200),
  final_bid_amount INTEGER NOT NULL,
  total_bids_on_item INTEGER DEFAULT 0,
  xp_distributed INTEGER DEFAULT 0,
  reward_claimed BOOLEAN DEFAULT false,
  reward_metadata JSONB DEFAULT '{}',
  won_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claimed_at TIMESTAMP WITH TIME ZONE
);

-- Team bid history tracking
CREATE TABLE vault_team_bid_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL,
  item_id UUID REFERENCES vault_auction_items(id),
  bid_amount INTEGER NOT NULL,
  action_type VARCHAR(20) NOT NULL, -- 'placed', 'edited', 'outbid'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL
);

-- Bid errors and penalties
CREATE TABLE vault_bid_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL,
  item_id UUID REFERENCES vault_auction_items(id),
  error_type VARCHAR(50) NOT NULL, -- 'insufficient_coins', 'bid_too_low', 'auction_closed'
  attempted_bid INTEGER,
  penalty_coins INTEGER DEFAULT 0,
  error_message TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auction participation tracking
CREATE TABLE auction_participation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL,
  season VARCHAR(50) NOT NULL,
  participation_type VARCHAR(50) NOT NULL, -- 'qualified', 'bid_placed', 'won_item', 'viewed_auction'
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_vault_auction_status_live ON vault_auction_status(is_auction_live);
CREATE INDEX idx_vault_coin_logs_team ON vault_coin_logs(team_id, is_qualified);
CREATE INDEX idx_vault_auction_items_active ON vault_auction_items(is_active, tier);
CREATE INDEX idx_vault_auction_bids_item ON vault_auction_bids(item_id, is_current_winner);
CREATE INDEX idx_vault_auction_bids_team ON vault_auction_bids(team_id);

-- Function to check if auction is currently live
CREATE OR REPLACE FUNCTION is_auction_live()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vault_auction_status 
    WHERE is_auction_live = true 
    AND NOW() BETWEEN auction_start_date AND auction_end_date
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get current auction status
CREATE OR REPLACE FUNCTION get_auction_status()
RETURNS TABLE(
  is_live BOOLEAN,
  phase VARCHAR(20),
  season VARCHAR(50),
  time_remaining INTERVAL,
  next_auction TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.is_auction_live,
    s.phase,
    s.current_season,
    CASE 
      WHEN s.is_auction_live THEN s.auction_end_date - NOW()
      ELSE NULL
    END,
    s.next_auction_date
  FROM vault_auction_status s
  ORDER BY s.updated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to place or edit a bid
CREATE OR REPLACE FUNCTION place_team_bid(
  p_item_id UUID,
  p_team_id UUID,
  p_team_name VARCHAR(200),
  p_bid_amount INTEGER,
  p_user_id UUID,
  p_user_name VARCHAR(200),
  p_bid_message TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_current_top_bid INTEGER;
  v_team_balance INTEGER;
  v_existing_bid INTEGER;
  v_is_edit BOOLEAN := false;
  v_result JSONB;
BEGIN
  -- Check if auction is live
  IF NOT is_auction_live() THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active auction right now');
  END IF;

  -- Check team qualification
  IF NOT EXISTS (
    SELECT 1 FROM vault_coin_logs 
    WHERE team_id = p_team_id AND is_qualified = true
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team not qualified for auction');
  END IF;

  -- Get item details
  SELECT current_top_bid INTO v_current_top_bid
  FROM vault_auction_items 
  WHERE id = p_item_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found or inactive');
  END IF;

  -- Get team balance
  SELECT balance INTO v_team_balance
  FROM vault_coin_logs 
  WHERE team_id = p_team_id;

  IF v_team_balance < p_bid_amount THEN
    -- Log error
    INSERT INTO vault_bid_errors (team_id, item_id, error_type, attempted_bid, error_message, user_id)
    VALUES (p_team_id, p_item_id, 'insufficient_coins', p_bid_amount, 'Insufficient VibeCoins', p_user_id);
    
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient VibeCoins');
  END IF;

  -- Check if bid is high enough (must exceed current by at least 1)
  IF p_bid_amount <= v_current_top_bid THEN
    INSERT INTO vault_bid_errors (team_id, item_id, error_type, attempted_bid, error_message, user_id)
    VALUES (p_team_id, p_item_id, 'bid_too_low', p_bid_amount, 'Bid must exceed current top bid', p_user_id);
    
    RETURN jsonb_build_object('success', false, 'error', 'Bid must exceed current top bid by at least 1 coin');
  END IF;

  -- Check if team already has a bid (edit vs new)
  SELECT bid_amount INTO v_existing_bid
  FROM vault_auction_bids 
  WHERE item_id = p_item_id AND team_id = p_team_id;

  IF FOUND THEN
    v_is_edit := true;
    -- Update existing bid
    UPDATE vault_auction_bids 
    SET 
      bid_amount = p_bid_amount,
      bid_message = p_bid_message,
      is_edited = true,
      edit_count = edit_count + 1,
      updated_at = NOW()
    WHERE item_id = p_item_id AND team_id = p_team_id;
  ELSE
    -- Insert new bid
    INSERT INTO vault_auction_bids (
      item_id, team_id, team_name, bid_amount, bid_message,
      submitted_by_user_id, submitted_by_user_name
    ) VALUES (
      p_item_id, p_team_id, p_team_name, p_bid_amount, p_bid_message,
      p_user_id, p_user_name
    );
  END IF;

  -- Update all bids for this item to not be current winner
  UPDATE vault_auction_bids 
  SET is_current_winner = false 
  WHERE item_id = p_item_id;

  -- Set this bid as current winner
  UPDATE vault_auction_bids 
  SET is_current_winner = true 
  WHERE item_id = p_item_id AND team_id = p_team_id;

  -- Update item with new top bid
  UPDATE vault_auction_items 
  SET 
    current_top_bid = p_bid_amount,
    current_top_team_id = p_team_id,
    current_top_team_name = p_team_name,
    bid_count = CASE WHEN v_is_edit THEN bid_count ELSE bid_count + 1 END,
    updated_at = NOW()
  WHERE id = p_item_id;

  -- Log bid history
  INSERT INTO vault_team_bid_history (team_id, item_id, bid_amount, action_type, user_id)
  VALUES (p_team_id, p_item_id, p_bid_amount, CASE WHEN v_is_edit THEN 'edited' ELSE 'placed' END, p_user_id);

  -- Log participation
  INSERT INTO auction_participation_logs (team_id, season, participation_type, details)
  SELECT p_team_id, current_season, 'bid_placed', 
    jsonb_build_object('item_id', p_item_id, 'bid_amount', p_bid_amount, 'is_edit', v_is_edit)
  FROM vault_auction_status WHERE is_auction_live = true;

  RETURN jsonb_build_object(
    'success', true,
    'is_edit', v_is_edit,
    'new_top_bid', p_bid_amount,
    'bid_count', (SELECT bid_count FROM vault_auction_items WHERE id = p_item_id)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to award VibeCoins to teams
CREATE OR REPLACE FUNCTION award_vibe_coins(
  p_team_id UUID,
  p_amount INTEGER,
  p_source VARCHAR(50),
  p_source_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update team balance
  INSERT INTO vault_coin_logs (team_id, balance, total_earned, last_activity_at)
  VALUES (p_team_id, p_amount, p_amount, NOW())
  ON CONFLICT (team_id)
  DO UPDATE SET 
    balance = vault_coin_logs.balance + p_amount,
    total_earned = vault_coin_logs.total_earned + p_amount,
    last_activity_at = NOW(),
    updated_at = NOW();

  -- Log transaction
  INSERT INTO vault_coin_transactions (
    team_id, transaction_type, amount, source, source_id, description, user_id
  ) VALUES (
    p_team_id, 'earned', p_amount, p_source, p_source_id, p_description, p_user_id
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE vault_auction_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_coin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_auction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_auction_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_team_bid_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_bid_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_participation_logs ENABLE ROW LEVEL SECURITY;

-- Public read access to auction status and items
CREATE POLICY "Public can view auction status" ON vault_auction_status
  FOR SELECT USING (true);

CREATE POLICY "Public can view active auction items" ON vault_auction_items
  FOR SELECT USING (is_active = true);

-- Authenticated users can view bids and leaderboard
CREATE POLICY "Authenticated users can view bids" ON vault_auction_bids
  FOR SELECT USING (auth.role() = 'authenticated');

-- Team members can view their own coin logs
CREATE POLICY "Team members can view own coins" ON vault_coin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND company_id = vault_coin_logs.team_id
    )
  );

-- Team leads can place bids
CREATE POLICY "Team leads can place bids" ON vault_auction_bids
  FOR INSERT WITH CHECK (
    submitted_by_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (role = 'team_lead' OR role = 'admin')
      AND company_id = vault_auction_bids.team_id
    )
  );

-- Team leads can edit their own bids
CREATE POLICY "Team leads can edit own bids" ON vault_auction_bids
  FOR UPDATE USING (
    team_id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (role = 'team_lead' OR role = 'admin')
    )
  );

-- Insert initial auction status
INSERT INTO vault_auction_status (
  is_auction_live, 
  current_season, 
  phase, 
  next_auction_date
) VALUES (
  false, 
  'Winter 2025', 
  'cooldown', 
  '2025-02-01 00:00:00+00'
) ON CONFLICT DO NOTHING;

-- Insert sample auction items for testing
INSERT INTO vault_auction_items (season, title, description, tier, tier_emoji, starting_bid, position_in_rotation) VALUES
('Winter 2025', '🎯 Team Strategy Session with CEO', 'Exclusive 2-hour strategy session with company leadership', 'rare', '🔵', 100, 1),
('Winter 2025', '🍕 Premium Team Lunch Experience', 'Catered gourmet lunch for your entire team', 'uncommon', '🟡', 50, 2),
('Winter 2025', '⚡ XP Boost Multiplier (7 days)', 'Double XP earnings for all team activities', 'common', '🟢', 25, 3),
('Winter 2025', '🏆 Custom Team Trophy', 'Personalized trophy with team achievements engraved', 'uncommon', '🟡', 75, 4),
('Winter 2025', '🎮 Team Gaming Tournament', 'Private gaming session with prizes for all participants', 'common', '🟢', 30, 5),
('Winter 2025', '🌟 VIP Parking Spots (1 month)', 'Reserved premium parking for team leads', 'uncommon', '🟡', 60, 6),
('Winter 2025', '🎨 Custom Team Swag Package', 'Branded merchandise designed specifically for your team', 'common', '🟢', 40, 7),
('Winter 2025', '🚀 Innovation Lab Access', '48-hour access to company innovation lab and resources', 'rare', '🔵', 120, 8),
('Winter 2025', '☕ Premium Coffee Bar Setup', 'Barista-quality coffee station for your team area', 'uncommon', '🟡', 80, 9),
('Winter 2025', '🎪 Team Building Adventure', 'Off-site team building experience with professional facilitator', 'rare', '🔵', 150, 10),
('Winter 2025', '📚 Learning & Development Budget', '$500 per team member for courses and certifications', 'rare', '🔵', 200, 11),
('Winter 2025', '🎵 Team Playlist Takeover', 'Control office music for one full week', 'common', '🟢', 20, 12),
('Winter 2025', '🏖️ Flexible Work Week', 'Team gets to choose their own schedules for one week', 'uncommon', '🟡', 90, 13),
('Winter 2025', '🎁 Mystery Gift Box', 'Surprise package with unknown valuable contents', 'uncommon', '🟡', 65, 14),
('Winter 2025', '👑 Executive Lunch Meeting', 'Team representatives join executive leadership lunch', 'rare', '🔵', 180, 15)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE vault_auction_status IS 'Controls auction timing and phase management';
COMMENT ON TABLE vault_coin_logs IS 'Team VibeCoins balances and qualification status';
COMMENT ON TABLE vault_auction_items IS '15 seasonal rewards with tier-based rarity';
COMMENT ON TABLE vault_auction_bids IS 'Live team bids with edit capability until auction ends';
COMMENT ON TABLE vault_auction_winners IS 'Immutable record of auction winners and XP distribution';
