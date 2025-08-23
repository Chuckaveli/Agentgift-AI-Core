import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export interface AuthenticatedUser {
  id: string;                    // auth.users.id
  email: string;
  tier: string;
  credits: number;
  xp: number;
  level: number;
  badges: string[];
  prestige_level: string | null;
}

export interface AuthContext {
  user: AuthenticatedUser | null;
  hasAccess: (requiredTier: string, creditsNeeded?: number) => boolean;
  deductCredits: (amount: number, reason: string) => Promise<boolean>;
}

export function withAuth<T extends any[]>(
  handler: (req: NextRequest, context: AuthContext, ...args: T) => Promise<Response>,
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return NextResponse.json({ error: "Auth not configured", redirect: "/login" }, { status: 503 });
      }

      const cookieStore = cookies();
      const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (setCookies) => {
              setCookies.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            },
          },
        },
      );

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        return NextResponse.json({ error: "Authentication required", redirect: "/login" }, { status: 401 });
      }

      // NOTE: user_profiles now uses `user_id`
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", session.user.id)       // <— changed
        .single();

      if (profileError || !profile) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 });
      }

      const user: AuthenticatedUser = {
        id: session.user.id,                  // keep auth id here
        email: session.user.email || "",
        tier: profile.tier || "free_agent",
        credits: profile.credits || 0,
        xp: profile.xp || 0,
        level: profile.level || 1,
        badges: profile.badges || [],
        prestige_level: profile.prestige_level,
      };

      const tierLevels = {
        free_agent: 0,
        premium_spy: 1,
        pro_agent: 2,
        agent_00g: 3,
        small_biz: 4,
        enterprise: 5,
      } as const;

      const hasAccess = (requiredTier: string, creditsNeeded = 0): boolean => {
        const userTierLevel = tierLevels[user.tier as keyof typeof tierLevels] ?? 0;
        const requiredTierLevel = tierLevels[requiredTier as keyof typeof tierLevels] ?? 0;
        return userTierLevel >= requiredTierLevel && user.credits >= creditsNeeded;
      };

      const deductCredits = async (amount: number, reason: string): Promise<boolean> => {
        if (user.credits < amount) return false;

        // Update credits in profile
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({ credits: user.credits - amount, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);           // <— changed

        if (updateError) return false;

        // Log transaction (your table already uses user_id)
        await supabase.from("credit_transactions").insert({
          user_id: user.id,
          amount: -amount,
          reason,
          balance_after: user.credits - amount,
          created_at: new Date().toISOString(),
        });

        const xpGained = Math.floor(amount / 2);
        if (xpGained > 0) {
          const newXP = user.xp + xpGained;
          const newLevel = Math.floor(newXP / 150) + 1;

          await supabase
            .from("user_profiles")
            .update({ xp: newXP, level: newLevel })
            .eq("user_id", user.id);        // <— changed

          await supabase.from("xp_logs").insert({
            user_id: user.id,
            xp_amount: xpGained,
            reason: `Credits spent: ${reason}`,
            created_at: new Date().toISOString(),
          });

          user.xp = newXP;
          user.level = newLevel;
        }

        user.credits -= amount;
        return true;
      };

      const context: AuthContext = { user, hasAccess, deductCredits };
      return handler(req, context, ...args);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

// Page-level helper
export async function requireAuth(): Promise<AuthenticatedUser | null> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;

    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (setCookies) => setCookies.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      },
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", session.user.id)         // <— changed
      .single();

    if (!profile) return null;

    return {
      id: session.user.id,                    // keep auth id here
      email: session.user.email || "",
      tier: profile.tier || "free_agent",
      credits: profile.credits || 0,
      xp: profile.xp || 0,
      level: profile.level || 1,
      badges: profile.badges || [],
      prestige_level: profile.prestige_level,
    };
  } catch (e) {
    console.error("requireAuth error:", e);
    return null;
  }
}
