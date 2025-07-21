-- Create ghost hunt sessions table
CREATE TABLE IF NOT EXISTS ghost_hunt_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    hunt_name TEXT NOT NULL,
    season TEXT NOT NULL,
    user_tier TEXT NOT NULL DEFAULT 'Free',
    participation_type TEXT NOT NULL DEFAULT 'Solo',
    delivery_medium TEXT NOT NULL DEFAULT 'Web App',
    tone_style TEXT NOT NULL,
    current_clue INTEGER NOT NULL DEFAULT 0,
    total_xp INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    completed BOOLEAN NOT NULL DEFAULT false,
    time_remaining INTEGER NOT NULL DEFAULT 1200,
    completion_time INTEGER,
    success_score INTEGER,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ghost hunt clue answers table
CREATE TABLE IF NOT EXISTS ghost_hunt_clue_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ghost_hunt_sessions(id) ON DELETE CASCADE,
    clue_id TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    time_spent INTEGER NOT NULL DEFAULT 0,
    hint_used BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ghost hunt badges table
CREATE TABLE IF NOT EXISTS ghost_hunt_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    hunt_session_id UUID NOT NULL REFERENCES ghost_hunt_sessions(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    badge_type TEXT NOT NULL DEFAULT 'completion',
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ghost hunt leaderboard table
CREATE TABLE IF NOT EXISTS ghost_hunt_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    session_id UUID NOT NULL REFERENCES ghost_hunt_sessions(id) ON DELETE CASCADE,
    hunt_name TEXT NOT NULL,
    season TEXT NOT NULL,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    success_score INTEGER NOT NULL DEFAULT 0,
    completion_time INTEGER NOT NULL DEFAULT 0,
    badges_earned INTEGER NOT NULL DEFAULT 0,
    nickname TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ghost hunt hints table
CREATE TABLE IF NOT EXISTS ghost_hunt_hints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    session_id UUID NOT NULL REFERENCES ghost_hunt_sessions(id) ON DELETE CASCADE,
    clue_id TEXT NOT NULL,
    hint_text TEXT NOT NULL,
    cost_paid DECIMAL(10,2) NOT NULL DEFAULT 1.49,
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ghost_hunt_sessions_user_id ON ghost_hunt_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ghost_hunt_sessions_active ON ghost_hunt_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_ghost_hunt_sessions_season ON ghost_hunt_sessions(season);
CREATE INDEX IF NOT EXISTS idx_ghost_hunt_clue_answers_session_id ON ghost_hunt_clue_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_ghost_hunt_badges_user_id ON ghost_hunt_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_ghost_hunt_leaderboard_season ON ghost_hunt_leaderboard(season);
CREATE INDEX IF NOT EXISTS idx_ghost_hunt_leaderboard_xp ON ghost_hunt_leaderboard(xp_earned DESC);

-- Create RLS policies
ALTER TABLE ghost_hunt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghost_hunt_clue_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghost_hunt_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghost_hunt_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghost_hunt_hints ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON ghost_hunt_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON ghost_hunt_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON ghost_hunt_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see their own clue answers
CREATE POLICY "Users can view own clue answers" ON ghost_hunt_clue_answers
    FOR SELECT USING (
        auth.uid() = (
            SELECT user_id FROM ghost_hunt_sessions 
            WHERE id = session_id
        )
    );

CREATE POLICY "Users can insert own clue answers" ON ghost_hunt_clue_answers
    FOR INSERT WITH CHECK (
        auth.uid() = (
            SELECT user_id FROM ghost_hunt_sessions 
            WHERE id = session_id
        )
    );

-- Users can view their own badges
CREATE POLICY "Users can view own badges" ON ghost_hunt_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON ghost_hunt_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard is public for viewing
CREATE POLICY "Leaderboard is public" ON ghost_hunt_leaderboard
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own leaderboard entries" ON ghost_hunt_leaderboard
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own hints
CREATE POLICY "Users can view own hints" ON ghost_hunt_hints
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hints" ON ghost_hunt_hints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to add XP to user profile
CREATE OR REPLACE FUNCTION add_user_xp(user_id UUID, xp_amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles 
    SET xp = xp + xp_amount,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's hunt statistics
CREATE OR REPLACE FUNCTION get_user_hunt_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_hunts', COUNT(*),
        'completed_hunts', COUNT(*) FILTER (WHERE completed = true),
        'total_xp', COALESCE(SUM(total_xp), 0),
        'average_score', COALESCE(AVG(success_score), 0),
        'favorite_season', (
            SELECT season 
            FROM ghost_hunt_sessions 
            WHERE ghost_hunt_sessions.user_id = get_user_hunt_stats.user_id 
            GROUP BY season 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ),
        'badges_earned', (
            SELECT COUNT(*) 
            FROM ghost_hunt_badges 
            WHERE ghost_hunt_badges.user_id = get_user_hunt_stats.user_id
        )
    )
    INTO result
    FROM ghost_hunt_sessions
    WHERE ghost_hunt_sessions.user_id = get_user_hunt_stats.user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get seasonal leaderboard
CREATE OR REPLACE FUNCTION get_seasonal_leaderboard(season_name TEXT DEFAULT NULL, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    rank INTEGER,
    user_id UUID,
    user_name TEXT,
    xp_earned INTEGER,
    success_score INTEGER,
    completion_time INTEGER,
    badges_earned INTEGER,
    hunt_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY l.xp_earned DESC, l.completion_time ASC)::INTEGER as rank,
        l.user_id,
        COALESCE(p.name, 'Anonymous') as user_name,
        l.xp_earned,
        l.success_score,
        l.completion_time,
        l.badges_earned,
        l.hunt_name
    FROM ghost_hunt_leaderboard l
    LEFT JOIN user_profiles p ON l.user_id = p.id
    WHERE (season_name IS NULL OR l.season = season_name)
    ORDER BY l.xp_earned DESC, l.completion_time ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update session updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ghost_hunt_sessions_updated_at
    BEFORE UPDATE ON ghost_hunt_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
