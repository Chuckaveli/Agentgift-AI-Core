"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// DB row type straight from your generated types
type ProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];
type NormalizedProfile = ProfileRow & { id: string };

// Keep one shape everywhere: expose .id mirroring user_id
const normalizeProfile = (p: ProfileRow): NormalizedProfile => ({ ...p, id: p.user_id });

export function useUser() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<NormalizedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!active) return;

        setUser(user ?? null);

        if (user) {
          const { data, error: profErr } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)       // <-- correct column
            .maybeSingle();               // don't throw if missing

          if (profErr && profErr.code !== "PGRST116") throw profErr;
          if (!active) return;

          setProfile(data ? normalizeProfile(data) : null);
        } else {
          setProfile(null);
        }
      } catch (e: any) {
        if (!active) return;
        setError(e?.message ?? "Failed to load user");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    const { data: auth } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      if (!active) return;
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", session.user.id) // <-- correct column
          .maybeSingle();

        if (!active) return;
        setProfile(data ? normalizeProfile(data) : null);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      active = false;
      auth.subscription.unsubscribe();
    };
  }, [supabase]);

  // Derive admin from tier; also honor optional string admin_role if you add it later
  const isAdmin =
    !!profile &&
    (
      /admin/i.test(profile.tier ?? "") ||
      (typeof (profile as any).admin_role === "string" && (profile as any).admin_role === "founder")
    );

  return { user, profile, loading, error, isAdmin };
}
