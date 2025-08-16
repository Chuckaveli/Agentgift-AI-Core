import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST() {
  const id = crypto.randomUUID()
  return NextResponse.json({ sessionId: id })
}
