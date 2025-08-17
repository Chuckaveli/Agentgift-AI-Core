import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import OpenAI from "openai";

export async function POST(req: Request) {
  const body = await req.json();
  const { calendar_id } = body;

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (k: string) => cookieStore.get(k)?.value } }
  );

  // 1) Load CSA prompt + inputs
  const { data: prompt } = await supabase
    .from("assistant_prompts")
    .select("base_system_prompt")
    .eq("name", "AgentGift CSA")
    .single();

  const { data: cal } = await supabase
    .from("content_calendar")
    .select("*")
    .eq("id", calendar_id)
    .single();

  const { data: internals } = await supabase
    .from("your_internal_insights_view") // or table
    .select("*")
    .limit(5);

  const { data: competitors } = await supabase
    .from("scraped_items")
    .select("title,url,summary,published_at,tags")
    .order("published_at", { ascending: false })
    .limit(5);

  // 2) Call OpenAI
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // pick your deployed model
    temperature: 0.8,
    messages: [
      { role: "system", content: prompt?.base_system_prompt ?? "" },
      {
        role: "user",
        content: JSON.stringify({
          calendar_entry: cal,
          internal_insights: internals ?? [],
          competitor_trends: competitors ?? [],
          platforms: ["blog","x","linkedin","instagram","tiktok","discord"],
        }),
      },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  const content_package = JSON.parse(text);

  // 3) Write to queue
  const { data: queued, error } = await supabase
    .from("content_queue")
    .insert({
      calendar_id,
      inputs: { calendar: cal, internal: internals, competitor: competitors },
      assistant_output: content_package,
      status: "generated",
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, queued });
}
