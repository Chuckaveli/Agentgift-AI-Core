-- Create gift_entry_leads table for storing lead data from the "Gift Now" flow
CREATE TABLE IF NOT EXISTS gift_entry_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  birthday DATE,
  love_language TEXT,
  interests TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  ip_address TEXT,
  user_agent TEXT,
  converted_to_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gift_entry_leads_created_at ON gift_entry_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_gift_entry_leads_relationship ON gift_entry_leads(relationship);
CREATE INDEX IF NOT EXISTS idx_gift_entry_leads_converted ON gift_entry_leads(converted_to_user);

-- Enable Row Level Security
ALTER TABLE gift_entry_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all leads
CREATE POLICY "Admins can view all gift entry leads" ON gift_entry_leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@agentgift.ai'
    )
  );

-- Create policy for service role to insert leads
CREATE POLICY "Service role can insert gift entry leads" ON gift_entry_leads
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gift_entry_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_gift_entry_leads_updated_at
  BEFORE UPDATE ON gift_entry_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_gift_entry_leads_updated_at();

-- Insert some sample data for testing
INSERT INTO gift_entry_leads (name, relationship, birthday, love_language, interests, notes) VALUES
('Sarah Johnson', 'friend', '1990-05-15', 'gifts', ARRAY['books', 'wellness', 'travel'], 'Loves yoga and reading mystery novels'),
('Mike Chen', 'coworker', '1985-12-03', 'acts', ARRAY['tech', 'gaming', 'fitness'], 'Always helping others with computer problems'),
('Mom', 'parent', '1965-08-22', 'time', ARRAY['cooking', 'art', 'pets'], 'Enjoys painting and spending time with her cats');

COMMENT ON TABLE gift_entry_leads IS 'Stores lead data from the Gift Now 30-second flow for conversion tracking';
