"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { createClient } from "@supabase/supabase-js"

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key",
)

// Service definitions
export const EXTERNAL_SERVICES = {
  AMAZON_GIFTING: "amazon_gifting",
  DOORDASH: "doordash",
  OPENTABLE: "opentable",
  EXPEDIA: "expedia",
  SENDOSO: "sendoso",
  EVENTBRITE: "eventbrite",
} as const

export type ExternalService = (typeof EXTERNAL_SERVICES)[keyof typeof EXTERNAL_SERVICES]

// Service configurations
export const SERVICE_CONFIG: Record<
  ExternalService,
  {
    name: string
    description: string
    icon: string
    category: string
    creditCost: number
    requiredTier: string
    apiEndpoint: string
    isActive: boolean
    estimatedDelivery: string
  }
> = {
  [EXTERNAL_SERVICES.AMAZON_GIFTING]: {
    name: "Amazon Gifting",
    description: "Send physical items with personalized gift notes",
    icon: "📦",
    category: "Physical Gifts",
    creditCost: 10,
    requiredTier: "pro",
    apiEndpoint: "/api/services/amazon",
    isActive: true,
    estimatedDelivery: "1-2 business days",
  },
  [EXTERNAL_SERVICES.DOORDASH]: {
    name: "DoorDash Delivery",
    description: "Surprise meals and treats delivered to their door",
    icon: "🛵",
    category: "Food & Drinks",
    creditCost: 8,
    requiredTier: "pro",
    apiEndpoint: "/api/services/doordash",
    isActive: true,
    estimatedDelivery: "30-60 minutes",
  },
  [EXTERNAL_SERVICES.OPENTABLE]: {
    name: "OpenTable Reservations",
    description: "Book memorable dining experiences",
    icon: "🍽️",
    category: "Experiences",
    creditCost: 15,
    requiredTier: "agent00g",
    apiEndpoint: "/api/services/opentable",
    isActive: true,
    estimatedDelivery: "Instant confirmation",
  },
  [EXTERNAL_SERVICES.EXPEDIA]: {
    name: "Expedia Travel",
    description: "Gift travel experiences and accommodations",
    icon: "🏨",
    category: "Travel",
    creditCost: 25,
    requiredTier: "agent00g",
    apiEndpoint: "/api/services/expedia",
    isActive: true,
    estimatedDelivery: "Instant booking",
  },
  [EXTERNAL_SERVICES.SENDOSO]: {
    name: "Sendoso Corporate",
    description: "Professional bulk gifts and swag",
    icon: "📦",
    category: "Corporate",
    creditCost: 20,
    requiredTier: "business",
    apiEndpoint: "/api/services/sendoso",
    isActive: true,
    estimatedDelivery: "2-5 business days",
  },
  [EXTERNAL_SERVICES.EVENTBRITE]: {
    name: "Eventbrite Experiences",
    description: "Gift tickets to events and experiences",
    icon: "🎟️",
    category: "Events",
    creditCost: 12,
    requiredTier: "pro",
    apiEndpoint: "/api/services/eventbrite",
    isActive: true,
    estimatedDelivery: "Instant delivery",
  },
}

