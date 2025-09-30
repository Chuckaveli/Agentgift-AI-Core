// scripts/verify-vercel-env.ts
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

console.log("🔍 Verifying environment variables...\n");

let allGood = true;

for (const key of requiredVars) {
  if (!process.env[key]) {
    console.error(`❌ Missing: ${key}`);
    allGood = false;
  } else {
    console.log(`✅ ${key} is set`);
  }
}

if (!allGood) {
  console.error("\n⚠️ One or more environment variables are missing!");
  process.exit(1);
} else {
  console.log("\n🎉 All required environment variables are set!");
}
