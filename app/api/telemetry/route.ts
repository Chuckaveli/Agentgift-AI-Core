import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { event, payload } = await req.json();
  console.log("[telemetry]", event, payload);
  return NextResponse.json({ ok: true });
}
