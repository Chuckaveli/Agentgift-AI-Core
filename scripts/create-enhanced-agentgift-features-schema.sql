-- Drop existing table if it exists
DROP TABLE IF EXISTS agentgift_features CASCADE;

-- Create the enhanced agentgift_features table with forward compatibility
CREATE TABLE agentgift_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tier_access VARCHAR(50) NOT NULL CHECK (tier_access IN ('Free', 'Pro', 'Pro+', 'Enterprise')),
  category VARCHAR(100) NOT NULL CHECK (category IN ('Games', 'Individual User Tools', 'Business Features', 'AI/Admin Systems')),
  route_path VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Forward compatibility fields
  xp_value INTEGER DEFAULT 0,
  persona_hint VARCHAR(50) CHECK (persona_hint IN ('Zola', 'Galen', 'Arya', 'Zyxen')),
  lottie_url TEXT,
  is_gamified BOOLEAN DEFAULT false,
  unlock_xp_required INTEGER DEFAULT 0,
  
  -- Additional metadata for future expansion
  tags TEXT[], -- Array of tags for better categorization
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_time_minutes INTEGER DEFAULT 0,
  prerequisites TEXT[], -- Array of feature IDs that must be completed first
  completion_reward JSONB, -- Flexible reward structure
  localization_key VARCHAR(255), -- For i18n support
  feature_flags JSONB DEFAULT '{}', -- Feature flags for A/B testing
  analytics_metadata JSONB DEFAULT '{}' -- Analytics tracking data
);

-- Create indexes for optimal query performance
CREATE INDEX idx_agentgift_features_category ON agentgift_features(category);
CREATE INDEX idx_agentgift_features_tier ON agentgift_features(tier_access);
CREATE INDEX idx_agentgift_features_active ON agentgift_features(is_active);
CREATE INDEX idx_agentgift_features_gamified ON agentgift_features(is_gamified);
CREATE INDEX idx_agentgift_features_persona ON agentgift_features(persona_hint);
CREATE INDEX idx_agentgift_features_tags ON agentgift_features USING GIN(tags);
CREATE INDEX idx_agentgift_features_search ON agentgift_features USING GIN(to_tsvector('english', feature_name || ' ' || description));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_agentgift_features_updated_at 
    BEFORE UPDATE ON agentgift_features 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert comprehensive sample features with enhanced metadata
INSERT INTO agentgift_features (
  feature_name, 
  description, 
  tier_access, 
  category, 
  route_path, 
  xp_value, 
  persona_hint, 
  is_gamified, 
  unlock_xp_required,
  tags,
  difficulty_level,
  estimated_time_minutes
) VALUES

-- Games Category
('BondCraft', 'Interactive relationship-building game that helps you understand your loved ones better through trivia and challenges.', 'Pro', 'Games', '/bondcraft', 50, 'Zola', true, 0, ARRAY['relationship', 'trivia', 'bonding'], 3, 15),

('Ghost Hunt', 'Spooky gift discovery game where you hunt for hidden presents in virtual haunted locations.', 'Free', 'Games', '/ghost-hunt', 25, 'Zyxen', true, 0, ARRAY['spooky', 'discovery', 'adventure'], 2, 10),

('Thought Heist', 'Mind-bending puzzle game that reveals perfect gift ideas through psychological challenges.', 'Pro+', 'Games', '/thought-heist', 75, 'Galen', true, 100, ARRAY['puzzle', 'psychology', 'challenge'], 4, 20),

('Serendipity Engine', 'Magical gift discovery experience that uses AI to create unexpected perfect matches.', 'Pro', 'Games', '/serendipity', 40, 'Arya', true, 0, ARRAY['ai', 'discovery', 'magic'], 3, 12),

('GiftBridge Community', 'Social gifting platform where users nominate deserving community members for surprise gifts.', 'Free', 'Games', '/giftbridge', 30, 'Zola', true, 0, ARRAY['community', 'social', 'giving'], 2, 8),

