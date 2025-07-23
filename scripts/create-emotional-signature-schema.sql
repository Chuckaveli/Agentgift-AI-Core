-- Create emotional signatures schema
CREATE SCHEMA IF NOT EXISTS emotional_signatures;

-- Create emotional signatures table
CREATE TABLE IF NOT EXISTS emotional_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  source_type VARCHAR(50) NOT NULL,
  source_label VARCHAR(100) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  raw_content TEXT,
  parsed_emotion VARCHAR(50) NOT NULL,
  confidence_score NUMERIC(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  context_label VARCHAR(100) NOT NULL,
  context_metadata JSONB,
  summary_snippet TEXT NOT NULL,
  suggested_action TEXT,
  priority_level VARCHAR(20) NOT NULL DEFAULT 'medium',
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  webhook_sent BOOLEAN NOT NULL DEFAULT FALSE,
  webhook_response JSONB,
  webhook_payload JSONB
);

-- Create index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_emotional_signatures_timestamp ON emotional_signatures (timestamp DESC);

-- Create index on parsed_emotion for faster filtering
CREATE INDEX IF NOT EXISTS idx_emotional_signatures_emotion ON emotional_signatures (parsed_emotion);

-- Create index on context_label for faster filtering
CREATE INDEX IF NOT EXISTS idx_emotional_signatures_context ON emotional_signatures (context_label);

-- Create integration logs table
CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  integration_type VARCHAR(50) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  emotional_signature_id UUID REFERENCES emotional_signatures(id),
  request_payload JSONB,
  response_payload JSONB,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  execution_time_ms INTEGER
);

-- Create emotional analytics table
CREATE TABLE IF NOT EXISTS emotional_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  emotion VARCHAR(50) NOT NULL,
  context VARCHAR(100) NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  avg_confidence NUMERIC(5,2) NOT NULL,
  UNIQUE(date, emotion, context)
);

-- Create emotional contexts reference table
CREATE TABLE IF NOT EXISTS emotional_contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  context_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  priority_level INTEGER NOT NULL DEFAULT 3,
  routing_system VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default emotional contexts
INSERT INTO emotional_contexts (context_name, description, priority_level, routing_system)
VALUES
  ('Breakup', 'Relationship ending context', 5, 'LUMIENCE'),
  ('Grief', 'Loss and mourning context', 5, 'JUST_BECAUSE_LOOP'),
  ('Anxiety', 'Worry and stress context', 4, 'LUMIENCE'),
  ('Depression', 'Mental health struggle context', 5, 'LUMIENCE'),
  ('Job Loss', 'Career transition context', 4, 'LUMIENCE'),
  ('Graduation', 'Educational achievement context', 3, 'BONDCRAFT'),
  ('Anniversary', 'Relationship milestone context', 4, 'BONDCRAFT'),
  ('Promotion', 'Career advancement context', 3, 'BONDCRAFT'),
  ('Birthday', 'Birth celebration context', 3, 'BONDCRAFT'),
  ('Wedding', 'Marriage celebration context', 4, 'BONDCRAFT'),
  ('New Baby', 'New child context', 4, 'BONDCRAFT'),
  ('Celebration', 'General positive event context', 2, 'BONDCRAFT'),
  ('Illness', 'Health challenge context', 4, 'JUST_BECAUSE_LOOP'),
  ('Moving', 'Relocation context', 2, 'JUST_BECAUSE_LOOP'),
  ('Apology', 'Reconciliation context', 3, 'JUST_BECAUSE_LOOP')
ON CONFLICT (context_name) DO NOTHING;

