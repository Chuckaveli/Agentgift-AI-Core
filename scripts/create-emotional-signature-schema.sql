-- Emotional Signature Engine™ Database Schema
-- This powers AgentGift.ai's emotional intelligence layer for gift prediction
-- Integrates with Supabase and Make.com webhooks

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Emotional signatures table - stores parsed emotional data from various sources
CREATE TABLE IF NOT EXISTS emotional_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_label VARCHAR(50) NOT NULL, -- 'Gmail', 'Manual', 'API', etc.
    sender_email VARCHAR(255) NOT NULL,
    raw_content TEXT, -- Original message/content
    parsed_emotion VARCHAR(50) NOT NULL, -- Primary detected emotion
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    context_label VARCHAR(100) NOT NULL, -- 'Breakup', 'Graduation', 'Grief', etc.
    summary_snippet TEXT NOT NULL, -- AI-generated summary
    suggested_action VARCHAR(200), -- Internal routing suggestion
    processed BOOLEAN DEFAULT FALSE,
    webhook_sent BOOLEAN DEFAULT FALSE,
    webhook_response JSONB, -- Store Make.com webhook response
    metadata JSONB, -- Additional context data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emotional contexts table - predefined contexts for classification
CREATE TABLE IF NOT EXISTS emotional_contexts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    suggested_routing VARCHAR(200), -- Which AgentGift system to route to
    priority_level INTEGER DEFAULT 1, -- 1=low, 5=high
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emotional analytics table - aggregated data for dashboard
CREATE TABLE IF NOT EXISTS emotional_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    emotion VARCHAR(50) NOT NULL,
    context VARCHAR(100) NOT NULL,
    count INTEGER DEFAULT 1,
    avg_confidence DECIMAL(5,2),
    webhook_success_count INTEGER DEFAULT 0,
    webhook_failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, emotion, context)
);

-- Webhook logs table - track Make.com integration
CREATE TABLE IF NOT EXISTS emotional_webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signature_id UUID REFERENCES emotional_signatures(id),
    webhook_url VARCHAR(500),
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body JSONB,
    success BOOLEAN DEFAULT FALSE,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default emotional contexts
INSERT INTO emotional_contexts (context_name, description, suggested_routing, priority_level) VALUES
('Breakup', 'Relationship ending or romantic distress', 'Auto-route to LUMIENCE™', 5),
('Graduation', 'Educational milestone achievement', 'Flag for BondCraft™ ritual trigger', 3),
('Grief', 'Loss of loved one or mourning', 'Sync to Just-Because Gift Loop', 5),
('Anniversary', 'Relationship or milestone anniversary', 'Flag for BondCraft™ ritual trigger', 4),
('Illness', 'Health challenges or recovery', 'Sync to Just-Because Gift Loop', 4),
('Promotion', 'Career advancement or achievement', 'Flag for BondCraft™ ritual trigger', 3),
('Birthday', 'Birthday celebration', 'Flag for BondCraft™ ritual trigger', 3),
('Wedding', 'Marriage ceremony or engagement', 'Flag for BondCraft™ ritual trigger', 4),
('New Baby', 'Birth or adoption announcement', 'Flag for BondCraft™ ritual trigger', 4),
('Moving', 'Relocation or new home', 'Sync to Just-Because Gift Loop', 2),
('Job Loss', 'Employment termination or career change', 'Auto-route to LUMIENCE™', 4),
('Anxiety', 'Stress or anxiety expression', 'Auto-route to LUMIENCE™', 3),
('Depression', 'Signs of depression or sadness', 'Auto-route to LUMIENCE™', 5),
('Celebration', 'General celebration or joy', 'Flag for BondCraft™ ritual trigger', 2),
('Apology', 'Seeking forgiveness or making amends', 'Sync to Just-Because Gift Loop', 3)
ON CONFLICT (context_name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_emotional_signatures_timestamp ON emotional_signatures(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_emotional_signatures_emotion ON emotional_signatures(parsed_emotion);
CREATE INDEX IF NOT EXISTS idx_emotional_signatures_context ON emotional_signatures(context_label);
CREATE INDEX IF NOT EXISTS idx_emotional_signatures_processed ON emotional_signatures(processed);
CREATE INDEX IF NOT EXISTS idx_emotional_analytics_date ON emotional_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_signature ON emotional_webhook_logs(signature_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to emotional_signatures
CREATE TRIGGER update_emotional_signatures_updated_at 
    BEFORE UPDATE ON emotional_signatures 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (remove in production)
INSERT INTO emotional_signatures (
    source_label, sender_email, raw_content, parsed_emotion, 
    confidence_score, context_label, summary_snippet, suggested_action
) VALUES
('Gmail', 'sarah@example.com', 'I can''t believe we broke up after 3 years...', 'sadness', 92, 'Breakup', 'User expressing deep sadness about relationship ending after 3 years', 'Auto-route to LUMIENCE™'),
('Gmail', 'mike@example.com', 'Just graduated from college! Time to celebrate!', 'joy', 88, 'Graduation', 'User celebrating college graduation milestone', 'Flag for BondCraft™ ritual trigger'),
('Manual', 'lisa@example.com', 'Mom passed away last week. Still processing everything.', 'grief', 95, 'Grief', 'User dealing with loss of mother, in mourning process', 'Sync to Just-Because Gift Loop'),
('Gmail', 'john@example.com', 'Got the promotion I''ve been working towards!', 'excitement', 85, 'Promotion', 'User excited about career advancement and promotion', 'Flag for BondCraft™ ritual trigger'),
('Gmail', 'emma@example.com', 'Feeling really anxious about the presentation tomorrow', 'anxiety', 78, 'Anxiety', 'User expressing anxiety about upcoming work presentation', 'Auto-route to LUMIENCE™');

-- Create view for dashboard analytics
CREATE OR REPLACE VIEW emotional_dashboard_stats AS
SELECT 
    COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '7 days') as emotions_tagged_week,
    (SELECT json_agg(emotion_counts) FROM (
        SELECT parsed_emotion as emotion, COUNT(*) as count 
        FROM emotional_signatures 
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY parsed_emotion 
        ORDER BY count DESC 
        LIMIT 10
    ) emotion_counts) as top_emotions,
    (SELECT json_agg(context_counts) FROM (
        SELECT context_label as context, COUNT(*) as count 
        FROM emotional_signatures 
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY context_label 
        ORDER BY count DESC 
        LIMIT 10
    ) context_counts) as top_contexts,
    COALESCE(AVG(confidence_score), 0) as processing_accuracy,
    COALESCE(
        (COUNT(*) FILTER (WHERE webhook_sent = true AND processed = true)::float / 
         NULLIF(COUNT(*) FILTER (WHERE webhook_sent = true), 0)) * 100, 
        0
    ) as webhook_success_rate
FROM emotional_signatures;

-- Comments for webhook integration with Make.com
/*
Webhook Payload Structure for Make.com:
{
  "signature_id": "uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "emotion": "sadness",
  "context": "Breakup", 
  "confidence": 92,
  "sender_email": "user@example.com",
  "suggested_action": "Auto-route to LUMIENCE™",
  "summary": "User expressing deep sadness about relationship ending",
  "agentgift_routing": {
    "system": "LUMIENCE",
    "priority": 5,
    "auto_trigger": true
  }
}

Make.com Webhook Endpoints:
- Production: https://hook.make.com/your-webhook-id
- Staging: https://hook.make.com/your-staging-webhook-id

Response Expected:
{
  "success": true,
  "processed_by": "make_scenario_id",
  "routed_to": "LUMIENCE",
  "timestamp": "2024-01-15T10:30:05Z"
}
*/
