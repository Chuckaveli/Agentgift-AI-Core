import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Declare Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface EmotionalAnalysisRequest {
  text_input?: string
  voice_input?: string // Base64 encoded audio
  image_input?: string // Base64 encoded image
  context?: {
    user_mood?: string
    interaction_type?: "gift_search" | "conversation" | "feedback" | "general"
    previous_emotions?: string[]
  }
  analysis_depth?: "basic" | "detailed" | "comprehensive"
}

interface EmotionalSignature {
  primary_emotion: string
  secondary_emotions: string[]
  intensity_score: number // 0-10
  valence: "positive" | "negative" | "neutral"
  arousal: "high" | "medium" | "low"
  emotional_tags: string[]
  confidence_score: number
  psychological_insights: {
    personality_indicators: string[]
    communication_style: string
    emotional_needs: string[]
    gift_preferences: string[]
  }
  recommendations: {
    response_tone: string
    gift_categories: string[]
    interaction_approach: string
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    // Authenticate user
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("No authorization header")
    }

    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      throw new Error("Invalid authentication")
    }

    // Get user profile
    const { data: userProfile } = await supabaseClient.from("user_profiles").select("*").eq("id", user.id).single()

    if (!userProfile) {
      throw new Error("User profile not found")
    }

    const requestData: EmotionalAnalysisRequest = await req.json()

    // Perform emotional analysis
    const emotionalSignature = await analyzeEmotionalSignature(requestData, userProfile, supabaseClient)

    // Store emotional signature for future reference
    await storeEmotionalSignature(user.id, emotionalSignature, requestData, supabaseClient)

    // Update user's emotional profile
    await updateUserEmotionalProfile(user.id, emotionalSignature, supabaseClient)

    // Award XP for emotional analysis
    await awardXPForEmotionalAnalysis(user.id, requestData.analysis_depth || "basic", supabaseClient)

    return new Response(
      JSON.stringify({
        success: true,
        emotional_signature: emotionalSignature,
        user_tier: userProfile.tier,
        analysis_credits_remaining: calculateAnalysisCreditsRemaining(userProfile),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error("Emotion signature injector error:", error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    )
  }
})

async function analyzeEmotionalSignature(
  request: EmotionalAnalysisRequest,
  userProfile: any,
  supabaseClient: any,
): Promise<EmotionalSignature> {
  const analysisResults: any = {}

  // Text Analysis using OpenAI
  if (request.text_input) {
    analysisResults.text = await analyzeTextEmotion(request.text_input)
  }

  // Voice Analysis using Whisper + Emotion Detection
  if (request.voice_input) {
    analysisResults.voice = await analyzeVoiceEmotion(request.voice_input)
  }

  // Image Analysis using Vision API
  if (request.image_input) {
    analysisResults.image = await analyzeImageEmotion(request.image_input)
  }

  // Combine all analysis results
  const combinedSignature = combineEmotionalAnalysis(analysisResults, request.context)

  // Apply user history and context
  const enhancedSignature = await enhanceWithUserHistory(combinedSignature, userProfile, supabaseClient)

  return enhancedSignature
}

async function analyzeTextEmotion(text: string): Promise<any> {
  const prompt = `
    Analyze the emotional content of this text and provide a detailed emotional signature:
    
    Text: "${text}"
    
    Please identify:
    1. Primary emotion (joy, sadness, anger, fear, surprise, disgust, trust, anticipation)
    2. Secondary emotions (up to 3)
    3. Intensity score (0-10)
    4. Valence (positive/negative/neutral)
    5. Arousal level (high/medium/low)
    6. Emotional tags (descriptive words)
    7. Personality indicators
    8. Communication style
    9. Emotional needs
    10. Gift preferences based on emotional state
    
    Respond in JSON format.
  `

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert emotional intelligence analyst specializing in gift psychology and human behavior analysis.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to analyze text emotion")
  }

  const result = await response.json()
  const content = result.choices[0]?.message?.content || "{}"

  try {
    return JSON.parse(content)
  } catch {
    // Fallback if JSON parsing fails
    return {
      primary_emotion: "neutral",
      intensity_score: 5,
      confidence_score: 0.5,
    }
  }
}

