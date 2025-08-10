diff --git a//dev/null b/app/api/discord-webhook/route.ts
index 0000000000000000000000000000000000000000..5fbbd9b7e2b1288a261ef504a6bc69406d9a05c7 100644
--- a//dev/null
+++ b/app/api/discord-webhook/route.ts
@@ -0,0 +1,34 @@
+import { type NextRequest, NextResponse } from "next/server"
+
+export async function POST(request: NextRequest) {
+  try {
+    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
+    if (!webhookUrl) {
+      return NextResponse.json(
+        { error: "Missing DISCORD_WEBHOOK_URL environment variable" },
+        { status: 500 },
+      )
+    }
+
+    const payload = await request.json()
+
+    const discordRes = await fetch(webhookUrl, {
+      method: "POST",
+      headers: { "Content-Type": "application/json" },
+      body: JSON.stringify(payload),
+    })
+
+    if (!discordRes.ok) {
+      const errText = await discordRes.text()
+      return NextResponse.json({ error: errText }, { status: discordRes.status })
+    }
+
+    return NextResponse.json({ success: true })
+  } catch (error: any) {
+    return NextResponse.json({ error: error.message }, { status: 500 })
+  }
+}
+
+export async function GET() {
+  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 })
+}
