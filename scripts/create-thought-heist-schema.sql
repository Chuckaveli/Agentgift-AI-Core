-- Create thought heist sessions table
CREATE TABLE IF NOT EXISTS thought_heist_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    team_name VARCHAR(100) NOT NULL,
    season_theme VARCHAR(100) NOT NULL,
    team_size INTEGER NOT NULL CHECK (team_size BETWEEN 2 AND 5),
    avg_xp_level VARCHAR(50) NOT NULL,
    tone VARCHAR(50) NOT NULL,
    user_tier VARCHAR(20) NOT NULL DEFAULT 'Free',
    current_phase INTEGER DEFAULT 0,
    time_remaining INTEGER DEFAULT 1800,
    score INTEGER DEFAULT 0,
    final_score INTEGER,
    is_active BOOLEAN DEFAULT true,
    completion_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create thought heist results table
CREATE TABLE IF NOT EXISTS thought_heist_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES thought_heist_sessions(id) ON DELETE CASCADE,
    player_name VARCHAR(100) NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    nickname VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create thought heist answers table
CREATE TABLE IF NOT EXISTS thought_heist_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES thought_heist_sessions(id) ON DELETE CASCADE,
    phase_number INTEGER NOT NULL,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create thought heist leaderboard view
CREATE OR REPLACE VIEW thought_heist_leaderboard AS
SELECT 
    ths.team_name,
    ths.season_theme,
    ths.final_score,
    ths.completion_time,
    ths.user_tier,
    COUNT(thr.id) as team_size,
    AVG(thr.xp_earned) as avg_xp_per_player,
    ths.completed_at
FROM thought_heist_sessions ths
LEFT JOIN thought_heist_results thr ON ths.id = thr.session_id
WHERE ths.is_active = false AND ths.final_score IS NOT NULL
GROUP BY ths.id, ths.team_name, ths.season_theme, ths.final_score, 
         ths.completion_time, ths.user_tier, ths.completed_at
ORDER BY ths.final_score DESC, ths.completion_time ASC;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_thought_heist_sessions_user_id ON thought_heist_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_thought_heist_sessions_active ON thought_heist_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_thought_heist_sessions_created_at ON thought_heist_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_thought_heist_results_session_id ON thought_heist_results(session_id);
CREATE INDEX IF NOT EXISTS idx_thought_heist_answers_session_id ON thought_heist_answers(session_id);

-- Enable RLS
ALTER TABLE thought_heist_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE thought_heist_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE thought_heist_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own heist sessions" ON thought_heist_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own heist sessions" ON thought_heist_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own heist sessions" ON thought_heist_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view results for their sessions" ON thought_heist_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM thought_heist_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create results for their sessions" ON thought_heist_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM thought_heist_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view answers for their sessions" ON thought_heist_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM thought_heist_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create answers for their sessions" ON thought_heist_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM thought_heist_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

-- Create function to update user XP after heist completion
CREATE OR REPLACE FUNCTION update_user_xp_from_heist()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's total XP when heist is completed
    IF NEW.is_active = false AND OLD.is_active = true AND NEW.final_score IS NOT NULL THEN
        UPDATE user_profiles 
        SET total_xp = COALESCE(total_xp, 0) + (
            SELECT COALESCE(SUM(xp_earned), 0) 
            FROM thought_heist_results 
            WHERE session_id = NEW.id
        )
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for XP updates
CREATE TRIGGER trigger_update_user_xp_from_heist
    AFTER UPDATE ON thought_heist_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_xp_from_heist();

-- Create analytics function
CREATE OR REPLACE FUNCTION get_thought_heist_analytics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_sessions BIGINT,
    completed_sessions BIGINT,
    avg_completion_time NUMERIC,
    avg_score NUMERIC,
    most_popular_theme TEXT,
    total_players BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE is_active = false) as completed_sessions,
        AVG(completion_time) as avg_completion_time,
        AVG(final_score) as avg_score,
        MODE() WITHIN GROUP (ORDER BY season_theme) as most_popular_theme,
        SUM(team_size) as total_players
    FROM thought_heist_sessions
    WHERE created_at::DATE BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;