async function analyzeVoiceEmotion(voiceData: string): Promise<any> {
  // First, transcribe the audio using Whisper
  const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
    },
    body: createFormData(voiceData),
  })

  if (!transcriptionResponse.ok) {
    throw new Error("Failed to transcribe audio")
  }

  const transcription = await transcriptionResponse.json()

  // Analyze the transcribed text for emotions
  const textAnalysis = await analyzeTextEmotion(transcription.text)

  // Add voice-specific analysis (tone, pace, etc.)
  // This would typically use a specialized voice emotion API
  return {
    ...textAnalysis,
    voice_characteristics: {
      tone: "calm", // Mock data - would come from voice analysis
      pace: "normal",
      volume: "medium",
      clarity: "high",
    },
    transcription: transcription.text,
  }
}

async function analyzeImageEmotion(imageData: string): Promise<any> {
  // Use OpenAI Vision API to analyze facial expressions and visual cues
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze the emotional content of this image. Look for facial expressions, body language, colors, and overall mood. Provide emotional insights in JSON format.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageData}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to analyze image emotion")
  }

  const result = await response.json()
  const content = result.choices[0]?.message?.content || "{}"

  try {
    return JSON.parse(content)
  } catch {
    return {
      primary_emotion: "neutral",
      visual_cues: ["unclear"],
      confidence_score: 0.3,
    }
  }
}

