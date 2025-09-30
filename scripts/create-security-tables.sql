-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  actor TEXT NOT NULL,
  target TEXT,
  ip TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND admin_role IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Security events table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ip TEXT,
  details JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for security events
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- Enable RLS
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all security events" ON security_events;
CREATE POLICY "Admins can view all security events"
  ON security_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND admin_role IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "Admins can update security events" ON security_events;
CREATE POLICY "Admins can update security events"
  ON security_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND admin_role IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "System can insert security events" ON security_events;
CREATE POLICY "System can insert security events"
  ON security_events FOR INSERT
  WITH CHECK (true);

-- Failed login attempts tracking
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  last_attempt TIMESTAMPTZ DEFAULT NOW(),
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for failed login attempts
CREATE INDEX IF NOT EXISTS idx_failed_logins_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip ON failed_login_attempts(ip);
CREATE INDEX IF NOT EXISTS idx_failed_logins_locked_until ON failed_login_attempts(locked_until);

-- Enable RLS
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view failed logins" ON failed_login_attempts;
CREATE POLICY "Admins can view failed logins"
  ON failed_login_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND admin_role IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "System can manage failed logins" ON failed_login_attempts;
CREATE POLICY "System can manage failed logins"
  ON failed_login_attempts FOR ALL
  USING (true)
  WITH CHECK (true);

-- API key usage tracking
CREATE TABLE IF NOT EXISTS api_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  ip TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for API key usage
CREATE INDEX IF NOT EXISTS idx_api_key_usage_api_key_id ON api_key_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_created_at ON api_key_usage(created_at DESC);

-- Enable RLS
ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read API key usage" ON api_key_usage;
CREATE POLICY "Admins can read API key usage"
  ON api_key_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND admin_role IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "System can insert API key usage" ON api_key_usage;
CREATE POLICY "System can insert API key usage"
  ON api_key_usage FOR INSERT
  WITH CHECK (true);

-- API Keys Table (for service-to-service auth)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '[]',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_revoked ON api_keys(revoked);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);

-- RLS for API keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own API keys" ON api_keys;
CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create API keys" ON api_keys;
CREATE POLICY "Users can create API keys"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can revoke own API keys" ON api_keys;
CREATE POLICY "Users can revoke own API keys"
  ON api_keys FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all API keys" ON api_keys;
CREATE POLICY "Admins can manage all API keys"
  ON api_keys FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND admin_role IS NOT NULL
    )
  );

-- Session Logs Table
CREATE TABLE IF NOT EXISTS session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  login_at TIMESTAMPTZ DEFAULT NOW(),
  logout_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Indexes for session logs
CREATE INDEX IF NOT EXISTS idx_session_logs_user_id ON session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_token ON session_logs(session_token);
CREATE INDEX IF NOT EXISTS idx_session_logs_active ON session_logs(is_active);
CREATE INDEX IF NOT EXISTS idx_session_logs_login_at ON session_logs(login_at DESC);

-- RLS for session logs
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sessions" ON session_logs;
CREATE POLICY "Users can view own sessions"
  ON session_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage sessions" ON session_logs;
CREATE POLICY "System can manage sessions"
  ON session_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Functions

-- Function to track failed login
CREATE OR REPLACE FUNCTION track_failed_login(
  p_email TEXT,
  p_ip TEXT
)
RETURNS VOID AS $$
DECLARE
  v_attempt_count INTEGER;
  v_locked_until TIMESTAMPTZ;
BEGIN
  -- Get current attempt count
  SELECT attempt_count, locked_until INTO v_attempt_count, v_locked_until
  FROM failed_login_attempts
  WHERE email = p_email
  AND ip = p_ip
  AND (locked_until IS NULL OR locked_until < NOW());
  
  IF v_attempt_count IS NULL THEN
    -- First failed attempt
    INSERT INTO failed_login_attempts (email, ip, attempt_count)
    VALUES (p_email, p_ip, 1);
  ELSE
    -- Increment attempt count
    v_attempt_count := v_attempt_count + 1;
    
    -- Lock account after 5 failed attempts
    IF v_attempt_count >= 5 THEN
      v_locked_until := NOW() + INTERVAL '15 minutes';
    END IF;
    
    UPDATE failed_login_attempts
    SET 
      attempt_count = v_attempt_count,
      last_attempt = NOW(),
      locked_until = v_locked_until
    WHERE email = p_email AND ip = p_ip;
    
    -- Create security event for account lockout
    IF v_locked_until IS NOT NULL THEN
      INSERT INTO security_events (event_type, severity, details)
      VALUES (
        'account_locked',
        'medium',
        jsonb_build_object(
          'email', p_email,
          'ip', p_ip,
          'attempt_count', v_attempt_count,
          'locked_until', v_locked_until
        )
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(
  p_email TEXT,
  p_ip TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_locked_until TIMESTAMPTZ;
BEGIN
  SELECT locked_until INTO v_locked_until
  FROM failed_login_attempts
  WHERE email = p_email
  AND ip = p_ip;
  
  RETURN v_locked_until IS NOT NULL AND v_locked_until > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear failed login attempts (on successful login)
CREATE OR REPLACE FUNCTION clear_failed_logins(
  p_email TEXT,
  p_ip TEXT
)
RETURNS VOID AS $$
BEGIN
  DELETE FROM failed_login_attempts
  WHERE email = p_email
  AND ip = p_ip;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers

-- Trigger to auto-cleanup old audit logs (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_audit_logs ON audit_logs;
CREATE TRIGGER trigger_cleanup_audit_logs
  AFTER INSERT ON audit_logs
  EXECUTE FUNCTION cleanup_old_audit_logs();

-- Trigger to auto-cleanup old security events (keep resolved events for 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM security_events
  WHERE resolved = true
  AND resolved_at < NOW() - INTERVAL '30 days';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_security_events ON security_events;
CREATE TRIGGER trigger_cleanup_security_events
  AFTER UPDATE ON security_events
  EXECUTE FUNCTION cleanup_old_security_events();

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify all tables exist
DO $$
DECLARE
  missing_tables TEXT[];
BEGIN
  SELECT ARRAY_AGG(table_name)
  INTO missing_tables
  FROM (
    VALUES 
      ('audit_logs'),
      ('failed_login_attempts'),
      ('security_events'),
      ('api_keys'),
      ('session_logs')
  ) AS required_tables(table_name)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = required_tables.table_name
  );
  
  IF missing_tables IS NOT NULL THEN
    RAISE EXCEPTION 'Missing security tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE '✅ All security tables created successfully!';
  END IF;
END $$;

-- =============================================================================
-- SECURITY TABLES MIGRATION COMPLETE
-- =============================================================================