// Delivery options interface
export interface DeliveryOptions {
  service: ExternalService
  recipient: {
    name: string
    email?: string
    phone?: string
    address?: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  gift: {
    type: string
    description: string
    value?: number
    customization?: Record<string, any>
  }
  message?: {
    text: string
    senderName: string
  }
  delivery?: {
    date?: string
    time?: string
    instructions?: string
  }
  metadata?: Record<string, any>
}

// Delivery result interface
export interface DeliveryResult {
  success: boolean
  orderId?: string
  trackingNumber?: string
  estimatedDelivery?: string
  cost?: number
  creditsUsed: number
  error?: string
  details?: Record<string, any>
}

// External service hooks table interface
export interface ExternalServiceHook {
  id: string
  service: ExternalService
  user_id: string
  api_key_encrypted: string
  webhook_url?: string
  is_active: boolean
  last_used?: string
  usage_count: number
  created_at: string
  updated_at: string
}

// Main delivery handler
export async function handleDelivery(userId: string, options: DeliveryOptions): Promise<DeliveryResult> {
  try {
    const serviceConfig = SERVICE_CONFIG[options.service]

    // Validate service is active
    if (!serviceConfig.isActive) {
      throw new Error(`Service ${serviceConfig.name} is currently unavailable`)
    }

    // Check user tier access
    const { data: userProfile } = await supabase.from("user_profiles").select("tier, credits").eq("id", userId).single()

    if (!userProfile) {
      throw new Error("User profile not found")
    }

    // Validate tier access
    if (!hasServiceAccess(userProfile.tier, options.service)) {
      throw new Error(`Service requires ${serviceConfig.requiredTier} tier or higher`)
    }

    // Check credits
    if (userProfile.credits < serviceConfig.creditCost) {
      throw new Error(`Insufficient credits. Need ${serviceConfig.creditCost}, have ${userProfile.credits}`)
    }

    // Get service hook
    const { data: serviceHook } = await supabase
      .from("external_service_hooks")
      .select("*")
      .eq("user_id", userId)
      .eq("service", options.service)
      .eq("is_active", true)
      .single()

    if (!serviceHook) {
      throw new Error(`No active ${serviceConfig.name} integration found`)
    }

    // Call the appropriate service handler
    const result = await callExternalService(options, serviceHook)

    // Deduct credits on success
    if (result.success) {
      await supabase
        .from("user_profiles")
        .update({
          credits: userProfile.credits - serviceConfig.creditCost,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      // Update service usage
      await supabase
        .from("external_service_hooks")
        .update({
          usage_count: serviceHook.usage_count + 1,
          last_used: new Date().toISOString(),
        })
        .eq("id", serviceHook.id)

      // Log delivery
      await logDelivery(userId, options, result)
    }

    return {
      ...result,
      creditsUsed: serviceConfig.creditCost,
    }
  } catch (error) {
    console.error("Delivery error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      creditsUsed: 0,
    }
  }
}

// Service access validation
export function hasServiceAccess(userTier: string, service: ExternalService): boolean {
  const serviceConfig = SERVICE_CONFIG[service]
  const tierHierarchy = {
    free: 0,
    premium: 1,
    pro: 2,
    agent00g: 3,
    business: 4,
    enterprise: 5,
  }

  const userLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0
  const requiredLevel = tierHierarchy[serviceConfig.requiredTier as keyof typeof tierHierarchy] || 0

  return userLevel >= requiredLevel
}

// External service API calls
async function callExternalService(
  options: DeliveryOptions,
  serviceHook: ExternalServiceHook,
): Promise<DeliveryResult> {
  const serviceConfig = SERVICE_CONFIG[options.service]

  try {
    // In production, these would be real API calls
    // For now, we'll simulate the responses

    switch (options.service) {
      case EXTERNAL_SERVICES.AMAZON_GIFTING:
        return await simulateAmazonDelivery(options)

      case EXTERNAL_SERVICES.DOORDASH:
        return await simulateDoorDashDelivery(options)

      case EXTERNAL_SERVICES.OPENTABLE:
        return await simulateOpenTableBooking(options)

      case EXTERNAL_SERVICES.EXPEDIA:
        return await simulateExpediaBooking(options)

      case EXTERNAL_SERVICES.SENDOSO:
        return await simulateSendosoDelivery(options)

      case EXTERNAL_SERVICES.EVENTBRITE:
        return await simulateEventbriteBooking(options)

      default:
        throw new Error(`Unsupported service: ${options.service}`)
    }
  } catch (error) {
    throw new Error(`${serviceConfig.name} API error: ${error}`)
  }
}

// Simulated service responses (replace with real API calls in production)
async function simulateAmazonDelivery(options: DeliveryOptions): Promise<DeliveryResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API delay

  return {
    success: true,
    orderId: `AMZ-${Date.now()}`,
    trackingNumber: `1Z999AA1234567890`,
    estimatedDelivery: "Tomorrow by 8 PM",
    cost: 29.99,
    creditsUsed: 0, // Will be set by handleDelivery
    details: {
      carrier: "Amazon Logistics",
      giftWrap: true,
      giftMessage: options.message?.text,
    },
  }
}

async function simulateDoorDashDelivery(options: DeliveryOptions): Promise<DeliveryResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return {
    success: true,
    orderId: `DD-${Date.now()}`,
    estimatedDelivery: "45 minutes",
    cost: 24.5,
    creditsUsed: 0,
    details: {
      restaurant: "Local Favorite Cafe",
      items: options.gift.description,
      deliveryFee: 3.99,
    },
  }
}

async function simulateOpenTableBooking(options: DeliveryOptions): Promise<DeliveryResult> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    success: true,
    orderId: `OT-${Date.now()}`,
    estimatedDelivery: "Confirmed",
    cost: 0, // Reservation fee
    creditsUsed: 0,
    details: {
      restaurant: "The Garden Bistro",
      date: options.delivery?.date || "Next Friday",
      time: options.delivery?.time || "7:00 PM",
      partySize: 2,
      confirmationCode: "ABC123",
    },
  }
}

async function simulateExpediaBooking(options: DeliveryOptions): Promise<DeliveryResult> {
  await new Promise((resolve) => setTimeout(resolve, 3000))

  return {
    success: true,
    orderId: `EXP-${Date.now()}`,
    estimatedDelivery: "Instant confirmation",
    cost: 299.0,
    creditsUsed: 0,
    details: {
      hotel: "Boutique Downtown Hotel",
      checkIn: "2024-02-15",
      checkOut: "2024-02-17",
      roomType: "Deluxe King",
      confirmationNumber: "EXP789456",
    },
  }
}

