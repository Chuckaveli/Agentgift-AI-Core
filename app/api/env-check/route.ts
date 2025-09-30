// app/api/env-check/route.ts
import { NextResponse } from "next/server";

const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ENCRYPTION_KEY",
  "CSRF_SECRET",
  "JWT_SECRET",
  "OPENAI_API_KEY",
  "ELEVENLABS_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

export async function GET() {
  const results: Record<string, string> = {};

  requiredVars.forEach((key) => {
    results[key] = process.env[key] ? "✅ Loaded" : "❌ Missing";
  });

  return NextResponse.json({
    status: "Env check completed",
    results,
  });
}
