# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in AgentGift.ai, please report it via:

- **Email**: security@agentgift.ai
- **Security Form**: https://agentgift.ai/security
- **Security.txt**: https://agentgift.ai/.well-known/security.txt

### What to Include

Please include the following information:

1. **Type of vulnerability** (XSS, CSRF, SQL injection, etc.)
2. **Location** (file path, URL, or specific component)
3. **Steps to reproduce** (detailed, step-by-step)
4. **Proof of concept** (if possible)
5. **Impact assessment** (what can an attacker do?)
6. **Suggested fix** (if you have one)

### Response Timeline

- **24 hours**: Acknowledgment of your report
- **72 hours**: Initial assessment and response
- **7 days**: Status update on fix progress
- **30 days**: Public disclosure (coordinated with reporter)

## Security Measures

AgentGift.ai implements multiple layers of security:

### 1. Data Protection

- **Encryption at Rest**: AES-256-GCM encryption for sensitive data
- **Encryption in Transit**: TLS 1.3 for all connections
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Data Masking**: PII is masked in logs and error messages

### 2. Authentication & Authorization

- **Row-Level Security**: Supabase RLS policies on all tables
- **JWT Tokens**: Secure, short-lived session tokens
- **Role-Based Access Control**: Admin, user, and guest roles
- **Account Lockouts**: 5 failed attempts = 15-minute lockout
- **Session Management**: Secure, HTTPOnly cookies

### 3. API Security

- **Rate Limiting**: Configurable per endpoint
  - Auth: 5 requests / 15 minutes
  - API: 60 requests / 1 minute
  - Admin: 100 requests / 1 minute
- **CSRF Protection**: Token validation on all state-changing requests
- **Input Validation**: Zod schemas for all inputs
- **Output Sanitization**: XSS prevention on all outputs

### 4. Infrastructure Security

- **Security Headers**:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security` (HSTS)
  - `Content-Security-Policy` (CSP)
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **DDoS Protection**: Vercel edge network
- **Audit Logging**: All critical actions logged
- **Security Monitoring**: Real-time alerts for suspicious activity

### 5. Code Security

- **Dependency Scanning**: Automated via Dependabot
- **Static Analysis**: ESLint with security rules
- **Secret Scanning**: GitHub secret scanning enabled
- **Code Review**: All PRs require review before merge

## Security Features by Category

### Frontend Security

\`\`\`typescript
// XSS Prevention
const sanitized = sanitizeInput(userInput)

// CSRF Protection
const csrfToken = getCsrfToken()

// Content Security Policy
headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline';"
\`\`\`

### Backend Security

\`\`\`typescript
// Rate Limiting
await withRateLimit(req, rateLimitConfigs.api, handler)

// Encryption
const encrypted = encrypt(sensitiveData)

// Audit Logging
await logAuditEvent({
  event: 'user.action',
  actor: userId,
  ip: getIp(req),
  success: true
})
\`\`\`

### Database Security

\`\`\`sql
-- Row-Level Security
ALTER TABLE sensitive_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see own data"
  ON sensitive_table
  FOR SELECT
  USING (auth.uid() = user_id);

-- Audit Triggers
CREATE TRIGGER audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sensitive_table
  FOR EACH ROW EXECUTE FUNCTION log_audit();
\`\`\`

## Security Testing

### Automated Tests

\`\`\`bash
# Security scan
npm audit

# Unit tests with security focus
npm run test -- security

# E2E security tests
npm run test:e2e -- security.spec.ts

# Dependency vulnerability check
npm run security:check
\`\`\`

### Manual Testing Checklist

- [ ] Authentication bypass attempts
- [ ] Authorization bypass attempts
- [ ] SQL injection attempts
- [ ] XSS payload injection
- [ ] CSRF token validation
- [ ] Rate limit enforcement
- [ ] Session hijacking attempts
- [ ] API key security
- [ ] File upload security
- [ ] Input validation bypass

## OWASP Top 10 Compliance

| Risk | Status | Mitigation |
|------|--------|-----------|
| A01:2021 – Broken Access Control | ✅ | RLS policies, admin guards |
| A02:2021 – Cryptographic Failures | ✅ | AES-256-GCM, TLS 1.3 |
| A03:2021 – Injection | ✅ | Parameterized queries, input validation |
| A04:2021 – Insecure Design | ✅ | Security by design, threat modeling |
| A05:2021 – Security Misconfiguration | ✅ | Hardened defaults, security headers |
| A06:2021 – Vulnerable Components | ✅ | Automated dependency updates |
| A07:2021 – Authentication Failures | ✅ | Strong passwords, MFA, lockouts |
| A08:2021 – Data Integrity Failures | ✅ | Signed webhooks, audit logs |
| A09:2021 – Logging Failures | ✅ | Comprehensive audit logging |
| A10:2021 – Server-Side Request Forgery | ✅ | URL validation, allowlists |

## Compliance

### GDPR

- ✅ Right to access (data export)
- ✅ Right to erasure (data deletion)
- ✅ Right to portability (JSON export)
- ✅ Consent management
- ✅ Data breach notification
- ✅ Privacy by design

### SOC 2 Type II (Planned)

- Access control auditing
- Change management logging
- Incident response procedures
- Risk assessment documentation

## Security Contacts

- **Security Team**: security@agentgift.ai
- **General Support**: support@agentgift.ai
- **Bug Bounty**: bounty@agentgift.ai

## Responsible Disclosure

We believe in coordinated disclosure and will:

1. Acknowledge your report within 24 hours
2. Provide regular updates on fix progress
3. Credit you for the discovery (with your permission)
4. Not pursue legal action against good-faith researchers

## Safe Harbor

We support safe harbor for security researchers who:

- Make good faith effort to avoid data loss or service disruption
- Only test against accounts they own or have permission to access
- Report vulnerabilities promptly and keep them confidential
- Follow our disclosure timeline

## Security Updates

Subscribe to security updates:

- **Email**: Subscribe at https://agentgift.ai/security-updates
- **RSS**: https://agentgift.ai/security.rss
- **GitHub**: Watch this repository for security advisories

## Security Hall of Fame

We recognize researchers who have responsibly disclosed vulnerabilities:

(This section will be updated as reports are received)

## Questions?

For questions about this security policy:

- Email: security@agentgift.ai
- Form: https://agentgift.ai/security/contact

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Policy Owner**: Security Team
