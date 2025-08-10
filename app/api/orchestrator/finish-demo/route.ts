// app/api/orchestrator/demo-complete/route.ts (Next.js on Vercel)
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const secret = process.env.ORCHESTRATOR_SIGNING_SECRET!
    const supaFnUrl = process.env.SUPABASE_FUNCTION_DEMO_INGEST_URL! 
    // e.g. https://<project-ref>.functions.supabase.co/demo_bridge_ingest

    const payload = await req.json()
    const ts = Math.floor(Date.now() / 1000).toString()
    const body = JSON.stringify(payload)
    const sig = crypto
      .createHmac('sha256', secret)
      .update(`${ts}.${body}`)
      .digest('hex')

    const res = await fetch(supaFnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-orchestrator-timestamp': ts,
        'x-orchestrator-signature': sig
      },
      body
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('[DEMO INGEST FAIL]', data)
      return new Response(JSON.stringify({ ok: false, error: data.error }), { status: 500 })
    }

    return new Response(JSON.stringify({ ok: true, demo_session_id: data.demo_session_id }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500 })
  }
}
