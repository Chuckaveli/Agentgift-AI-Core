-- Social Media Participation Tracker Schema

CREATE TABLE IF NOT EXISTS social_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- instagram, tiktok, twitter
  post_url TEXT NOT NULL,
  image_hash TEXT,
  caption_text TEXT,
  hashtags TEXT[] DEFAULT '{}',
  required_hashtags TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  xp_awarded INTEGER DEFAULT 0,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Campaigns
CREATE TABLE IF NOT EXISTS social_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  required_hashtags TEXT[] NOT NULL,
  optional_hashtags TEXT[] DEFAULT '{}',
  xp_reward INTEGER DEFAULT 25,
  badge_reward VARCHAR(255),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  min_posts_for_badge INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Platform Settings
CREATE TABLE IF NOT EXISTS social_platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) UNIQUE NOT NULL,
  api_endpoint TEXT,
  verification_enabled BOOLEAN DEFAULT true,
  auto_approve_threshold DECIMAL(3,2) DEFAULT 0.8, -- confidence threshold
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_proofs_user ON social_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_social_proofs_status ON social_proofs(status);
CREATE INDEX IF NOT EXISTS idx_social_proofs_platform ON social_proofs(platform);
CREATE INDEX IF NOT EXISTS idx_social_campaigns_active ON social_campaigns(is_active);

-- Insert default campaigns
INSERT INTO social_campaigns (name, description, required_hashtags, xp_reward, badge_reward, min_posts_for_badge, is_active) VALUES
('Gift Reveal Challenge', 'Share your gift reveals and surprise moments', '{"#AgentGifted", "#GiftRevealChallenge"}', 25, 'gift_reveal_hero', 3, true),
('Summer Gifting Campaign', 'Summer-themed gift sharing campaign', '{"#AgentGifted", "#SummerGifts"}', 30, 'summer_reveal_hero', 3, true),
('Holiday Spirit Campaign', 'Share your holiday gifting moments', '{"#AgentGifted", "#HolidaySpirit"}', 35, 'holiday_hero', 5, true),
('Love Language Posts', 'Share posts about love languages and meaningful gifts', '{"#AgentGifted", "#LoveLanguage"}', 25, 'love_language_ambassador', 3, true)
ON CONFLICT DO NOTHING;

-- Insert platform settings
INSERT INTO social_platform_settings (platform, verification_enabled) VALUES
('instagram', true),
('tiktok', true),
('twitter', true)
ON CONFLICT (platform) DO NOTHING;
