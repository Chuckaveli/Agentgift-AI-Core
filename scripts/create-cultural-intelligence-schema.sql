-- Cultural Intelligence Layer Schema for AgentGift.ai

-- Global holidays table
CREATE TABLE IF NOT EXISTS global_holidays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    region VARCHAR(100) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    cultural_significance TEXT,
    gift_traditions TEXT[], -- Array of traditional gift types
    color_themes TEXT[], -- Array of traditional colors
    symbols TEXT[], -- Array of cultural symbols
    is_recurring BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cultural preferences table
CREATE TABLE IF NOT EXISTS cultural_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    locale VARCHAR(10) NOT NULL UNIQUE,
    gift_giving_style VARCHAR(50) NOT NULL, -- direct, subtle, ceremonial, casual
    emotional_expression VARCHAR(50) NOT NULL, -- reserved, moderate, expressive, very_expressive
    color_preferences TEXT[], -- Array of preferred colors
    taboo_items TEXT[], -- Array of culturally inappropriate items
    preferred_occasions TEXT[], -- Array of important occasions
    communication_style VARCHAR(50) NOT NULL, -- formal, friendly, warm, professional
    holiday_importance VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cultural gift filters table
CREATE TABLE IF NOT EXISTS cultural_gift_filters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    locale VARCHAR(10) NOT NULL,
    filter_type VARCHAR(50) NOT NULL, -- color, occasion, style, material, etc.
    filter_value VARCHAR(100) NOT NULL,
    is_preferred BOOLEAN DEFAULT false,
    is_taboo BOOLEAN DEFAULT false,
    cultural_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Persona cultural adaptations table
CREATE TABLE IF NOT EXISTS persona_cultural_adaptations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    persona_id VARCHAR(50) NOT NULL,
    locale VARCHAR(10) NOT NULL,
    adapted_tone TEXT NOT NULL,
    cultural_context TEXT,
    greeting_style VARCHAR(100),
    communication_patterns TEXT[],
    cultural_references TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(persona_id, locale)
);

-- User cultural profiles table (extends user_profiles)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS preferred_locale VARCHAR(10) DEFAULT 'en-US',
ADD COLUMN IF NOT EXISTS cultural_preferences JSONB,
ADD COLUMN IF NOT EXISTS cultural_holidays_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS cultural_gift_filters TEXT[];

-- Cultural feedback table
CREATE TABLE IF NOT EXISTS cultural_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    feedback_type VARCHAR(50) NOT NULL, -- suggestion, concern, correction
    locale VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    context JSONB, -- Additional context about the feedback
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, implemented
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default cultural preferences
INSERT INTO cultural_preferences (locale, gift_giving_style, emotional_expression, color_preferences, taboo_items, preferred_occasions, communication_style, holiday_importance) VALUES
('en-US', 'direct', 'moderate', ARRAY['red', 'blue', 'green', 'gold'], ARRAY[]::TEXT[], ARRAY['birthday', 'christmas', 'valentines', 'thanksgiving'], 'friendly', 'high'),
('ja-JP', 'ceremonial', 'reserved', ARRAY['white', 'red', 'gold', 'pink'], ARRAY['knives', 'clocks', 'white_flowers'], ARRAY['new_year', 'golden_week', 'obon', 'birthday'], 'formal', 'high'),
('es-MX', 'ceremonial', 'expressive', ARRAY['red', 'green', 'gold', 'pink', 'purple'], ARRAY['yellow_flowers', 'purple_flowers'], ARRAY['dia_de_muertos', 'christmas', 'birthday', 'mothers_day'], 'warm', 'high'),
('hi-IN', 'ceremonial', 'expressive', ARRAY['red', 'gold', 'orange', 'yellow', 'green'], ARRAY['leather', 'alcohol'], ARRAY['diwali', 'holi', 'raksha_bandhan', 'birthday'], 'warm', 'high'),
('de-DE', 'direct', 'reserved', ARRAY['red', 'green', 'gold', 'blue'], ARRAY['even_numbered_flowers'], ARRAY['christmas', 'birthday', 'easter', 'oktoberfest'], 'formal', 'medium'),
('fr-FR', 'subtle', 'moderate', ARRAY['blue', 'white', 'red', 'gold'], ARRAY['chrysanthemums'], ARRAY['christmas', 'birthday', 'valentines', 'bastille_day'], 'formal', 'medium'),
('pt-BR', 'warm', 'expressive', ARRAY['green', 'yellow', 'blue', 'red'], ARRAY[]::TEXT[], ARRAY['carnival', 'christmas', 'birthday', 'festa_junina'], 'warm', 'high'),
('ar-SA', 'formal', 'moderate', ARRAY['green', 'gold', 'white', 'blue'], ARRAY['alcohol', 'pork_products'], ARRAY['eid', 'ramadan', 'birthday'], 'formal', 'high'),
('zh-CN', 'ceremonial', 'reserved', ARRAY['red', 'gold', 'yellow'], ARRAY['clocks', 'white_flowers', 'mirrors'], ARRAY['chinese_new_year', 'mid_autumn', 'birthday'], 'formal', 'high'),
('ko-KR', 'ceremonial', 'reserved', ARRAY['red', 'gold', 'pink', 'white'], ARRAY['knives', 'shoes'], ARRAY['lunar_new_year', 'chuseok', 'birthday'], 'formal', 'high')
ON CONFLICT (locale) DO NOTHING;

