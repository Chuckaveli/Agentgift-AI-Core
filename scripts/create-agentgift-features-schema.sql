-- Create the agentgift_features table
CREATE TABLE IF NOT EXISTS agentgift_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tier_access VARCHAR(50) NOT NULL CHECK (tier_access IN ('Free', 'Pro', 'Pro+', 'Enterprise')),
  category VARCHAR(100) NOT NULL CHECK (category IN ('Games', 'Individual User Tools', 'Business Features', 'AI/Admin Systems')),
  route_path VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agentgift_features_category ON agentgift_features(category);
CREATE INDEX IF NOT EXISTS idx_agentgift_features_tier ON agentgift_features(tier_access);
CREATE INDEX IF NOT EXISTS idx_agentgift_features_active ON agentgift_features(is_active);

-- Insert sample features
INSERT INTO agentgift_features (feature_name, description, tier_access, category, route_path) VALUES
-- Games
('BondCraft', 'Interactive relationship-building game that helps you understand your loved ones better through trivia and challenges.', 'Pro', 'Games', '/bondcraft'),
('Ghost Hunt', 'Spooky gift discovery game where you hunt for hidden presents in virtual haunted locations.', 'Free', 'Games', '/ghost-hunt'),
('Thought Heist', 'Mind-bending puzzle game that reveals perfect gift ideas through psychological challenges.', 'Pro+', 'Games', '/thought-heist'),
('Serendipity Engine', 'Magical gift discovery experience that uses AI to create unexpected perfect matches.', 'Pro', 'Games', '/serendipity'),

-- Individual User Tools
('Agent Gifty', 'Your personal AI gift concierge that learns your preferences and suggests perfect presents.', 'Free', 'Individual User Tools', '/agent-gifty'),
('Gift DNA Analyzer', 'Deep personality analysis tool that creates a unique gifting profile for better recommendations.', 'Pro', 'Individual User Tools', '/gift-dna'),
('Smart Search', 'Advanced AI-powered search that understands context, emotions, and cultural nuances.', 'Free', 'Individual User Tools', '/smart-search'),
('Cultural Respect Guide', 'Comprehensive cultural intelligence system ensuring appropriate gifts across all traditions.', 'Pro', 'Individual User Tools', '/cultural-respect'),
('Emotion Tags', 'Emotional intelligence tagging system that matches gifts to feelings and occasions.', 'Pro+', 'Individual User Tools', '/emotion-tags'),
('Gift Reveal Experience', 'Interactive gift unveiling with personalized animations and voice narration.', 'Pro', 'Individual User Tools', '/reveal'),

-- Business Features
('Group Gifting Manager', 'Coordinate team gifts, split costs, and manage group contributions seamlessly.', 'Pro', 'Business Features', '/group-gifting'),
('Business Gift Suite', 'Enterprise-grade gifting solutions for client relationships and employee recognition.', 'Enterprise', 'Business Features', '/business'),
('Custom Holiday Creator', 'Create and manage company-specific holidays and celebration schedules.', 'Enterprise', 'Business Features', '/business/custom-holidays'),
('EmotiTokens Economy', 'Internal token system for employee recognition and emotional wellness tracking.', 'Enterprise', 'Business Features', '/emotitokens'),
('Great Samaritan Program', 'Community giving platform that connects businesses with local charitable opportunities.', 'Enterprise', 'Business Features', '/admin/great-samaritan'),

-- AI/Admin Systems
('Giftverse Leader Bot', 'Advanced AI assistant for platform management and strategic intelligence.', 'Enterprise', 'AI/Admin Systems', '/admin/giftverse-leader'),
('Voice Guardian', 'AI voice authentication and interaction management system.', 'Enterprise', 'AI/Admin Systems', '/admin/voice-guardian'),
('Visual Analytics Engine', 'Real-time data visualization and business intelligence dashboard.', 'Enterprise', 'AI/Admin Systems', '/admin/visual-analytics'),
('Memory Vault', 'AI-powered knowledge management system that learns from user interactions.', 'Enterprise', 'AI/Admin Systems', '/admin/memory-vault'),
('Economy Architect', 'Advanced tokenomics and reward system management platform.', 'Enterprise', 'AI/Admin Systems', '/admin/economy-architect'),
('Feature Builder', 'Dynamic feature creation and management system for rapid platform expansion.', 'Enterprise', 'AI/Admin Systems', '/admin/feature-builder'),
('Social Proof Verifier', 'AI system that validates and manages user testimonials and social proof.', 'Pro+', 'AI/Admin Systems', '/features/social-proof-verifier'),
('Pride Alliance Hub', 'Inclusive community features and LGBTQ+ celebration management.', 'Pro', 'AI/Admin Systems', '/features/pride-alliance');

-- Create RLS policies
ALTER TABLE agentgift_features ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to Free tier features
CREATE POLICY "Public can view free features" ON agentgift_features
  FOR SELECT USING (tier_access = 'Free' AND is_active = true);

-- Policy for authenticated users to view Pro features
CREATE POLICY "Authenticated users can view pro features" ON agentgift_features
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    tier_access IN ('Free', 'Pro') AND 
    is_active = true
  );

-- Policy for Pro+ users
CREATE POLICY "Pro+ users can view pro+ features" ON agentgift_features
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    tier_access IN ('Free', 'Pro', 'Pro+') AND 
    is_active = true
  );

-- Policy for Enterprise users (admin access)
CREATE POLICY "Enterprise users can view all features" ON agentgift_features
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    is_active = true
  );

-- Admin policy for full CRUD access
CREATE POLICY "Admins can manage all features" ON agentgift_features
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' = 'admin@agentgift.ai'
  );
