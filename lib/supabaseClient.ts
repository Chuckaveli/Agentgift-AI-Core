'use client'

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase' // your DB type from Supabase gen

export const createClient = () =>
  createBrowserSupabaseClient<Database>()