-- Insert sample global holidays
INSERT INTO global_holidays (name, date, region, country_code, cultural_significance, gift_traditions, color_themes, symbols) VALUES
('Christmas', '2024-12-25', 'Global', 'GLOBAL', 'Christian celebration of Jesus birth', ARRAY['wrapped_gifts', 'toys', 'books'], ARRAY['red', 'green', 'gold'], ARRAY['tree', 'star', 'angel']),
('Diwali', '2024-11-12', 'Asia', 'IN', 'Hindu festival of lights', ARRAY['sweets', 'gold', 'diyas'], ARRAY['gold', 'red', 'orange'], ARRAY['diya', 'lotus', 'rangoli']),
('Chinese New Year', '2025-01-29', 'Asia', 'CN', 'Lunar new year celebration', ARRAY['red_envelopes', 'gold', 'food'], ARRAY['red', 'gold'], ARRAY['dragon', 'lantern', 'fireworks']),
('Eid al-Fitr', '2024-04-10', 'Global', 'GLOBAL', 'End of Ramadan celebration', ARRAY['sweets', 'clothes', 'money'], ARRAY['green', 'gold', 'white'], ARRAY['crescent', 'star', 'lantern']),
('Day of the Dead', '2024-11-02', 'North America', 'MX', 'Mexican tradition honoring deceased', ARRAY['flowers', 'food', 'candles'], ARRAY['orange', 'purple', 'pink'], ARRAY['skull', 'marigold', 'candle']),
('Holi', '2024-03-25', 'Asia', 'IN', 'Hindu festival of colors', ARRAY['colors', 'sweets', 'water_guns'], ARRAY['pink', 'yellow', 'green', 'blue'], ARRAY['colors', 'water', 'spring']),
('Oktoberfest', '2024-09-21', 'Europe', 'DE', 'German beer and culture festival', ARRAY['beer', 'pretzels', 'traditional_clothing'], ARRAY['blue', 'white', 'brown'], ARRAY['beer_mug', 'pretzel', 'lederhosen'])
ON CONFLICT DO NOTHING;

-- Insert persona cultural adaptations
INSERT INTO persona_cultural_adaptations (persona_id, locale, adapted_tone, cultural_context, greeting_style, communication_patterns, cultural_references) VALUES
('avelyn', 'ja-JP', 'respectful and gentle with formal politeness', 'Japanese culture values harmony and respect', 'formal bow equivalent', ARRAY['indirect_communication', 'humble_expressions'], ARRAY['cherry_blossoms', 'tea_ceremony']),
('avelyn', 'es-MX', 'warm and affectionate with family focus', 'Mexican culture emphasizes family and warmth', 'warm_greeting', ARRAY['expressive_language', 'family_references'], ARRAY['familia', 'corazón', 'amor']),
('galen', 'de-DE', 'precise and methodical with technical focus', 'German culture values efficiency and precision', 'professional_greeting', ARRAY['direct_communication', 'technical_accuracy'], ARRAY['engineering', 'quality', 'innovation']),
('galen', 'ja-JP', 'respectful tech enthusiasm with humble expertise',  'quality', 'innovation']),
('galen', 'ja-JP', 'respectful tech enthusiasm with humble expertise', 'Japanese tech culture values continuous improvement', 'respectful_bow', ARRAY['humble_expertise', 'kaizen_mindset'], ARRAY['kaizen', 'monozukuri', 'omotenashi']),
('zola', 'fr-FR', 'sophisticated elegance with refined taste', 'French culture appreciates luxury and refinement', 'elegant_greeting', ARRAY['sophisticated_language', 'cultural_refinement'], ARRAY['haute_couture', 'art_de_vivre', 'savoir_faire']),
('zola', 'ar-SA', 'respectful luxury with cultural sensitivity', 'Middle Eastern culture values respect and hospitality', 'respectful_greeting', ARRAY['formal_respect', 'cultural_awareness'], ARRAY['hospitality', 'tradition', 'heritage'])
ON CONFLICT (persona_id, locale) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_holidays_country_date ON global_holidays(country_code, date);
CREATE INDEX IF NOT EXISTS idx_cultural_preferences_locale ON cultural_preferences(locale);
CREATE INDEX IF NOT EXISTS idx_cultural_gift_filters_locale ON cultural_gift_filters(locale, filter_type);
CREATE INDEX IF NOT EXISTS idx_persona_adaptations_persona_locale ON persona_cultural_adaptations(persona_id, locale);
CREATE INDEX IF NOT EXISTS idx_user_profiles_locale ON user_profiles(preferred_locale);