async function simulateSendosoDelivery(options: DeliveryOptions): Promise<DeliveryResult> {
  await new Promise((resolve) => setTimeout(resolve, 2500))

  return {
    success: true,
    orderId: `SND-${Date.now()}`,
    trackingNumber: `SND123456789`,
    estimatedDelivery: "3-5 business days",
    cost: 45.0,
    creditsUsed: 0,
    details: {
      package: "Premium Welcome Kit",
      items: ["Branded notebook", "Coffee tumbler", "Gourmet snacks"],
      customBranding: true,
    },
  }
}

async function simulateEventbriteBooking(options: DeliveryOptions): Promise<DeliveryResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200))

  return {
    success: true,
    orderId: `EB-${Date.now()}`,
    estimatedDelivery: "Tickets sent via email",
    cost: 75.0,
    creditsUsed: 0,
    details: {
      event: "Wine Tasting Experience",
      date: "2024-02-20",
      time: "6:00 PM",
      venue: "Downtown Wine Bar",
      ticketType: "VIP Experience",
      ticketCount: 2,
    },
  }
}

// Log delivery for tracking
async function logDelivery(userId: string, options: DeliveryOptions, result: DeliveryResult): Promise<void> {
  try {
    await supabase.from("delivery_logs").insert({
      user_id: userId,
      service: options.service,
      order_id: result.orderId,
      tracking_number: result.trackingNumber,
      recipient_name: options.recipient.name,
      recipient_email: options.recipient.email,
      gift_description: options.gift.description,
      cost: result.cost,
      credits_used: result.creditsUsed,
      status: result.success ? "completed" : "failed",
      details: {
        options,
        result,
      },
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to log delivery:", error)
  }
}

// Get user's available services
export async function getUserAvailableServices(userId: string): Promise<
  {
    service: ExternalService
    config: (typeof SERVICE_CONFIG)[ExternalService]
    hasAccess: boolean
    isConnected: boolean
  }[]
> {
  try {
    // Get user profile
    const { data: userProfile } = await supabase.from("user_profiles").select("tier").eq("id", userId).single()

    // Get connected services
    const { data: connectedServices } = await supabase
      .from("external_service_hooks")
      .select("service")
      .eq("user_id", userId)
      .eq("is_active", true)

    const connectedServiceIds = connectedServices?.map((s) => s.service) || []

    return Object.entries(SERVICE_CONFIG).map(([serviceId, config]) => ({
      service: serviceId as ExternalService,
      config,
      hasAccess: hasServiceAccess(userProfile?.tier || "free", serviceId as ExternalService),
      isConnected: connectedServiceIds.includes(serviceId as ExternalService),
    }))
  } catch (error) {
    console.error("Error getting user services:", error)
    return []
  }
}

// Concierge AI integration
export function suggestPhysicalFollowThrough(
  emotion: string,
  campaignStep: string,
  userTier: string,
): {
  service: ExternalService
  suggestion: string
  reasoning: string
}[] {
  const suggestions: {
    service: ExternalService
    suggestion: string
    reasoning: string
  }[] = []

  // Emotion-based suggestions
  switch (emotion.toLowerCase()) {
    case "cozy":
    case "comfort":
      suggestions.push({
        service: EXTERNAL_SERVICES.DOORDASH,
        suggestion: "Send warm comfort food like soup or hot chocolate",
        reasoning: "Physical comfort food enhances the cozy emotional experience",
      })
      suggestions.push({
        service: EXTERNAL_SERVICES.AMAZON_GIFTING,
        suggestion: "Deliver a soft blanket or aromatherapy candles",
        reasoning: "Tangible comfort items extend the cozy feeling",
      })
      break

    case "celebration":
    case "joy":
      suggestions.push({
        service: EXTERNAL_SERVICES.EVENTBRITE,
        suggestion: "Gift tickets to a fun local experience",
        reasoning: "Shared experiences amplify celebratory emotions",
      })
      suggestions.push({
        service: EXTERNAL_SERVICES.OPENTABLE,
        suggestion: "Book a special dinner reservation",
        reasoning: "Memorable dining creates lasting celebratory moments",
      })
      break

    case "romantic":
    case "love":
      suggestions.push({
        service: EXTERNAL_SERVICES.EXPEDIA,
        suggestion: "Surprise weekend getaway for two",
        reasoning: "Travel experiences deepen romantic connections",
      })
      suggestions.push({
        service: EXTERNAL_SERVICES.OPENTABLE,
        suggestion: "Reserve an intimate dinner for two",
        reasoning: "Romantic dining creates perfect intimate moments",
      })
      break

    case "appreciation":
    case "gratitude":
      suggestions.push({
        service: EXTERNAL_SERVICES.SENDOSO,
        suggestion: "Send a thoughtful appreciation gift box",
        reasoning: "Professional gifts show serious appreciation",
      })
      suggestions.push({
        service: EXTERNAL_SERVICES.AMAZON_GIFTING,
        suggestion: "Deliver their favorite book or hobby item",
        reasoning: "Personal interests show thoughtful appreciation",
      })
      break
  }

  // Filter by user tier access
  return suggestions.filter((s) => hasServiceAccess(userTier, s.service))
}

