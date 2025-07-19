// lib/supabaseClient.ts
'use client';

import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { type Database } from '@/types/supabase'; // optional if you typed your DB

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