-- Create functions for cultural intelligence
CREATE OR REPLACE FUNCTION get_cultural_holidays_for_locale(user_locale VARCHAR(10))
RETURNS TABLE (
    holiday_name VARCHAR(255),
    holiday_date DATE,
    cultural_significance TEXT,
    gift_traditions TEXT[],
    color_themes TEXT[],
    symbols TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gh.name,
        gh.date,
        gh.cultural_significance,
        gh.gift_traditions,
        gh.color_themes,
        gh.symbols
    FROM global_holidays gh
    WHERE (gh.country_code = SPLIT_PART(user_locale, '-', 2) OR gh.country_code = 'GLOBAL')
    AND gh.is_active = true
    AND gh.date >= CURRENT_DATE
    ORDER BY gh.date ASC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_cultural_gift_filters(user_locale VARCHAR(10))
RETURNS TEXT[] AS $$
DECLARE
    filters TEXT[];
    prefs cultural_preferences%ROWTYPE;
BEGIN
    -- Get cultural preferences for locale
    SELECT * INTO prefs FROM cultural_preferences WHERE locale = user_locale;
    
    IF NOT FOUND THEN
        -- Fallback to en-US if locale not found
        SELECT * INTO prefs FROM cultural_preferences WHERE locale = 'en-US';
    END IF;
    
    -- Build filter array
    filters := ARRAY[]::TEXT[];
    filters := filters || ('locale:' || prefs.locale);
    filters := filters || ('style:' || prefs.gift_giving_style);
    filters := filters || ('expression:' || prefs.emotional_expression);
    filters := filters || ('communication:' || prefs.communication_style);
    
    -- Add color preferences
    IF prefs.color_preferences IS NOT NULL THEN
        SELECT array_agg('color:' || unnest) INTO filters 
        FROM (SELECT unnest(prefs.color_preferences) UNION ALL SELECT unnest(filters)) AS combined;
    END IF;
    
    -- Add preferred occasions
    IF prefs.preferred_occasions IS NOT NULL THEN
        SELECT array_agg('occasion:' || unnest) INTO filters 
        FROM (SELECT unnest(prefs.preferred_occasions) UNION ALL SELECT unnest(filters)) AS combined;
    END IF;
    
    -- Add made_in filter
    filters := filters || ('made_in:' || SPLIT_PART(prefs.locale, '-', 2));
    
    RETURN filters;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update cultural preferences timestamp
CREATE OR REPLACE FUNCTION update_cultural_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cultural_preferences_timestamp
    BEFORE UPDATE ON cultural_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_cultural_preferences_timestamp();

-- Grant permissions
GRANT SELECT ON global_holidays TO authenticated;
GRANT SELECT ON cultural_preferences TO authenticated;
GRANT SELECT ON cultural_gift_filters TO authenticated;
GRANT SELECT ON persona_cultural_adaptations TO authenticated;
GRANT INSERT, UPDATE ON cultural_feedback TO authenticated;
GRANT EXECUTE ON FUNCTION get_cultural_holidays_for_locale(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cultural_gift_filters(VARCHAR) TO authenticated;

-- Add RLS policies
ALTER TABLE global_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_gift_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_cultural_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_feedback ENABLE ROW LEVEL SECURITY;

-- Allow read access to cultural data for all authenticated users
CREATE POLICY "Allow read access to global holidays" ON global_holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to cultural preferences" ON cultural_preferences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to cultural gift filters" ON cultural_gift_filters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to persona adaptations" ON persona_cultural_adaptations FOR SELECT TO authenticated USING (true);

-- Allow users to manage their own cultural feedback
CREATE POLICY "Users can insert their own cultural feedback" ON cultural_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own cultural feedback" ON cultural_feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);