function combineEmotionalAnalysis(analysisResults: any, context?: any): EmotionalSignature {
  // Combine text, voice, and image analysis results
  const allEmotions: string[] = []
  const allIntensities: number[] = []
  const allConfidences: number[] = []

  if (analysisResults.text) {
    allEmotions.push(analysisResults.text.primary_emotion)
    allIntensities.push(analysisResults.text.intensity_score || 5)
    allConfidences.push(analysisResults.text.confidence_score || 0.5)
  }

  if (analysisResults.voice) {
    allEmotions.push(analysisResults.voice.primary_emotion)
    allIntensities.push(analysisResults.voice.intensity_score || 5)
    allConfidences.push(analysisResults.voice.confidence_score || 0.5)
  }

  if (analysisResults.image) {
    allEmotions.push(analysisResults.image.primary_emotion)
    allIntensities.push(analysisResults.image.intensity_score || 5)
    allConfidences.push(analysisResults.image.confidence_score || 0.5)
  }

  // Calculate weighted averages
  const avgIntensity = allIntensities.reduce((a, b) => a + b, 0) / allIntensities.length || 5
  const avgConfidence = allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length || 0.5

  // Determine primary emotion (most frequent)
  const emotionCounts = allEmotions.reduce(
    (acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const primaryEmotion = Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "neutral"

  // Generate comprehensive signature
  return {
    primary_emotion: primaryEmotion,
    secondary_emotions: Object.keys(emotionCounts)
      .filter((e) => e !== primaryEmotion)
      .slice(0, 3),
    intensity_score: Math.round(avgIntensity * 10) / 10,
    valence: determineValence(primaryEmotion),
    arousal: determineArousal(avgIntensity),
    emotional_tags: generateEmotionalTags(analysisResults),
    confidence_score: Math.round(avgConfidence * 100) / 100,
    psychological_insights: {
      personality_indicators: extractPersonalityIndicators(analysisResults),
      communication_style: determineCommunicationStyle(analysisResults),
      emotional_needs: identifyEmotionalNeeds(primaryEmotion, avgIntensity),
      gift_preferences: suggestGiftPreferences(primaryEmotion, analysisResults),
    },
    recommendations: {
      response_tone: determineResponseTone(primaryEmotion, avgIntensity),
      gift_categories: recommendGiftCategories(primaryEmotion, analysisResults),
      interaction_approach: recommendInteractionApproach(primaryEmotion, avgIntensity),
    },
  }
}

async function enhanceWithUserHistory(
  signature: EmotionalSignature,
  userProfile: any,
  supabaseClient: any,
): Promise<EmotionalSignature> {
  // Get user's emotional history
  const { data: emotionalHistory } = await supabaseClient
    .from("emotional_signatures")
    .select("*")
    .eq("user_id", userProfile.id)
    .order("created_at", { ascending: false })
    .limit(10)

  if (emotionalHistory && emotionalHistory.length > 0) {
    // Analyze patterns and enhance current signature
    const historicalEmotions = emotionalHistory.map((h) => h.primary_emotion)
    const emotionalPattern = analyzeEmotionalPattern(historicalEmotions)

    signature.psychological_insights.personality_indicators.push(...emotionalPattern.traits)
    signature.recommendations.gift_categories = [
      ...new Set([...signature.recommendations.gift_categories, ...emotionalPattern.preferredCategories]),
    ]
  }

  return signature
}

async function storeEmotionalSignature(
  userId: string,
  signature: EmotionalSignature,
  request: EmotionalAnalysisRequest,
  supabaseClient: any,
) {
  await supabaseClient.from("emotional_signatures").insert({
    user_id: userId,
    primary_emotion: signature.primary_emotion,
    secondary_emotions: signature.secondary_emotions,
    intensity_score: signature.intensity_score,
    valence: signature.valence,
    arousal: signature.arousal,
    emotional_tags: signature.emotional_tags,
    confidence_score: signature.confidence_score,
    psychological_insights: signature.psychological_insights,
    recommendations: signature.recommendations,
    analysis_type: request.analysis_depth || "basic",
    context: request.context,
    created_at: new Date().toISOString(),
  })
}

async function updateUserEmotionalProfile(userId: string, signature: EmotionalSignature, supabaseClient: any) {
  // Update user's overall emotional profile
  const { data: currentProfile } = await supabaseClient
    .from("user_profiles")
    .select("emotional_profile")
    .eq("id", userId)
    .single()

  const updatedProfile = {
    ...currentProfile?.emotional_profile,
    last_primary_emotion: signature.primary_emotion,
    average_intensity: signature.intensity_score,
    dominant_valence: signature.valence,
    preferred_gift_categories: signature.recommendations.gift_categories,
    communication_style: signature.psychological_insights.communication_style,
    updated_at: new Date().toISOString(),
  }

  await supabaseClient
    .from("user_profiles")
    .update({
      emotional_profile: updatedProfile,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
}

async function awardXPForEmotionalAnalysis(userId: string, analysisDepth: string, supabaseClient: any) {
  const xpRewards = {
    basic: 3,
    detailed: 7,
    comprehensive: 12,
  }

  const xpAmount = xpRewards[analysisDepth as keyof typeof xpRewards] || 3

  await supabaseClient.from("xp_logs").insert({
    user_id: userId,
    xp_amount: xpAmount,
    reason: `Emotional analysis completed (${analysisDepth})`,
    feature_used: "emotion_signature_injector",
  })

  // Update user XP
  const { data: currentProfile } = await supabaseClient
    .from("user_profiles")
    .select("xp, level")
    .eq("id", userId)
    .single()

  if (currentProfile) {
    const newXP = currentProfile.xp + xpAmount
    const newLevel = Math.floor(newXP / 150) + 1

    await supabaseClient
      .from("user_profiles")
      .update({
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
  }
}

function calculateAnalysisCreditsRemaining(userProfile: any): number {
  const tierLimits = {
    Free: 3,
    Pro: 15,
    "Pro+": 50,
    Enterprise: -1, // Unlimited
  }

  const limit = tierLimits[userProfile.tier as keyof typeof tierLimits] || 3
  if (limit === -1) return -1

  // Mock usage calculation
  const usedToday = 1
  return Math.max(0, limit - usedToday)
}

// Helper functions
function determineValence(emotion: string): "positive" | "negative" | "neutral" {
  const positiveEmotions = ["joy", "trust", "anticipation", "surprise"]
  const negativeEmotions = ["sadness", "anger", "fear", "disgust"]

  if (positiveEmotions.includes(emotion)) return "positive"
  if (negativeEmotions.includes(emotion)) return "negative"
  return "neutral"
}

function determineArousal(intensity: number): "high" | "medium" | "low" {
  if (intensity >= 7) return "high"
  if (intensity >= 4) return "medium"
  return "low"
}

function generateEmotionalTags(analysisResults: any): string[] {
  const tags: string[] = []

  if (analysisResults.text?.emotional_tags) {
    tags.push(...analysisResults.text.emotional_tags)
  }

  if (analysisResults.voice?.voice_characteristics) {
    tags.push(`voice_${analysisResults.voice.voice_characteristics.tone}`)
  }

  return [...new Set(tags)]
}

function extractPersonalityIndicators(analysisResults: any): string[] {
  // Extract personality traits from analysis
  return ["empathetic", "thoughtful", "expressive"] // Mock data
}

function determineCommunicationStyle(analysisResults: any): string {
  // Determine communication style from analysis
  return "warm and direct" // Mock data
}

function identifyEmotionalNeeds(emotion: string, intensity: number): string[] {
  const needsMap: Record<string, string[]> = {
    joy: ["celebration", "sharing", "connection"],
    sadness: ["comfort", "understanding", "support"],
    anger: ["validation", "resolution", "calm"],
    fear: ["security", "reassurance", "stability"],
    surprise: ["clarity", "information", "processing time"],
    disgust: ["distance", "cleansing", "renewal"],
    trust: ["reliability", "consistency", "honesty"],
    anticipation: ["excitement", "preparation", "planning"],
  }

  return needsMap[emotion] || ["understanding", "support"]
}

function suggestGiftPreferences(emotion: string, analysisResults: any): string[] {
  const giftMap: Record<string, string[]> = {
    joy: ["celebratory items", "shared experiences", "memorable keepsakes"],
    sadness: ["comfort items", "self-care products", "thoughtful gestures"],
    anger: ["stress relief", "physical activities", "calming items"],
    fear: ["security items", "familiar comforts", "reassuring gifts"],
    surprise: ["unique items", "discovery experiences", "unexpected delights"],
    trust: ["reliable brands", "quality items", "meaningful symbols"],
    anticipation: ["future experiences", "planning tools", "exciting previews"],
  }

  return giftMap[emotion] || ["thoughtful items", "personal touches"]
}

function determineResponseTone(emotion: string, intensity: number): string {
  if (intensity >= 7) {
    return emotion === "joy" ? "enthusiastic and celebratory" : "gentle and supportive"
  }
  return "warm and understanding"
}

function recommendGiftCategories(emotion: string, analysisResults: any): string[] {
  // Based on emotional analysis, recommend gift categories
  return ["personalized", "experiential", "comfort"] // Mock data
}

function recommendInteractionApproach(emotion: string, intensity: number): string {
  return intensity >= 7 ? "high-energy and engaging" : "calm and supportive"
}

function analyzeEmotionalPattern(emotions: string[]): { traits: string[]; preferredCategories: string[] } {
  // Analyze historical emotional patterns
  return {
    traits: ["emotionally aware", "expressive"],
    preferredCategories: ["personalized", "meaningful"],
  }
}

function createFormData(audioData: string): FormData {
  const formData = new FormData()
  const audioBlob = new Blob([Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0))], { type: "audio/wav" })
  formData.append("file", audioBlob, "audio.wav")
  formData.append("model", "whisper-1")
  return formData
}
