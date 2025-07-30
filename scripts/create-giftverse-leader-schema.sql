-- Giftverse Leader AI Dashboard Schema
-- Voice-interactive admin system with strategic intelligence

-- Admin voice settings for personalized AI interaction
CREATE TABLE IF NOT EXISTS admin_voice_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_voice TEXT DEFAULT 'avelyn' CHECK (selected_voice IN ('avelyn', 'galen', 'sage', 'echo')),
  voice_speed DECIMAL(3,2) DEFAULT 1.0 CHECK (voice_speed >= 0.5 AND voice_speed <= 2.0),
  auto_speak BOOLEAN DEFAULT true,
  stealth_mode BOOLEAN DEFAULT false,
  analysis_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice interaction transcripts for audit and learning
CREATE TABLE IF NOT EXISTS admin_ai_voice_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  transcript_type TEXT NOT NULL CHECK (transcript_type IN ('speech_to_text', 'text_to_speech', 'ai_response')),
  content TEXT NOT NULL,
  voice_assistant TEXT DEFAULT 'avelyn',
  confidence_score DECIMAL(4,3),
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced admin dashboard logs for strategic tracking
CREATE TABLE IF NOT EXISTS admin_dashboard_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_detail TEXT,
  request_data JSONB,
  response_data JSONB,
  execution_status TEXT DEFAULT 'pending' CHECK (execution_status IN ('pending', 'completed', 'failed', 'cancelled')),
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emotional intelligence tracking for strategic insights
CREATE TABLE IF NOT EXISTS emotional_tag_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  emotion_tags TEXT[] NOT NULL,
  intensity_score DECIMAL(3,2) CHECK (intensity_score >= 0 AND intensity_score <= 5),
  context_data JSONB,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User emotional journey breadcrumbs
CREATE TABLE IF NOT EXISTS mood_breadcrumbs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_state TEXT NOT NULL,
  trigger_event TEXT,
  emotional_intensity DECIMAL(3,2),
  feature_context TEXT,
  breadcrumb_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategic intelligence cache for performance
CREATE TABLE IF NOT EXISTS strategic_intelligence_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  intelligence_type TEXT NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_admin_voice_settings_admin_id ON admin_voice_settings(admin_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_admin_session ON admin_ai_voice_transcripts(admin_id, session_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_created_at ON admin_ai_voice_transcripts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_logs_admin_session ON admin_dashboard_logs(admin_id, session_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_logs_created_at ON admin_dashboard_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emotional_tags_user_created ON emotional_tag_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emotional_tags_feature ON emotional_tag_logs(feature_name);
CREATE INDEX IF NOT EXISTS idx_mood_breadcrumbs_user_created ON mood_breadcrumbs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_strategic_cache_key ON strategic_intelligence_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_strategic_cache_expires ON strategic_intelligence_cache(expires_at);

-- Row Level Security (RLS) policies
ALTER TABLE admin_voice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_ai_voice_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_dashboard_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_tag_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_breadcrumbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_intelligence_cache ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admin voice settings access" ON admin_voice_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin voice transcripts access" ON admin_ai_voice_transcripts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin dashboard logs access" ON admin_dashboard_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin emotional tags access" ON emotional_tag_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin mood breadcrumbs access" ON mood_breadcrumbs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

CREATE POLICY "Admin strategic cache access" ON strategic_intelligence_cache
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.admin_role = true
    )
  );

-- Insert default voice settings for existing admins
INSERT INTO admin_voice_settings (admin_id, selected_voice, voice_speed, auto_speak)
SELECT id, 'avelyn', 1.0, true
FROM user_profiles 
WHERE admin_role = true
ON CONFLICT (admin_id) DO NOTHING;

-- Create function to automatically create voice settings for new admins
CREATE OR REPLACE FUNCTION create_admin_voice_settings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.admin_role = true AND OLD.admin_role IS DISTINCT FROM NEW.admin_role THEN
    INSERT INTO admin_voice_settings (admin_id, selected_voice, voice_speed, auto_speak)
    VALUES (NEW.id, 'avelyn', 1.0, true)
    ON CONFLICT (admin_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create voice settings for new admins
DROP TRIGGER IF EXISTS trigger_create_admin_voice_settings ON user_profiles;
CREATE TRIGGER trigger_create_admin_voice_settings
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_admin_voice_settings();
