import { z } from "zod"

// User schemas
export const profileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  tier: z.enum(["free", "pro", "enterprise"]).default("free"),
  plan: z.enum(["basic", "premium", "enterprise"]).default("basic"),
  preferences: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(120),
  preferences: z.record(z.any()).optional(),
})

// Message schemas
export const createMessageSchema = z.object({
  threadId: z.string().uuid(),
  content: z.string().min(1).max(8000),
  requestId: z.string().uuid().optional(),
  tts: z
    .object({
      enable: z.boolean(),
      voiceId: z.string().optional(),
    })
    .optional(),
})

export const messageSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  thread_id: z.string().uuid(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  request_id: z.string().optional(),
  status: z.enum(["queued", "processing", "completed", "failed"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// TTS schemas
export const ttsRequestSchema = z.object({
  messageId: z.string().uuid(),
  voiceId: z.string().optional(),
})

// Gift schemas
export const smartSearchSchema = z.object({
  query: z.string().min(1),
  recipient: z
    .object({
      relationship: z.string().optional(),
      age: z.number().optional(),
      interests: z.array(z.string()).optional(),
    })
    .optional(),
  budget: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  occasion: z.string().optional(),
})

export const saveGiftSchema = z.object({
  giftId: z.string(),
  giftName: z.string().min(1),
  recipientName: z.string().optional(),
  occasion: z.string().optional(),
  price: z.number().optional(),
  notes: z.string().optional(),
})

// Job schemas
export const jobSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.string(),
  payload: z.record(z.any()),
  status: z.enum(["queued", "running", "done", "error", "cancelled"]),
  retry_count: z.number().default(0),
  error_message: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const listJobsSchema = z
  .object({
    status: z.enum(["queued", "running", "done", "error"]).optional(),
    limit: z.number().min(1).max(200).optional(),
  })
  .optional()

// Feature schemas
export const trackUsageSchema = z.object({
  featureId: z.string(),
  metadata: z.record(z.any()).optional(),
})

export const featureUsageSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  feature_id: z.string(),
  metadata: z.record(z.any()),
  created_at: z.string().datetime(),
})
