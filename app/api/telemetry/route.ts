// app/api/telemetry/route.ts
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const body = await req.json();
  console.log("[telemetry]", body.event, body.payload);
  return NextResponse.json({ ok: true });
}
