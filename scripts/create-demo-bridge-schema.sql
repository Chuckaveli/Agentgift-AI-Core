-- Demo Bridge Schema for AgentGift Giftverse
-- Creates tables for demo sessions, recipients, gift suggestions if they don't exist

-- Demo sessions table
CREATE TABLE IF NOT EXISTS demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payload JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'landing-demo',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consumed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Recipients table
CREATE TABLE IF NOT EXISTS recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birthday DATE,
  love_language TEXT,
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift suggestions table
CREATE TABLE IF NOT EXISTS gift_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('meaningful', 'unconventional', 'otb')),
  text TEXT NOT NULL,
  rationale TEXT,
  source TEXT DEFAULT 'demo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Update user_profiles table with demo tracking
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS demo_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS signup_source TEXT DEFAULT 'direct';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_demo_sessions_user_id ON demo_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_created_at ON demo_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_recipients_user_id ON recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_suggestions_user_id ON gift_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_suggestions_recipient_id ON gift_suggestions(recipient_id);

-- RLS Policies
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY IF NOT EXISTS "Users can view own demo sessions" ON demo_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view own recipients" ON recipients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view own gift suggestions" ON gift_suggestions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all data
CREATE POLICY IF NOT EXISTS "Service role can manage demo sessions" ON demo_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY IF NOT EXISTS "Service role can manage recipients" ON recipients
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY IF NOT EXISTS "Service role can manage gift suggestions" ON gift_suggestions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to clean up expired demo sessions
CREATE OR REPLACE FUNCTION cleanup_expired_demo_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM demo_sessions 
  WHERE expires_at < NOW() AND consumed = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run every hour
SELECT cron.schedule(
  'cleanup-expired-demos',
  '0 * * * *',
  'SELECT cleanup_expired_demo_sessions();'
);
