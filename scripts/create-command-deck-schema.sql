-- Create AI Bots Registry Table
CREATE TABLE IF NOT EXISTS ai_bots_registry (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_name VARCHAR(100) UNIQUE NOT NULL,
    bot_display_name VARCHAR(200) NOT NULL,
    bot_description TEXT,
    bot_icon VARCHAR(10) DEFAULT '🤖',
    bot_category VARCHAR(50) DEFAULT 'general',
    current_status VARCHAR(20) DEFAULT 'idle' CHECK (current_status IN ('active', 'idle', 'error', 'maintenance')),
    bot_config JSONB DEFAULT '{}',
    recent_metrics JSONB DEFAULT '{}',
    active_alerts INTEGER DEFAULT 0,
    recent_activity INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Assistant Interaction Logs Table (if not exists)
CREATE TABLE IF NOT EXISTS assistant_interaction_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    bot_name VARCHAR(100),
    action_type VARCHAR(50) NOT NULL,
    command_input TEXT,
    response_output TEXT,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error', 'pending')),
    error_message TEXT,
    processing_time_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Bot Performance Metrics Table
CREATE TABLE IF NOT EXISTS bot_performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_name VARCHAR(100) NOT NULL,
    metric_date DATE DEFAULT CURRENT_DATE,
    total_interactions INTEGER DEFAULT 0,
    successful_interactions INTEGER DEFAULT 0,
    failed_interactions INTEGER DEFAULT 0,
    average_response_time_ms FLOAT DEFAULT 0,
    uptime_percentage FLOAT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bot_name, metric_date)
);

-- Create Command History Table
CREATE TABLE IF NOT EXISTS command_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    command_text TEXT NOT NULL,
    bot_target VARCHAR(100),
    action_taken VARCHAR(50),
    command_result TEXT,
    voice_input BOOLEAN DEFAULT FALSE,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Bot Alerts Table
CREATE TABLE IF NOT EXISTS bot_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_name VARCHAR(100) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES user_profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default bots
INSERT INTO ai_bots_registry (bot_name, bot_display_name, bot_description, bot_icon, bot_category) VALUES
('ag-tokenomics-v3', 'AG Tokenomics v3 Bot', 'Manages XP, badges, and token economy systems', '🧮', 'economy'),
('emotional-signature-engine', 'Emotional Signature Engine Bot', 'Analyzes and processes emotional intelligence data', '🧠', 'intelligence'),
('gift-intel-blog-generator', 'Gift Intel Blog Generator Bot', 'Creates content and blog posts about gifting trends', '📢', 'content'),
('social-media-manager', 'Social Media Manager Bot', 'Handles social media posting and engagement', '📅', 'marketing'),
('giftverse-game-engine', 'Giftverse Game Engine Bot', 'Powers gamification and interactive experiences', '🎁', 'gaming'),
('silent-intent-detection', 'Silent Intent Detection Bot', 'Analyzes user behavior and predicts intentions', '🕵️‍♂️', 'intelligence'),
('voice-assistant-engine', 'Voice Assistant Engine Bot', 'Manages voice interactions and TTS/STT processing', '💬', 'interface'),
('referral-system', 'Referral System Bot', 'Handles user referrals and reward distribution', '👥', 'growth')
ON CONFLICT (bot_name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assistant_logs_user_id ON assistant_interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_bot_name ON assistant_interaction_logs(bot_name);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_created_at ON assistant_interaction_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_command_history_admin_id ON command_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_bot_alerts_bot_name ON bot_alerts(bot_name);
CREATE INDEX IF NOT EXISTS idx_bot_alerts_resolved ON bot_alerts(is_resolved);

-- Create function to update bot activity
CREATE OR REPLACE FUNCTION update_bot_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_bots_registry 
    SET 
        recent_activity = recent_activity + 1,
        last_activity = NOW(),
        updated_at = NOW()
    WHERE bot_name = NEW.bot_name;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update bot activity
DROP TRIGGER IF EXISTS trigger_update_bot_activity ON assistant_interaction_logs;
CREATE TRIGGER trigger_update_bot_activity
    AFTER INSERT ON assistant_interaction_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_bot_activity();

-- Create function to update performance metrics
CREATE OR REPLACE FUNCTION update_bot_metrics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO bot_performance_metrics (bot_name, metric_date, total_interactions, successful_interactions, failed_interactions)
    VALUES (NEW.bot_name, CURRENT_DATE, 1, 
            CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
            CASE WHEN NEW.status = 'error' THEN 1 ELSE 0 END)
    ON CONFLICT (bot_name, metric_date) 
    DO UPDATE SET
        total_interactions = bot_performance_metrics.total_interactions + 1,
        successful_interactions = bot_performance_metrics.successful_interactions + 
            CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
        failed_interactions = bot_performance_metrics.failed_interactions + 
            CASE WHEN NEW.status = 'error' THEN 1 ELSE 0 END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update metrics
DROP TRIGGER IF EXISTS trigger_update_bot_metrics ON assistant_interaction_logs;
CREATE TRIGGER trigger_update_bot_metrics
    AFTER INSERT ON assistant_interaction_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_bot_metrics();
