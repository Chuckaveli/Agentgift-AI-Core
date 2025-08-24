// hooks/use-user.ts
/**
 * How to use:
 *
 * 1) Replace the existing file with this one.
 * 2) Import anywhere with:
 *      import { useUser } from "@/hooks/use-user";
 *
 * Requirements:
 * - Browser client helper at: /lib/supabase/browser.ts  (export function createClient() { ... })
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/browser";

/** Raw row shape from public.user_profiles (keys are as in DB) */
type UserProfileRow = {
  user_id: string;
  email: string | null;
  name: string | null;
  tier: string | null;
  credits: number | null;
  xp: number | null;
  level: number | null;
  badges: string[] | null;
  prestige_level: string | null;
  last_activity: string | null;
  created_at: string;
  updated_at: string;
  role?: string | null;              // <- preferred single source of truth
  admin_role?: string | boolean | null; // <- legacy / compatibility
};

/** Normalized profile shape the app can rely on */
export type UserProfile = {
  id: string; // alias of user_id
  user_id: string;
  email: string;
  name: string;
  tier: string;
  credits: number;
  xp: number;
  level: number;
  badges: string[];
  prestige_level: string | null;
  last_activity: string | null;
  created_at: string;
  updated_at: string;
  role?: string | null;
  admin_role?: string | boolean | null;
};

/** Map DB row → normalized profile (ensures id & defaults) */
function normalizeProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.user_id,
    user_id: row.user_id,
    email: row.email ?? "",
    name: row.name ?? "",
    tier: row.tier ?? "free_agent",
    credits: row.credits ?? 0,
    xp: row.xp ?? 0,
    level: row.level ?? 1,
    badges: row.badges ?? [],
    prestige_level: row.prestige_level ?? null,
    last_activity: row.last_activity ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    role: row.role ?? null,
    admin_role: row.admin_role ?? null,
  };
}

export function useUser() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const u = data.user ?? null;
        if (!mounted) return;
        setUser(u);

        if (u) {
          // Table PK is user_id (not id)
          const { data: row, error: profileError } = await supabase
            .from("user_profiles")
            .select(
              "user_id,email,name,tier,credits,xp,level,badges,prestige_level,last_activity,created_at,updated_at,role,admin_role"
            )
            .eq("user_id", u.id)
            .single();

          if (profileError && profileError.code !== "PGRST116") {
            throw profileError;
          }

          if (!mounted) return;
          setProfile(row ? normalizeProfile(row as UserProfileRow) : null);
        } else {
          setProfile(null);
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? "Failed to load user");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    hydrate();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        const { data: row } = await supabase
          .from("user_profiles")
          .select(
            "user_id,email,name,tier,credits,xp,level,badges,prestige_level,last_activity,created_at,updated_at,role,admin_role"
          )
          .eq("user_id", u.id)
          .single();

        setProfile(row ? normalizeProfile(row as UserProfileRow) : null);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // Admin detection: prefer `role`, fall back to `admin_role`
  const roleLower =
    (profile?.role ??
      (typeof profile?.admin_role === "string" ? profile?.admin_role : "")).toString().toLowerCase();

  const isAdmin = roleLower === "admin" || roleLower === "founder";

  return { user, profile, loading, error, isAdmin };
}
