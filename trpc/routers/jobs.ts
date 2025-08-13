import { z } from "zod"
import { protectedProcedure, router } from "../context"
import { listJobsSchema } from "@/lib/zodSchemas"

export const jobsRouter = router({
  list: protectedProcedure.input(listJobsSchema).query(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    let query = supabase.from("jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false })

    if (input?.status) {
      query = query.eq("status", input.status)
    }

    if (input?.limit) {
      query = query.limit(input.limit)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data || []
  }),

  getById: protectedProcedure.input(z.object({ jobId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .eq("id", input.jobId)
      .single()

    if (error) {
      throw error
    }

    return data
  }),

  retry: protectedProcedure.input(z.object({ jobId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    // Use the database function to increment retry count
    const { data, error } = await supabase.rpc("increment_retry_count", { job_id: input.jobId })

    if (error) {
      throw error
    }

    return { ok: true as const, retryCount: data }
  }),

  cancel: protectedProcedure.input(z.object({ jobId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx

    const { error } = await supabase
      .from("jobs")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("id", input.jobId)

    if (error) {
      throw error
    }

    return { ok: true as const }
  }),
})
