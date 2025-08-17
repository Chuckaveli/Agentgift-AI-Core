// 📦 gift-intel-ai-functions
// Author: AgentGift.ai
// Edge Function Stubs for AI Blog Automation (Supabase + OpenAI)

/**
 * EDGE FUNCTION 1: crawl_trends
 * Purpose: Scrape or fetch trending content and push raw ideas to `post_queue`
 */
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { data: sources } = await supabase.from("trend_sources").select("*")

  for (const source of sources ?? []) {
    // TODO: Replace with real RSS or HTML crawl logic
    const fakeTrend = {
      title: `Trending Gift: Cozy Blankets` + Math.random(),
      description: "Warm, soft, emotional. People are craving comfort gifts again.",
      source_url: source.source_url,
    }

    await supabase.from("post_queue").insert({
      ...fakeTrend,
      status: "new"
    })
  }

  return new Response("Trends crawled and pushed to post_queue", { status: 200 })
})

/**
 * EDGE FUNCTION 2: generate_post
 * Purpose: Turn raw ideas into full content using OpenAI
 */
serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { data: drafts } = await supabase
    .from("post_queue")
    .select("*")
    .eq("status", "new")
    .limit(3)

  const choosePersona = ({ series_suggestion, tags = [], title = "" }) => {
    if (series_suggestion?.includes("If You Love Her")) return "Gifty"
    if (series_suggestion?.includes("Gift Gut Check")) return "Agent Q"
    if (series_suggestion?.includes("Gift Signal") || tags.includes("trend")) return "Oracle of Intel"
    if (tags.includes("emotional") || tags.includes("relationships")) return "Gifty"
    if (tags.includes("data") || title.includes("mistakes")) return "Agent Q"
    if (tags.includes("zodiac") || tags.includes("future") || title.includes("trend")) return "Oracle of Intel"
    return "Gifty"
  }

  const getPrompt = (persona, topic, description) => {
    switch (persona) {
      case "Gifty":
        return `Write a 500–700 word blog post in the voice of Gifty, an emotionally intelligent gifting expert. She’s warm, intuitive, witty, and slightly cheeky. The tone should feel like a best friend who *sees you*. Use emotionally descriptive language, cultural awareness, and supportive vibes.\n\nTopic: ${topic}\nTarget reader: Someone who wants to give meaningful gifts but often overthinks or forgets.\nGoal: Inspire the reader to use AgentGift.ai to give more intentionally.\nCall to action: Invite them to “let AgentGift remember for you” or “build your gift DNA profile.”`;
      case "Agent Q":
        return `Write a 600–800 word blog post in the voice of Agent Q, an emotionally aware gifting strategist. Use a clever, matter-of-fact tone with occasional dry humor. The tone is confident, trustworthy, and lightly sarcastic—like a cool older sister with a plan.\n\nTopic: ${topic}\nInclude logic behind gifting decisions, common mistakes, and data-driven insights. Break down why certain gifts work.\nEnd with a strong call to action: “Run a Gift Gut Check™” or “Let AgentGift do the emotional lifting.”`;
      case "Oracle of Intel":
        return `Write a 400–600 word blog post in the voice of the Oracle of Intel, a mystical, emotionally connected trend prophet. Her tone is enchanting, poetic, and a little dramatic—but never vague. She weaves together emotional trends, cultural insight, and gifting signals.\n\nTopic: ${topic}\nInclude phrases like “the signal is rising” or “the energy is shifting.”\nEnd with a prophetic call: “Trust the signal. Gift differently.”`;
      default:
        return `Write a 500-word blog post on the topic: ${topic}. Be friendly and informative.`
    }
  }

  const generateImage = async (topic) => {
    const dallePrompt = `Create a blog header image inspired by this gifting topic: ${topic}. Style: soft lighting, cozy, emotionally resonant, clean background.`

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        prompt: dallePrompt,
        n: 1,
        size: "1024x512"
      }),
    })

    const data = await response.json()
    return data?.data?.[0]?.url || null
  }

  for (const draft of drafts ?? []) {
    const persona = draft.persona_suggestion || choosePersona({
      series_suggestion: draft.series_suggestion,
      tags: draft.tags,
      title: draft.title
    })

    const prompt = getPrompt(persona, draft.title, draft.description)

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      }),
    })

    const result = await aiRes.json()
    const content = result.choices?.[0]?.message?.content || "[ERROR: No content]"

    const image_url = await generateImage(draft.title)

    await supabase.from("post_queue").update({
      raw_content: content,
      status: "drafted",
      persona_suggestion: persona,
      image_url
    }).eq("id", draft.id)
  }

  return new Response("Generated post drafts from OpenAI with images", { status: 200 })
})

/**
 * EDGE FUNCTION 3: approve_post
 * Purpose: Publish approved AI-generated content to `blog_posts`
 */
serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { id } = await req.json()

  const { data: post } = await supabase.from("post_queue").select("*").eq("id", id).single()

  if (!post || post.status !== "drafted") {
    return new Response("Post not found or not ready", { status: 400 })
  }

  await supabase.from("blog_posts").insert({
    title: post.title,
    slug: post.title.toLowerCase().replaceAll(" ", "-").replace(/[^a-z0-9-]/g, ""),
    content: post.raw_content,
    excerpt: post.description,
    persona: post.persona_suggestion,
    series: post.series_suggestion,
    tags: [],
    category: null,
    image_url: post.image_url,
    published_at: new Date().toISOString(),
    status: "published"
  })

  await supabase.from("post_queue").update({ status: "approved" }).eq("id", id)

  return new Response("Post published successfully", { status: 200 })
})
