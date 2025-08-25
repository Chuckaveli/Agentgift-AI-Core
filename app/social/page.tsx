"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/auth-helpers-nextjs"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

import { Users, Send, Shield, Loader2, MessageCircle, Heart, Plus } from "lucide-react"

type CommunityPost = {
  id: string
  user_id: string
  content: string
  created_at: string
  is_hidden: boolean
  author_name: string | null
  author_avatar: string | null
  likes?: number | null
  replies?: number | null
}

export default function SocialPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [posting, setPosting] = useState<boolean>(false)
  const [feed, setFeed] = useState<CommunityPost[]>([])
  const [newPost, setNewPost] = useState<string>("")

  // --- bootstrap session + admin flag
  useEffect(() => {
    const init = async () => {
      const { data: sess } = await supabase.auth.getSession()
      const authedUser = sess.session?.user ?? null
      setUser(authedUser)

      // Ask Postgres if this user is an admin (uses your SQL is_admin(uid) function)
      if (authedUser) {
        const { data: adminFlag } = await supabase.rpc("is_admin", { uid: authedUser.id })
        setIsAdmin(!!adminFlag)
      }

      setLoading(false)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [supabase])

  // --- fetch visible community posts (user-facing only)
  const fetchFeed = async () => {
    // RLS already hides hidden posts; we also filter explicitly for clarity
    const { data, error } = await supabase
      .from("community_posts")
      .select(
        `
        id,
        user_id,
        content,
        created_at,
        is_hidden,
        likes,
        replies,
        author:user_profiles!community_posts_user_id_fkey (
          display_name,
          avatar_url
        )
      `
      )
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(25)

    if (error) {
      console.error(error)
      toast?.({
        title: "Couldn’t load community feed",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    const normalized: CommunityPost[] =
      (data as any[])?.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        content: row.content,
        created_at: row.created_at,
        is_hidden: row.is_hidden,
        likes: row.likes ?? 0,
        replies: row.replies ?? 0,
        author_name: row.author?.display_name ?? null,
        author_avatar: row.author?.avatar_url ?? null,
      })) ?? []

    setFeed(normalized)
  }

  useEffect(() => {
    fetchFeed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initials = useMemo(() => {
    const name = user?.user_metadata?.full_name as string | undefined
    const email = user?.email ?? "U"
    return (name?.[0] || email?.[0] || "U").toUpperCase()
  }, [user])

  const handleCreatePost = async () => {
    if (!newPost.trim()) return
    setPosting(true)
    const { error } = await supabase.from("community_posts").insert({
      user_id: user?.id,
      content: newPost.trim(),
      is_hidden: false, // user-side posts are public by default
    })
    setPosting(false)

    if (error) {
      toast?.({
        title: "Couldn’t post",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setNewPost("")
    fetchFeed()
    toast?.({ title: "Posted!", description: "Your message is now visible to the community." })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!user) {
    // Middleware should already protect /social, but keep a friendly fallback.
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Join the Community</CardTitle>
            <CardDescription>Sign in to view and post in AgentGift.ai Community.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/signin">
              <Button className="agentgift-gradient text-white">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          </div>

          {/* Admin hint ONLY shows to admins; links to internal ops page */}
          {isAdmin && (
            <Link href="/admin/community">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                <Shield className="w-3 h-3 mr-1" />
                Ops
              </Badge>
            </Link>
          )}
        </div>

        {/* Composer */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Share something thoughtful</CardTitle>
            <CardDescription>Ask for ideas, share a win, or crowdsource a tricky gift.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={(user.user_metadata as any)?.avatar_url || ""} alt="You" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="What are you thinking about gifting?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[90px] resize-y"
                />
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Be kind. No promotions. Keep it gift-centric.
                  </div>
                  <Button onClick={handleCreatePost} disabled={posting || !newPost.trim()}>
                    {posting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-4">
          {feed.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-600">
                No posts yet. Be the first to share! <Plus className="inline w-4 h-4 ml-1" />
              </CardContent>
            </Card>
          ) : (
            feed.map((p) => (
              <Card key={p.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={p.author_avatar || ""} alt={p.author_name || "User"} />
                      <AvatarFallback>
                        {(p.author_name?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {p.author_name || "Community Member"}
                        </span>
                        <span className="text-xs text-gray-500">• {new Date(p.created_at).toLocaleString()}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-gray-900">{p.content}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {p.likes ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {p.replies ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
