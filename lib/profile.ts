// lib/profile.ts
import type { Database } from "@/types/supabase";
type Profile = Database["public"]["Tables"]["user_profiles"]["Row"];
export const normalizeProfile = (p: Profile) => ({ ...p, id: p.user_id });
