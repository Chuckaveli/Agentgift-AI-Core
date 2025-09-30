import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const KEY_LENGTH = 32
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

// Get encryption key from environment
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set")
  }
  return Buffer.from(key, "hex")
}

// Encrypt data
export function encrypt(data: string): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(data, "utf8", "hex")
    encrypted += cipher.final("hex")

    const authTag = cipher.getAuthTag()

    // Return: iv + authTag + encrypted data
    return iv.toString("hex") + authTag.toString("hex") + encrypted
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt data")
  }
}

// Decrypt data
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey()

    // Extract iv, authTag, and encrypted data
    const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), "hex")
    const authTag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2), "hex")
    const encrypted = encryptedData.slice((IV_LENGTH + AUTH_TAG_LENGTH) * 2)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt data")
  }
}

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require("bcryptjs")
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require("bcryptjs")
  return bcrypt.compare(password, hash)
}

// Generate secure random token
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

// Hash data with SHA-256
export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

// Mask sensitive data
export function maskEmail(email: string): string {
  const [username, domain] = email.split("@")
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`
  }
  return `${username.slice(0, 2)}***@${domain}`
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
}

export function maskCreditCard(card: string): string {
  return card.replace(/\d(?=\d{4})/g, "*")
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
}

// Validate password strength
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  // Check against common passwords
  const commonPasswords = ["password123", "123456789", "qwerty123", "admin123", "letmein123", "welcome123"]
  if (commonPasswords.some((common) => password.toLowerCase().includes(common))) {
    errors.push("Password is too common")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
