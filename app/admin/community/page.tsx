"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/auth-helpers-nextjs"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

import { Shield, Eye, EyeOff, RefreshCw, Loader2, ArrowLeft, Search } from "lucide-react"

type Post = {
  id: string
  user_id: string
  content: string
  created_at: string
  is_hidden: boolean
}

type Profile = {
  user_id: string
  display_name: string | null
  avatar_url: string | null
}

export default function AdminCommunityPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const [posts, setPosts] = useState<Post[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [query, setQuery] = useState<string>("")
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all")

  // bootstrap session + admin flag
  useEffect(() => {
    const init = async () => {
      const { data: sess } = await supabase.auth.getSession()
      const u = sess.session?.user ?? null
      setUser(u)

      if (!u) {
        router.replace("/auth/signin")
        return
      }

      const { data: adminFlag, error } = await supabase.rpc("is_admin", { uid: u.id })
      if (error) console.error(error)
      setIsAdmin(!!adminFlag)

      setLoading(false)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [supabase, router])

  const fetchData = async () => {
    setRefreshing(true)
    // all posts; RLS admin policy permits this server-side
    const { data: postData, error: postErr } = await supabase
      .from("community_posts")
      .select("id,user_id,content,created_at,is_hidden")
      .order("created_at", { ascending: false })
      .limit(200)

    if (postErr) {
      console.error(postErr)
      toast?.({ title: "Couldn’t load posts", description: postErr.message, variant: "destructive" })
      setRefreshing(false)
      return
    }

    setPosts(postData ?? [])

    // fetch author profiles (no FK assumptions)
    const ids = Array.from(new Set((postData ?? []).map((p) => p.user_id)))
    if (ids.length) {
      const { data: profs, error: profErr } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", ids)

      if (profErr) {
        console.error(profErr)
      } else {
        const map: Record<string, Profile> = {}
        for (const p of profs ?? []) map[p.user_id] = p as Profile
        setProfiles(map)
      }
    } else {
      setProfiles({})
    }

    setRefreshing(false)
  }

  useEffect(() => {
    if (isAdmin) fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const toggleHidden = async (postId: string, nextHidden: boolean) => {
    const { error } = await supabase.from("community_posts").update({ is_hidden: nextHidden }).eq("id", postId)
    if (error) {
      toast?.({ title: "Update failed", description: error.message, variant: "destructive" })
      return
    }
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, is_hidden: nextHidden } : p)))
    toast?.({
      title: nextHidden ? "Post hidden" : "Post unhidden",
      description: nextHidden ? "Now invisible to regular users." : "Now visible to the community.",
    })
  }

  const filtered = useMemo(() => {
    const base =
      filter === "all"
        ? posts
        : filter === "visible"
        ? posts.filter((p) => !p.is_hidden)
        : posts.filter((p) => p.is_hidden)

    const q = query.trim().toLowerCase()
    if (!q) return base

    return base.filter((p) => {
      const author = profiles[p.user_id]
      const name = author?.display_name ?? ""
      return (
        p.content.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        p.user_id.toLowerCase().includes(q)
      )
    })
  }, [posts, profiles, query, filter])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!isAdmin) {
    // layout should already guard, but keep a client fallback
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Not authorized</CardTitle>
            <CardDescription>This page is for admins only.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Community Ops</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/social">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                User View
              </Button>
            </Link>
            <Button onClick={fetchData} disabled={refreshing}>
              {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Moderation Controls</CardTitle>
            <CardDescription>Search, filter, and toggle visibility.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search content, author, or user_id…"
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "visible" ? "default" : "outline"}
                onClick={() => setFilter("visible")}
              >
                Visible
              </Button>
              <Button
                variant={filter === "hidden" ? "default" : "outline"}
                onClick={() => setFilter("hidden")}
              >
                Hidden
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-600">No posts match your filters.</CardContent>
            </Card>
          ) : (
            filtered.map((p) => {
              const prof = profiles[p.user_id]
              const initials =
                (prof?.display_name?.[0] || user?.email?.[0] || "U").toUpperCase()
              return (
                <Card key={p.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={prof?.avatar_url || ""} alt={prof?.display_name || "User"} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{prof?.display_name || "Member"}</span>
                          <span className="text-xs text-gray-500">
                            • {new Date(p.created_at).toLocaleString()}
                          </span>
                          {p.is_hidden ? (
                            <Badge variant="destructive" className="ml-2">Hidden</Badge>
                          ) : (
                            <Badge className="ml-2 bg-green-100 text-green-700">Visible</Badge>
                          )}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-gray-900">{p.content}</p>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-xs text-gray-500 truncate">user_id: {p.user_id}</div>
                          <div className="flex items-center gap-2">
                            {p.is_hidden ? (
                              <Button size="sm" variant="outline" onClick={() => toggleHidden(p.id, false)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Unhide
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => toggleHidden(p.id, true)}>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Hide
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
