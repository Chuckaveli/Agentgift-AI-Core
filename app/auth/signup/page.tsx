"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// browser client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// tiny telemetry helper
async function capture(event: string, payload?: Record<string, any>) {
  try {
    await fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload }),
    });
  } catch {}
}

export default function SignupModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function mask(e: string) {
    const [n, d] = e.split("@"); if (!d) return "redacted"; return `${n.slice(0,2)}***@${d}`;
  }

  async function handleSignup(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true); setMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // If you use magic link confirmation:
        // emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      });

      if (error) {
        if (error.message.toLowerCase().includes("exists")) {
          const r = await supabase.auth.signInWithPassword({ email, password });
          if (r.error) throw r.error;
          setMsg("Welcome back! Redirecting…");
        } else {
          throw error;
        }
      } else {
        setMsg(data.session ? "Signed in! Loading your picks…" : "Check your email to confirm ✨");
      }

      // TODO: router.push("/dashboard");
    } catch (err: any) {
      setMsg(err?.message ?? "Something went wrong. Try again.");
      capture("signup_error", { message: String(err), emailMasked: mask(email) });
      console.error("signup error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSignup} className="space-y-3">
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="Email Address" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} placeholder="Create Password" />
      <button type="submit" disabled={loading} aria-busy={loading} data-testid="signup-btn">
        {loading ? "One sec…" : "Get My Gift Recommendations"}
      </button>
      {msg && <p role="status">{msg}</p>}
    </form>
  );
}
