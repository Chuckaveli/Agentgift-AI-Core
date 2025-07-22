-- Create BondCraft™ tables for relationship rituals and trivia

-- Sessions table to track each BondCraft session
CREATE TABLE IF NOT EXISTS bondcraft_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_dynamic TEXT NOT NULL,
    occasion TEXT NOT NULL,
    tone TEXT NOT NULL,
    rituals JSONB DEFAULT '[]'::jsonb,
    trivia_answers JSONB DEFAULT '[]'::jsonb,
    partner_guesses JSONB DEFAULT '[]'::jsonb,
    score INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ritual collections for users to save their favorite rituals
CREATE TABLE IF NOT EXISTS bondcraft_ritual_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES bondcraft_sessions(id) ON DELETE CASCADE,
    ritual_data JSONB NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    completion_count INTEGER DEFAULT 0,
    last_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bond reports for tracking relationship insights over time
CREATE TABLE IF NOT EXISTS bondcraft_bond_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES bondcraft_sessions(id) ON DELETE CASCADE,
    report_data JSONB NOT NULL,
    insights JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trivia question bank for dynamic question generation
CREATE TABLE IF NOT EXISTS bondcraft_trivia_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    placeholder_text TEXT,
    difficulty_level TEXT DEFAULT 'medium',
    relationship_dynamics TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking for free tier limitations
CREATE TABLE IF NOT EXISTS bondcraft_usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES bondcraft_sessions(id) ON DELETE CASCADE,
    usage_type TEXT NOT NULL, -- 'session', 'trivia_retry', etc.
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, session_id, usage_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bondcraft_sessions_user_id ON bondcraft_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bondcraft_sessions_created_at ON bondcraft_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_bondcraft_ritual_collections_user_id ON bondcraft_ritual_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_bondcraft_bond_reports_user_id ON bondcraft_bond_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bondcraft_usage_tracking_user_date ON bondcraft_usage_tracking(user_id, usage_date);

-- Row Level Security (RLS)
ALTER TABLE bondcraft_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bondcraft_ritual_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bondcraft_bond_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bondcraft_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own BondCraft sessions" ON bondcraft_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own ritual collections" ON bondcraft_ritual_collections
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own bond reports" ON bondcraft_bond_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage tracking" ON bondcraft_usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

-- Insert sample trivia questions
INSERT INTO bondcraft_trivia_questions (category, question_text, placeholder_text, relationship_dynamics) VALUES
('Love Language', 'What is your partner''s primary love language?', 'e.g., Physical Touch, Words of Affirmation, Quality Time...', ARRAY['Long-Distance', 'New Romance', 'Married Life', 'Playful & Fun']),
('Favorite Memory', 'What is your partner''s favorite memory you''ve shared together?', 'Describe the moment that means the most to them...', ARRAY['Long-Distance', 'New Romance', 'Married Life', 'Deep & Soulful']),
('What They''d Gift', 'If your partner could give you any gift right now, what would it be?', 'Think about what they think you need or want most...', ARRAY['Long-Distance', 'New Romance', 'Married Life', 'Playful & Fun']),
('Surprise Habit', 'What small habit does your partner do that always surprises or delights you?', 'Those little things they do that make you smile...', ARRAY['New Romance', 'Married Life', 'Playful & Fun', 'Deep & Soulful']),
('Secret Wish', 'What is one secret wish your partner has shared with you?', 'Something they''ve confided in you about wanting...', ARRAY['Healing & Rebuilding', 'Deep & Soulful', 'Married Life', 'Creative Partnership'])
ON CONFLICT DO NOTHING;

-- Function to add XP to user profile
CREATE OR REPLACE FUNCTION add_user_xp(user_id UUID, xp_amount INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_profiles (id, xp, updated_at)
    VALUES (user_id, xp_amount, NOW())
    ON CONFLICT (id)
    DO UPDATE SET 
        xp = user_profiles.xp + xp_amount,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bondcraft_sessions_updated_at
    BEFORE UPDATE ON bondcraft_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
