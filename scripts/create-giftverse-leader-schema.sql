-- Giftverse Leader AI Dashboard Schema
-- Voice-interactive admin system with strategic intelligence

-- Admin AI Voice Transcripts
CREATE TABLE IF NOT EXISTS admin_ai_voice_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  transcript_type VARCHAR(20) NOT NULL CHECK (transcript_type IN ('speech_to_text', 'text_to_speech')),
  content TEXT NOT NULL,
  voice_assistant VARCHAR(50), -- 'avelyn', 'galen', etc.
  confidence_score DECIMAL(3,2),
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Dashboard Logs
CREATE TABLE IF NOT EXISTS admin_dashboard_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  action_detail TEXT,
  target_system VARCHAR(100), -- 'tokenomics_bot', 'gift_intel_bot', etc.
  request_data JSONB DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  execution_status VARCHAR(20) DEFAULT 'pending',
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice Assistant Settings
CREATE TABLE IF NOT EXISTS admin_voice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  selected_voice VARCHAR(50) DEFAULT 'avelyn',
  voice_speed DECIMAL(3,2) DEFAULT 1.0,
  voice_pitch DECIMAL(3,2) DEFAULT 1.0,
  auto_speak BOOLEAN DEFAULT true,
  stealth_logging BOOLEAN DEFAULT false,
  analysis_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emotional Tag Logs (for trend analysis)
CREATE TABLE IF NOT EXISTS emotional_tag_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL,
  emotion_tags TEXT[] DEFAULT '{}',
  intensity_score DECIMAL(3,2),
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood Breadcrumbs (for emotional journey tracking)
CREATE TABLE IF NOT EXISTS mood_breadcrumbs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  mood_state VARCHAR(50) NOT NULL,
  trigger_event VARCHAR(100),
  emotional_intensity DECIMAL(3,2),
  breadcrumb_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Giftverse Bot Commands
CREATE TABLE IF NOT EXISTS giftverse_bot_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  bot_type VARCHAR(50) NOT NULL, -- 'tokenomics', 'gift_intel', 'voice_manager', 'badge_engine'
  command_text TEXT NOT NULL,
  command_params JSONB DEFAULT '{}',
  execution_status VARCHAR(20) DEFAULT 'pending',
  bot_response JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategic Intelligence Cache
CREATE TABLE IF NOT EXISTS strategic_intelligence_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  intelligence_type VARCHAR(100) NOT NULL, -- 'emotional_trends', 'gifting_patterns', 'user_behavior'
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_admin_session ON admin_ai_voice_transcripts(admin_id, session_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_logs_admin_action ON admin_dashboard_logs(admin_id, action_type);
CREATE INDEX IF NOT EXISTS idx_emotional_tags_user_feature ON emotional_tag_logs(user_id, feature_name);
CREATE INDEX IF NOT EXISTS idx_mood_breadcrumbs_user_time ON mood_breadcrumbs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_bot_commands_admin_bot ON giftverse_bot_commands(admin_id, bot_type);
CREATE INDEX IF NOT EXISTS idx_intelligence_cache_key ON strategic_intelligence_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_intelligence_cache_expires ON strategic_intelligence_cache(expires_at);

-- Insert default voice assistants
INSERT INTO admin_voice_settings (admin_id, selected_voice) VALUES
  ('00000000-0000-0000-0000-000000000000', 'avelyn') -- Default admin placeholder
ON CONFLICT (admin_id) DO NOTHING;
