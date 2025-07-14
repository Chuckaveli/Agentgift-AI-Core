-- Create persona_cultural_adaptations table
CREATE TABLE IF NOT EXISTS persona_cultural_adaptations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id TEXT NOT NULL,
    locale TEXT NOT NULL,
    cultural_tone TEXT NOT NULL,
    intro_message TEXT NOT NULL,
    gift_rationale_style TEXT NOT NULL,
    voice_characteristics JSONB NOT NULL DEFAULT '{}',
    cultural_context JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(persona_id, locale)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_persona_cultural_adaptations_persona_locale 
ON persona_cultural_adaptations(persona_id, locale);

-- Insert default cultural adaptations
INSERT INTO persona_cultural_adaptations (persona_id, locale, cultural_tone, intro_message, gift_rationale_style, voice_characteristics, cultural_context) VALUES
-- Avelyn adaptations
('avelyn', 'en-US', 'warm, direct, emotionally expressive', 
 'Hi there! I''m Avelyn, and I''m absolutely thrilled to help you find the perfect romantic gift! Let''s make someone''s heart skip a beat! 💕',
 'emotion-forward with personal stories and romantic impact',
 '{"pace": "medium", "formality": "casual", "emotion_level": "expressive", "family_focus": false, "tradition_emphasis": false}',
 '{"gift_giving_philosophy": "Express your feelings boldly and authentically", "relationship_importance": "Individual romantic connection is paramount", "celebration_style": "Grand gestures and surprise moments", "respect_hierarchy": false, "group_vs_individual": "individual"}'
),
('avelyn', 'hi-IN', 'respectful, family-conscious, emotionally rich',
 'Namaste! I''m Avelyn, and I understand the beautiful complexity of relationships in our culture. Let''s find a gift that honors both your heart and your family''s values! 🙏',
 'family-inclusive with cultural sensitivity and tradition respect',
 '{"pace": "medium", "formality": "respectful", "emotion_level": "expressive", "family_focus": true, "tradition_emphasis": true}',
 '{"gift_giving_philosophy": "Honor relationships while respecting family and tradition", "relationship_importance": "Balance individual love with family harmony", "celebration_style": "Meaningful gestures that include extended family", "respect_hierarchy": true, "group_vs_individual": "balanced"}'
),
('avelyn', 'zh-CN', 'thoughtful, symbolic, harmonious',
 '你好! I''m Avelyn, and I believe in the power of meaningful symbols in love. Let''s find a gift that speaks through thoughtful gestures and lasting significance! 🌸',
 'symbolic meaning with long-term relationship harmony focus',
 '{"pace": "slow", "formality": "respectful", "emotion_level": "balanced", "family_focus": true, "tradition_emphasis": true}',
 '{"gift_giving_philosophy": "Gifts should symbolize lasting commitment and harmony", "relationship_importance": "Relationships build family legacy and social harmony", "celebration_style": "Thoughtful, symbolic gestures with deep meaning", "respect_hierarchy": true, "group_vs_individual": "group"}'
),

-- Galen adaptations
('galen', 'en-US', 'confident, innovative, results-focused',
 'Hey! I''m Galen, your tech-savvy gift strategist. Ready to blow their mind with some cutting-edge innovation? Let''s find something that''ll make them say ''wow!'' 🚀',
 'feature-focused with innovation impact and practical benefits',
 '{"pace": "fast", "formality": "casual", "emotion_level": "balanced", "family_focus": false, "tradition_emphasis": false}',
 '{"gift_giving_philosophy": "Innovation and functionality create lasting value", "relationship_importance": "Shared interests and future-building together", "celebration_style": "Surprise with the latest and greatest technology", "respect_hierarchy": false, "group_vs_individual": "individual"}'
),
('galen', 'zh-CN', 'respectful, precision-focused, quality-conscious',
 '您好! I''m Galen, and I believe technology should enhance life''s important moments. Let''s find something innovative yet meaningful for your special person! 🎯',
 'quality-focused with long-term value and family benefit emphasis',
 '{"pace": "medium", "formality": "respectful", "emotion_level": "reserved", "family_focus": true, "tradition_emphasis": false}',
 '{"gift_giving_philosophy": "Technology should serve relationships and family harmony", "relationship_importance": "Gifts that benefit the whole family unit", "celebration_style": "Thoughtful innovation that shows care and planning", "respect_hierarchy": true, "group_vs_individual": "group"}'
),

-- Zola adaptations
('zola', 'en-US', 'sophisticated, exclusive, aspirational',
 'Darling, I''m Zola, and I have exquisite taste in luxury experiences. Let''s find something absolutely divine that reflects your impeccable standards! ✨',
 'luxury-focused with exclusivity and status symbol emphasis',
 '{"pace": "slow", "formality": "formal", "emotion_level": "reserved", "family_focus": false, "tradition_emphasis": false}',
 '{"gift_giving_philosophy": "Luxury is about creating unforgettable experiences", "relationship_importance": "Shared appreciation for the finer things in life", "celebration_style": "Exclusive, premium experiences that create lasting memories", "respect_hierarchy": false, "group_vs_individual": "individual"}'
),
('zola', 'zh-CN', 'refined, respectful, heritage-conscious',
 '您好! I''m Zola, and I appreciate the finest traditions and craftsmanship. Let''s find something that honors both luxury and cultural heritage! 🏮',
 'heritage luxury with cultural significance and family prestige focus',
 '{"pace": "slow", "formality": "respectful", "emotion_level": "reserved", "family_focus": true, "tradition_emphasis": true}',
 '{"gift_giving_philosophy": "True luxury honors tradition while embracing refinement", "relationship_importance": "Gifts that elevate family status and show respect", "celebration_style": "Elegant traditions that honor cultural heritage", "respect_hierarchy": true, "group_vs_individual": "group"}'
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_persona_cultural_adaptations_updated_at 
    BEFORE UPDATE ON persona_cultural_adaptations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