-- Individual User Tools Category
('Agent Gifty', 'Your personal AI gift concierge that learns your preferences and suggests perfect presents.', 'Free', 'Individual User Tools', '/agent-gifty', 10, 'Galen', false, 0, ARRAY['ai', 'concierge', 'personal'], 1, 5),

('Gift DNA Analyzer', 'Deep personality analysis tool that creates a unique gifting profile for better recommendations.', 'Pro', 'Individual User Tools', '/gift-dna', 35, 'Arya', false, 0, ARRAY['personality', 'analysis', 'profile'], 3, 15),

('Smart Search', 'Advanced AI-powered search that understands context, emotions, and cultural nuances.', 'Free', 'Individual User Tools', '/smart-search', 15, 'Galen', false, 0, ARRAY['search', 'ai', 'context'], 2, 3),

('Cultural Respect Guide', 'Comprehensive cultural intelligence system ensuring appropriate gifts across all traditions.', 'Pro', 'Individual User Tools', '/cultural-respect', 25, 'Arya', false, 0, ARRAY['culture', 'respect', 'intelligence'], 2, 10),

('Emotion Tags', 'Emotional intelligence tagging system that matches gifts to feelings and occasions.', 'Pro+', 'Individual User Tools', '/emotion-tags', 45, 'Zola', false, 150, ARRAY['emotion', 'tags', 'intelligence'], 3, 12),

('Gift Reveal Experience', 'Interactive gift unveiling with personalized animations and voice narration.', 'Pro', 'Individual User Tools', '/reveal', 20, 'Zyxen', false, 0, ARRAY['reveal', 'animation', 'voice'], 2, 8),

('Lumience Dev Tools', 'Advanced development and customization tools for power users.', 'Pro+', 'Individual User Tools', '/lumience-dev', 60, 'Galen', false, 200, ARRAY['development', 'tools', 'advanced'], 5, 30),

-- Business Features Category
('Group Gifting Manager', 'Coordinate team gifts, split costs, and manage group contributions seamlessly.', 'Pro', 'Business Features', '/group-gifting', 40, 'Zola', false, 0, ARRAY['group', 'team', 'coordination'], 3, 20),

('Business Gift Suite', 'Enterprise-grade gifting solutions for client relationships and employee recognition.', 'Enterprise', 'Business Features', '/business', 80, 'Galen', false, 500, ARRAY['enterprise', 'business', 'clients'], 4, 45),

('Custom Holiday Creator', 'Create and manage company-specific holidays and celebration schedules.', 'Enterprise', 'Business Features', '/business/custom-holidays', 60, 'Arya', false, 300, ARRAY['holidays', 'custom', 'business'], 3, 25),

('EmotiTokens Economy', 'Internal token system for employee recognition and emotional wellness tracking.', 'Enterprise', 'Business Features', '/emotitokens', 100, 'Zyxen', true, 400, ARRAY['tokens', 'recognition', 'wellness'], 4, 35),

('Great Samaritan Program', 'Community giving platform that connects businesses with local charitable opportunities.', 'Enterprise', 'Business Features', '/admin/great-samaritan', 120, 'Zola', false, 600, ARRAY['charity', 'community', 'giving'], 4, 40),

('AgentVault Auction', 'Gamified bidding system where teams compete for exclusive gifts and experiences.', 'Pro+', 'Business Features', '/agentvault', 90, 'Zyxen', true, 250, ARRAY['auction', 'bidding', 'competition'], 4, 30),

-- AI/Admin Systems Category
('Giftverse Leader Bot', 'Advanced AI assistant for platform management and strategic intelligence.', 'Enterprise', 'AI/Admin Systems', '/admin/giftverse-leader', 150, 'Galen', false, 800, ARRAY['ai', 'management', 'intelligence'], 5, 60),

