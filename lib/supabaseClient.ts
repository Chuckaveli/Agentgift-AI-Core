'use client'

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase' // your typed DB schema

export const createClient = () =>
  createBrowserSupabaseClient<Database>()