-- Create emotions reference table
CREATE TABLE IF NOT EXISTS emotional_reference (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emotion_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  color_hex VARCHAR(7),
  intensity_level INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default emotions
INSERT INTO emotional_reference (emotion_name, description, color_hex, intensity_level)
VALUES
  ('Joy', 'Feeling of great pleasure and happiness', '#FFD700', 4),
  ('Sadness', 'Feeling of sorrow or unhappiness', '#6495ED', 3),
  ('Anger', 'Strong feeling of annoyance or displeasure', '#FF4500', 4),
  ('Fear', 'Feeling of being afraid or anxious', '#800080', 4),
  ('Disgust', 'Strong feeling of dislike or aversion', '#008000', 3),
  ('Surprise', 'Feeling of being astonished or startled', '#FFA500', 3),
  ('Trust', 'Firm belief in reliability or truth', '#4682B4', 2),
  ('Anticipation', 'Looking forward to something', '#FF69B4', 2),
  ('Love', 'Deep affection or attachment', '#FF1493', 5),
  ('Grief', 'Deep sorrow, especially caused by death', '#000080', 5),
  ('Anxiety', 'Feeling of worry or nervousness', '#9370DB', 4),
  ('Excitement', 'Feeling of great enthusiasm', '#FF6347', 4),
  ('Gratitude', 'Feeling of thankfulness', '#2E8B57', 3),
  ('Guilt', 'Feeling of having done wrong', '#8B4513', 3),
  ('Pride', 'Feeling of satisfaction from achievements', '#DAA520', 3),
  ('Shame', 'Painful feeling of humiliation', '#A52A2A', 4),
  ('Contentment', 'State of peaceful happiness', '#87CEEB', 2),
  ('Disappointment', 'Sadness from unfulfilled expectations', '#778899', 3),
  ('Jealousy', 'Envious resentment of someone', '#006400', 4),
  ('Hope', 'Feeling of expectation and desire', '#00BFFF', 3)
ON CONFLICT (emotion_name) DO NOTHING;

-- Create webhook configuration table
CREATE TABLE IF NOT EXISTS webhook_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_name VARCHAR(100) NOT NULL UNIQUE,
  webhook_url TEXT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  headers JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Insert default webhook configurations
INSERT INTO webhook_configurations (webhook_name, webhook_url, event_type)
VALUES
  ('Make.com General', 'https://hook.make.com/agentgift-emotional-signature', 'all'),
  ('Make.com Grief Trigger', 'https://hook.make.com/agentgift-grief-trigger', 'grief'),
  ('Make.com Joy Trigger', 'https://hook.make.com/agentgift-joy-trigger', 'joy'),
  ('Make.com Anxiety Trigger', 'https://hook.make.com/agentgift-anxiety-trigger', 'anxiety')
ON CONFLICT (webhook_name) DO NOTHING;

-- Create RLS policies
ALTER TABLE emotional_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_configurations ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated access to emotional_signatures" 
  ON emotional_signatures FOR ALL 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated access to integration_logs" 
  ON integration_logs FOR ALL 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated access to emotional_analytics" 
  ON emotional_analytics FOR ALL 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated access to emotional_contexts" 
  ON emotional_contexts FOR ALL 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated access to emotional_reference" 
  ON emotional_reference FOR ALL 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated access to webhook_configurations" 
  ON webhook_configurations FOR ALL 
  TO authenticated 
  USING (true);

-- Create functions for analytics
CREATE OR REPLACE FUNCTION update_emotional_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO emotional_analytics (date, emotion, context, count, avg_confidence)
  VALUES (
    CURRENT_DATE,
    NEW.parsed_emotion,
    NEW.context_label,
    1,
    NEW.confidence_score
  )
  ON CONFLICT (date, emotion, context)
  DO UPDATE SET
    count = emotional_analytics.count + 1,
    avg_confidence = (emotional_analytics.avg_confidence * emotional_analytics.count + NEW.confidence_score) / (emotional_analytics.count + 1);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics
CREATE TRIGGER trigger_update_emotional_analytics
AFTER INSERT ON emotional_signatures
FOR EACH ROW
EXECUTE FUNCTION update_emotional_analytics();

-- Grant permissions
GRANT USAGE ON SCHEMA emotional_signatures TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA emotional_signatures TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA emotional_signatures TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA emotional_signatures TO service_role;
