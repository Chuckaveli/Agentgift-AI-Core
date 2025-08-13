import { z } from "zod"
import { protectedProcedure, router } from "../context"
import { getIdempotencyKey } from "@/lib/idempotency"
import { triggerMakeWebhook } from "@/lib/make"
import { createMessageSchema } from "@/lib/zodSchemas"

export const messagesRouter = router({
  create: protectedProcedure.input(createMessageSchema).mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx
    const requestId = getIdempotencyKey((globalThis as any).__NEXT_PRIVATE_REQ__ as Request, input.requestId)

    // Check for existing message with same request ID
    const { data: existing } = await supabase
      .from("messages")
      .select("id")
      .eq("user_id", user.id)
      .eq("request_id", requestId)
      .maybeSingle()

    if (existing) {
      return { ok: true as const, messageId: existing.id }
    }

    // Insert new message
    const { data: inserted, error: insertError } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        role: "user",
        content: input.content,
        thread_id: input.threadId,
        request_id: requestId,
        status: "queued",
      })
      .select("id")
      .single()

    if (insertError) {
      throw insertError
    }

    // Create background job
    const jobPayload = {
      threadId: input.threadId,
      messageId: inserted.id,
      requestId,
      tts: input.tts ?? null,
    }

    await supabase.from("jobs").insert({
      user_id: user.id,
      type: "make_scenario",
      payload: jobPayload,
      status: "queued",
    })

    // Trigger Make webhook (non-blocking)
    triggerMakeWebhook("message", jobPayload, user.id).catch(console.error)

    return { ok: true as const, messageId: inserted.id }
  }),

  listByThread: protectedProcedure.input(z.object({ threadId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user.id)
      .eq("thread_id", input.threadId)
      .order("created_at", { ascending: true })

    if (error) {
      throw error
    }

    return data || []
  }),

  getById: protectedProcedure.input(z.object({ messageId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user.id)
      .eq("id", input.messageId)
      .single()

    if (error) {
      throw error
    }

    return data
  }),
})