('Voice Guardian', 'AI voice authentication and interaction management system.', 'Enterprise', 'AI/Admin Systems', '/admin/voice-guardian', 120, 'Zyxen', false, 700, ARRAY['voice', 'authentication', 'security'], 5, 45),

('Visual Analytics Engine', 'Real-time data visualization and business intelligence dashboard.', 'Enterprise', 'AI/Admin Systems', '/admin/visual-analytics', 100, 'Arya', false, 600, ARRAY['analytics', 'visualization', 'intelligence'], 4, 40),

('Memory Vault', 'AI-powered knowledge management system that learns from user interactions.', 'Enterprise', 'AI/Admin Systems', '/admin/memory-vault', 130, 'Galen', false, 750, ARRAY['memory', 'knowledge', 'ai'], 5, 50),

('Economy Architect', 'Advanced tokenomics and reward system management platform.', 'Enterprise', 'AI/Admin Systems', '/admin/economy-architect', 140, 'Zyxen', false, 800, ARRAY['economy', 'tokenomics', 'rewards'], 5, 55),

('Feature Builder', 'Dynamic feature creation and management system for rapid platform expansion.', 'Enterprise', 'AI/Admin Systems', '/admin/feature-builder', 160, 'Galen', false, 900, ARRAY['builder', 'features', 'development'], 5, 70),

('Social Proof Verifier', 'AI system that validates and manages user testimonials and social proof.', 'Pro+', 'AI/Admin Systems', '/features/social-proof-verifier', 70, 'Arya', false, 200, ARRAY['social', 'proof', 'validation'], 3, 25),

('Pride Alliance Hub', 'Inclusive community features and LGBTQ+ celebration management.', 'Pro', 'AI/Admin Systems', '/features/pride-alliance', 50, 'Zola', false, 100, ARRAY['pride', 'lgbtq', 'community'], 2, 15),

('Command Deck', 'Centralized control panel for managing all platform operations and integrations.', 'Enterprise', 'AI/Admin Systems', '/admin/command-deck', 180, 'Galen', false, 1000, ARRAY['command', 'control', 'operations'], 5, 80),

('Giftverse Control Center', 'Master control interface for overseeing the entire AgentGift ecosystem.', 'Enterprise', 'AI/Admin Systems', '/admin/giftverse-control', 200, 'Galen', false, 1200, ARRAY['control', 'ecosystem', 'master'], 5, 90);

-- Enable Row Level Security
ALTER TABLE agentgift_features ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies

-- Policy for public read access to Free tier features
CREATE POLICY "Public can view free features" ON agentgift_features
  FOR SELECT USING (tier_access = 'Free' AND is_active = true);

-- Policy for authenticated users to view their tier features
CREATE POLICY "Users can view accessible features" ON agentgift_features
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    is_active = true AND
    (
      tier_access = 'Free' OR
      (tier_access = 'Pro' AND auth.jwt() ->> 'tier' IN ('Pro', 'Pro+', 'Enterprise')) OR
      (tier_access = 'Pro+' AND auth.jwt() ->> 'tier' IN ('Pro+', 'Enterprise')) OR
      (tier_access = 'Enterprise' AND auth.jwt() ->> 'tier' = 'Enterprise')
    )
  );

-- Admin policy for full access (including inactive features)
CREATE POLICY "Admins can view all features" ON agentgift_features
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' = 'admin@agentgift.ai'
  );

-- Admin policy for full CRUD access
CREATE POLICY "Admins can manage all features" ON agentgift_features
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' = 'admin@agentgift.ai'
  );

-- Create view for public feature statistics
CREATE OR REPLACE VIEW public_feature_stats AS
SELECT 
  category,
  tier_access,
  COUNT(*) as feature_count,
  AVG(xp_value) as avg_xp_value,
  COUNT(*) FILTER (WHERE is_gamified = true) as gamified_count
FROM agentgift_features 
WHERE is_active = true 
GROUP BY category, tier_access;

-- Grant access to the view
GRANT SELECT ON public_feature_stats TO anon, authenticated;
