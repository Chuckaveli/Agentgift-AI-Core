-- Admin roles table for access control
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice session logs for tracking all voice interactions
CREATE TABLE IF NOT EXISTS voice_session_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    voice_name TEXT NOT NULL,
    greeting_message TEXT,
    session_status TEXT DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    total_interactions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin AI interactions for detailed voice command logging
CREATE TABLE IF NOT EXISTS admin_ai_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- 'voice_command', 'text_command', 'system_response'
    user_input TEXT,
    transcription TEXT,
    ai_response TEXT,
    voice_tone TEXT,
    confidence_score DECIMAL(3,2),
    command_category TEXT, -- 'xp_management', 'analytics', 'tokenomics', etc.
    execution_status TEXT DEFAULT 'completed',
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles extension for voice settings
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS selected_voice_id TEXT DEFAULT 'avelyn',
ADD COLUMN IF NOT EXISTS voice_settings JSONB DEFAULT '{"speed": 1.0, "pitch": 1.0, "auto_speak": true}';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_active ON admin_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_voice_session_logs_user_id ON voice_session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_session_logs_session_id ON voice_session_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_ai_interactions_session_id ON admin_ai_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_ai_interactions_user_id ON admin_ai_interactions(user_id);

-- Row Level Security
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_ai_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin roles viewable by admins" ON admin_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid() AND ar.is_active = true
        )
    );

CREATE POLICY "Voice sessions viewable by owner or admin" ON voice_session_logs
    FOR ALL USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid() AND ar.is_active = true
        )
    );

CREATE POLICY "AI interactions viewable by owner or admin" ON admin_ai_interactions
    FOR ALL USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid() AND ar.is_active = true
        )
    );

-- Insert default admin roles (replace with actual admin user IDs)
INSERT INTO admin_roles (user_id, role_name, permissions, is_active) VALUES
('00000000-0000-0000-0000-000000000000', 'super_admin', '{"all": true}', true)
ON CONFLICT DO NOTHING;
