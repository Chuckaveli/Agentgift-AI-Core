import { z } from "zod"
import { protectedProcedure, router } from "../context"
import { triggerMakeWebhook } from "@/lib/make"
import { ttsRequestSchema } from "@/lib/zodSchemas"

export const ttsRouter = router({
  request: protectedProcedure.input(ttsRequestSchema).mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    // Insert TTS request
    const { data, error } = await supabase
      .from("tts_requests")
      .insert({
        user_id: user.id,
        message_id: input.messageId,
        voice_id: input.voiceId ?? "default",
        status: "queued",
      })
      .select("id")
      .single()

    if (error) {
      throw error
    }

    // Create background job
    const jobPayload = {
      ttsRequestId: data.id,
      messageId: input.messageId,
      voiceId: input.voiceId ?? "default",
    }

    await supabase.from("jobs").insert({
      user_id: user.id,
      type: "tts",
      payload: jobPayload,
      status: "queued",
    })

    // Trigger Make webhook (non-blocking)
    triggerMakeWebhook("tts", jobPayload, user.id).catch(console.error)

    return { ok: true as const, ttsRequestId: data.id }
  }),

  getByMessage: protectedProcedure.input(z.object({ messageId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    const { data, error } = await supabase
      .from("tts_requests")
      .select("*")
      .eq("user_id", user.id)
      .eq("message_id", input.messageId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }),

  getById: protectedProcedure.input(z.object({ ttsRequestId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    const { data, error } = await supabase
      .from("tts_requests")
      .select("*")
      .eq("user_id", user.id)
      .eq("id", input.ttsRequestId)
      .single()

    if (error) {
      throw error
    }

    return data
  }),
})
