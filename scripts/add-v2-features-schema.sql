-- V2.0 Features Database Schema Extensions

-- Reminder Scheduler
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255),
  date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- birthday, anniversary, holiday, just-because
  priority_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  notes TEXT,
  ai_recommended_gift TEXT,
  is_completed BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Companion Conversations
CREATE TABLE IF NOT EXISTS ai_companion_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  persona VARCHAR(50) NOT NULL, -- avelyn, galen, zola
  conversation_data JSONB NOT NULL,
  mood_analysis JSONB,
  recommendations TEXT[],
  credits_used INTEGER DEFAULT 1,
  session_duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Companion Personas
CREATE TABLE IF NOT EXISTS ai_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  personality_traits JSONB NOT NULL,
  avatar_url TEXT,
  specialty VARCHAR(255),
  greeting_message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Campaigns
CREATE TABLE IF NOT EXISTS campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL, -- love_language, long_distance, apology, celebration
  steps JSONB NOT NULL, -- array of steps with details
  required_features TEXT[], -- features needed to complete campaign
  mood_tags TEXT[],
  difficulty_level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
  estimated_cost_range VARCHAR(50),
  duration_days INTEGER,
  xp_reward INTEGER DEFAULT 200,
  required_tier VARCHAR(50) DEFAULT 'pro_agent',
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Campaign Progress
CREATE TABLE IF NOT EXISTS user_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  campaign_template_id UUID REFERENCES campaign_templates(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  progress_data JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active', -- active, paused, completed, abandoned
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Campaign Step Completions
CREATE TABLE IF NOT EXISTS campaign_step_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_campaign_id UUID REFERENCES user_campaigns(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  media_urls TEXT[]
);

-- Thought Logs (for AI Companion mood analysis)
CREATE TABLE IF NOT EXISTS thought_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood_score INTEGER, -- 1-10 scale
  emotions TEXT[],
  context VARCHAR(100), -- gift_planning, relationship, celebration, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipient Profiles (for better gift tracking)
CREATE TABLE IF NOT EXISTS recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(100), -- family, friend, colleague, partner
  birthday DATE,
  preferences TEXT[],
  dislikes TEXT[],
  gift_history JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_reminders_user_date ON reminders(user_id, date);
CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(type);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_companion_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_type ON campaign_templates(type);
CREATE INDEX IF NOT EXISTS idx_user_campaigns_user ON user_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_campaigns_status ON user_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_recipients_user ON recipients(user_id);

-- Insert Default AI Personas
INSERT INTO ai_personas (name, personality_traits, specialty, greeting_message, avatar_url) VALUES
('Avelyn', '{"traits": ["empathetic", "intuitive", "warm"], "communication_style": "gentle and encouraging", "expertise": "emotional intelligence"}', 'Emotional Gifting Coach', 'Hi there! I''m Avelyn, your emotional gifting companion. I''m here to help you connect hearts through meaningful gifts. What''s on your mind today?', '/avatars/avelyn.png'),
('Galen', '{"traits": ["analytical", "practical", "precise"], "communication_style": "clear and methodical", "expertise": "strategic planning"}', 'Strategic Gift Planner', 'Hello! I''m Galen, your strategic gifting advisor. I specialize in creating systematic approaches to perfect gift-giving. How can I help you plan something special?', '/avatars/galen.png'),
('Zola', '{"traits": ["creative", "spontaneous", "energetic"], "communication_style": "playful and inspiring", "expertise": "creative experiences"}', 'Creative Experience Designer', 'Hey there, gift-giver! I''m Zola, your creative gifting muse. I love turning ordinary moments into extraordinary memories. Ready to create some magic?', '/avatars/zola.png')
ON CONFLICT (name) DO NOTHING;

-- Insert Default Campaign Templates
INSERT INTO campaign_templates (name, description, type, steps, required_features, mood_tags, difficulty_level, estimated_cost_range, duration_days, xp_reward, required_tier) VALUES
('Love Language Journey', 'A 5-day personalized gift experience based on your partner''s love language', 'love_language', 
'[
  {"day": 1, "title": "Discover Their Language", "description": "Take the love language quiz together", "features": ["gift-dna-quiz"]},
  {"day": 2, "title": "Words of Affirmation", "description": "Create a personalized message reveal", "features": ["gift-reveal-viewer"]},
  {"day": 3, "title": "Quality Time", "description": "Plan a shared experience", "features": ["emotion-tags"]},
  {"day": 4, "title": "Physical Touch", "description": "Something cozy and comforting", "features": ["agent-gifty"]},
  {"day": 5, "title": "Acts of Service", "description": "Do something meaningful for them", "features": ["reminder-scheduler"]}
]'::jsonb, 
'{"gift-dna-quiz", "gift-reveal-viewer", "emotion-tags", "agent-gifty", "reminder-scheduler"}', 
'{"romantic", "thoughtful", "intimate"}', 'intermediate', '$50-150', 5, 250, 'pro_agent'),

('Long Distance Love', 'Bridge the gap with surprise deliveries and virtual experiences', 'long_distance',
'[
  {"day": 1, "title": "Surprise Package", "description": "Send a care package with local treats", "features": ["agent-gifty"]},
  {"day": 3, "title": "Virtual Date Night", "description": "Plan synchronized activities", "features": ["gift-campaigns"]},
  {"day": 5, "title": "Future Plans", "description": "Create a vision board together", "features": ["gift-reveal-viewer"]},
  {"day": 7, "title": "Memory Lane", "description": "Share a photo timeline gift", "features": ["emotion-tags"]}
]'::jsonb,
'{"agent-gifty", "gift-campaigns", "gift-reveal-viewer", "emotion-tags"}',
'{"romantic", "supportive", "hopeful"}', 'advanced', '$75-200', 7, 300, 'pro_agent'),

('Apology Arc', 'A thoughtful 3-step approach to making amends', 'apology',
'[
  {"day": 1, "title": "Acknowledge", "description": "Send a heartfelt message with a small gesture", "features": ["gift-reveal-viewer"]},
  {"day": 2, "title": "Action", "description": "Do something meaningful to show change", "features": ["reminder-scheduler"]},
  {"day": 3, "title": "Commitment", "description": "Promise future thoughtfulness", "features": ["gift-campaigns"]}
]'::jsonb,
'{"gift-reveal-viewer", "reminder-scheduler", "gift-campaigns"}',
'{"apologetic", "sincere", "hopeful"}', 'beginner', '$25-75', 3, 150, 'premium_spy')
ON CONFLICT (name) DO NOTHING;
