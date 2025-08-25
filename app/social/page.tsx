"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, MessageCircle, PlusCircle, Sparkles } from "lucide-react"
import { useIsAdmin } from "@/hooks/useIsAdmin"

type CommunityPost = {
  id: string
  user_id: string
  title: string | null
  body: string | null
  created_at: string
  author_name: string | null
}

export default function CommunityPage() {
  const supabase = createClientComponentClient()
  const { isAdmin } = useIsAdmin()

  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<CommunityPost[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user ?? null)

      // RLS will only return visible posts (your policies already enforce this)
      const { data } = await supabase
        .from("community_posts")
        .select("id,user_id,title,body,created_at,author_name")
        .order("created_at", { ascending: false })
        .limit(20)

      setPosts(data ?? [])
      setLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse h-8 w-40 bg-gray-200 rounded mb-6" />
        <div className="grid gap-4">
          <div className="h-28 bg-gray-100 rounded" />
          <div className="h-28 bg-gray-100 rounded" />
          <div className="h-28 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Join the Community</CardTitle>
            <CardDescription>Sign in to view and share posts.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-2">
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
            <Link href="/auth?view=sign_up">
              <Button variant="outline">Create Account</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-purple-600" />
              Community
            </h1>
            <p className="text-gray-600 mt-1">
              Share wins, ask for help, and learn from other thoughtful gift-givers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline">Admin Console</Button>
              </Link>
            )}
            <Link href="/social/new">
              <Button className="agentgift-gradient text-white">
                <PlusCircle className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </Link>
          </div>
        </div>

        {/* No internal widgets here — safe for users */}
        {(!posts || posts.length === 0) ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">No posts yet. Be the first to start a discussion!</p>
              <Link href="/social/new">
                <Button className="mt-4 agentgift-gradient text-white">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Start a conversation
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {posts.map((p) => (
              <Card key={p.id} className="hover:shadow-sm transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{p.title || "Untitled"}</CardTitle>
                  <CardDescription>
                    by {p.author_name || "Someone"} • {new Date(p.created_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {p.body || "No content"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Helpful tips (safe, non-internal) */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" /> Posting Tips
              </CardTitle>
              <CardDescription>Get better feedback and ideas from the crowd.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>• Include the occasion, budget range, and recipient’s vibe.</p>
              <p>• Share what they already own or love to avoid duplicates.</p>
              <p>• Mark updates when you find “the one” so others can learn.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
