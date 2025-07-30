-- EmotiTokens Schema - Real-Time Emotional Trading Game
-- This creates all tables and functions needed for the EmotiTokens feature

-- Create token types table
CREATE TABLE IF NOT EXISTS emoti_token_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  description TEXT,
  color_hex VARCHAR(7) DEFAULT '#6366f1',
  xp_value INTEGER DEFAULT 15,
  monthly_allocation INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default token types
INSERT INTO emoti_token_types (token_name, display_name, emoji, description, color_hex, xp_value) VALUES
('compassion', 'Compassion', '❤️', 'Emotional care, helping others, showing empathy', '#ef4444', 15),
('wisdom', 'Wisdom', '🧠', 'Strategic insight, deep feedback, thoughtful guidance', '#8b5cf6', 20),
('energy', 'Energy', '⚡', 'Momentum, hype, encouragement, positive vibes', '#f59e0b', 10)
ON CONFLICT (token_name) DO NOTHING;

-- Create user token balances table
CREATE TABLE IF NOT EXISTS emoti_token_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_type_id UUID NOT NULL REFERENCES emoti_token_types(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  remaining_tokens INTEGER DEFAULT 0,
  total_allocated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, token_type_id, month_year)
);

-- Create token transactions table
CREATE TABLE IF NOT EXISTS emoti_token_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_type_id UUID NOT NULL REFERENCES emoti_token_types(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL,
  message TEXT NOT NULL,
  xp_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (sender_id != receiver_id),
  CHECK (LENGTH(message) >= 5 AND LENGTH(message) <= 200)
);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS emoti_token_leaderboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL,
  total_received INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  impact_score DECIMAL(10,2) DEFAULT 0,
  rank_position INTEGER,
  compassion_received INTEGER DEFAULT 0,
  wisdom_received INTEGER DEFAULT 0,
  energy_received INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_emoti_balances_user_month ON emoti_token_balances(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_emoti_transactions_sender ON emoti_token_transactions(sender_id, month_year);
CREATE INDEX IF NOT EXISTS idx_emoti_transactions_receiver ON emoti_token_transactions(receiver_id, month_year);
CREATE INDEX IF NOT EXISTS idx_emoti_leaderboard_month_rank ON emoti_token_leaderboards(month_year, rank_position);

-- Function to initialize monthly tokens for a user
CREATE OR REPLACE FUNCTION initialize_monthly_tokens(user_uuid UUID, target_month VARCHAR(7))
RETURNS VOID AS $$
BEGIN
  INSERT INTO emoti_token_balances (user_id, token_type_id, month_year, remaining_tokens, total_allocated)
  SELECT 
    user_uuid,
    ett.id,
    target_month,
    ett.monthly_allocation,
    ett.monthly_allocation
  FROM emoti_token_types ett
  ON CONFLICT (user_id, token_type_id, month_year) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send an emoti token
CREATE OR REPLACE FUNCTION send_emoti_token(
  sender_uuid UUID,
  receiver_uuid UUID,
  token_type_name VARCHAR(50),
  message_text TEXT
)
RETURNS JSON AS $$
DECLARE
  token_type_record RECORD;
  current_month VARCHAR(7);
  sender_balance INTEGER;
  transaction_id UUID;
  xp_to_award INTEGER;
BEGIN
  -- Get current month
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Get token type info
  SELECT * INTO token_type_record 
  FROM emoti_token_types 
  WHERE token_name = token_type_name;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid token type');
  END IF;
  
  -- Check sender's balance
  SELECT remaining_tokens INTO sender_balance
  FROM emoti_token_balances
  WHERE user_id = sender_uuid 
    AND token_type_id = token_type_record.id 
    AND month_year = current_month;
  
  IF sender_balance IS NULL OR sender_balance <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'You''ve used all your emotional tokens for the month. More coming soon!');
  END IF;
  
  -- Create transaction
  INSERT INTO emoti_token_transactions (
    sender_id, receiver_id, token_type_id, month_year, message, xp_awarded
  ) VALUES (
    sender_uuid, receiver_uuid, token_type_record.id, current_month, message_text, token_type_record.xp_value
  ) RETURNING id INTO transaction_id;
  
  -- Update sender's balance
  UPDATE emoti_token_balances 
  SET remaining_tokens = remaining_tokens - 1,
      updated_at = NOW()
  WHERE user_id = sender_uuid 
    AND token_type_id = token_type_record.id 
    AND month_year = current_month;
  
  -- Award XP to receiver (integrate with existing XP system)
  xp_to_award := token_type_record.xp_value;
  
  -- Update receiver's XP in user_profiles if the table exists
  UPDATE user_profiles 
  SET xp = COALESCE(xp, 0) + xp_to_award,
      updated_at = NOW()
  WHERE id = receiver_uuid;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Token sent successfully!',
    'transaction_id', transaction_id,
    'xp_awarded', xp_to_award
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update leaderboard
CREATE OR REPLACE FUNCTION update_emoti_leaderboard(target_month VARCHAR(7))
RETURNS VOID AS $$
BEGIN
  -- Delete existing leaderboard for the month
  DELETE FROM emoti_token_leaderboards WHERE month_year = target_month;
  
  -- Calculate and insert new leaderboard data
  INSERT INTO emoti_token_leaderboards (
    user_id, month_year, total_received, total_sent, impact_score,
    compassion_received, wisdom_received, energy_received
  )
  SELECT 
    u.id as user_id,
    target_month,
    COALESCE(received.total_received, 0) as total_received,
    COALESCE(sent.total_sent, 0) as total_sent,
    -- Impact score: weighted by token type values
    COALESCE(
      (received.compassion_count * 15) + 
      (received.wisdom_count * 20) + 
      (received.energy_count * 10), 0
    ) as impact_score,
    COALESCE(received.compassion_count, 0) as compassion_received,
    COALESCE(received.wisdom_count, 0) as wisdom_received,
    COALESCE(received.energy_count, 0) as energy_received
  FROM auth.users u
  LEFT JOIN (
    SELECT 
      receiver_id,
      COUNT(*) as total_received,
      COUNT(CASE WHEN ett.token_name = 'compassion' THEN 1 END) as compassion_count,
      COUNT(CASE WHEN ett.token_name = 'wisdom' THEN 1 END) as wisdom_count,
      COUNT(CASE WHEN ett.token_name = 'energy' THEN 1 END) as energy_count
    FROM emoti_token_transactions ett_trans
    JOIN emoti_token_types ett ON ett_trans.token_type_id = ett.id
    WHERE ett_trans.month_year = target_month
    GROUP BY receiver_id
  ) received ON u.id = received.receiver_id
  LEFT JOIN (
    SELECT sender_id, COUNT(*) as total_sent
    FROM emoti_token_transactions
    WHERE month_year = target_month
    GROUP BY sender_id
  ) sent ON u.id = sent.sender_id
  WHERE EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.id = u.id 
    AND up.tier IN ('premium_spy', 'pro_agent', 'agent_00g', 'admin', 'super_admin')
  )
  AND (COALESCE(received.total_received, 0) > 0 OR COALESCE(sent.total_sent, 0) > 0);
  
  -- Update rank positions
  UPDATE emoti_token_leaderboards 
  SET rank_position = ranked.rank_pos
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY impact_score DESC, total_received DESC) as rank_pos
    FROM emoti_token_leaderboards 
    WHERE month_year = target_month
  ) ranked
  WHERE emoti_token_leaderboards.id = ranked.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE emoti_token_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE emoti_token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE emoti_token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emoti_token_leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Token types are viewable by employees" ON emoti_token_types
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own token balances" ON emoti_token_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view transactions they're involved in" ON emoti_token_transactions
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Leaderboard is viewable by employees" ON emoti_token_leaderboards
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON emoti_token_types TO authenticated;
GRANT SELECT ON emoti_token_balances TO authenticated;
GRANT SELECT ON emoti_token_transactions TO authenticated;
GRANT SELECT ON emoti_token_leaderboards TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_monthly_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION send_emoti_token TO authenticated;
GRANT EXECUTE ON FUNCTION update_emoti_leaderboard TO authenticated;
