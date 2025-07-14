-- External service hooks table
CREATE TABLE IF NOT EXISTS external_service_hooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_encrypted TEXT NOT NULL,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- Delivery logs table
CREATE TABLE IF NOT EXISTS delivery_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  order_id TEXT,
  tracking_number TEXT,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  gift_description TEXT NOT NULL,
  cost DECIMAL(10,2),
  credits_used INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_external_service_hooks_user_id ON external_service_hooks(user_id);
CREATE INDEX IF NOT EXISTS idx_external_service_hooks_service ON external_service_hooks(service);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_user_id ON delivery_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_status ON delivery_logs(status);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_created_at ON delivery_logs(created_at);

-- Row Level Security
ALTER TABLE external_service_hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own service hooks" ON external_service_hooks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own service hooks" ON external_service_hooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service hooks" ON external_service_hooks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service hooks" ON external_service_hooks
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own delivery logs" ON delivery_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own delivery logs" ON delivery_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_external_service_hooks_updated_at
  BEFORE UPDATE ON external_service_hooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_logs_updated_at
  BEFORE UPDATE ON delivery_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
