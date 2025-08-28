"use client";

import AdminOnly from "@/components/access/AdminOnly";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Gift,
  Sparkles,
  Heart,
  Star,
  Trophy,
  Zap,
  Users,
  Calendar,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/auth-helpers-nextjs";

type Tier = string | string[] | null;

interface UserProfile {
  user_id: string;
  email: string | null;
  display_name: string | null;
  onboarding_completed: boolean;
  current_xp?: number;
  lifetime_xp?: number;
  xp?: number; // legacy fallback
  tier: Tier;
}

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // Match schema: primary key is user_id
        const { data: profileData, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData as unknown as UserProfile);
        } else if (error) {
          console.error("Error fetching profile:", error);
          try {
            await fetch("/api/orchestrator/onboard", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });
            window.location.reload();
          } catch (onboardError) {
            console.error("Onboarding error:", onboardError);
          }
        }
      }

      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const quickActions = [
    {
      title: "Smart Search",
      description: "Find gifts with AI-powered search",
      icon: Zap,
      href: "/smart-search",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "AI Concierge",
      description: "Chat with our gift expert AI",
      icon: Heart,
      href: "/concierge",
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Gift Occasions",
      description: "Browse by upcoming events",
      icon: Calendar,
      href: "/occasions",
      color: "from-purple-500 to-indigo-500",
    },
    {
      title: "Community",
      description: "Connect with other gift-givers",
      icon: Users,
      href: "/social",
      color: "from-green-500 to-emerald-500",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Please Sign In</CardTitle>
            <CardDescription>
              You need to be signed in to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Safe derived values ----
  const xp =
    typeof profile?.current_xp === "number"
      ? profile.current_xp
      : typeof profile?.xp === "number"
      ? profile.xp
      : 0;

  const normalizeTier = (t: Tier): string[] => {
    if (Array.isArray(t))
      return t.filter(
        (s): s is string => typeof s === "string" && s.trim().length > 0
      );
    if (typeof t === "string") {
      const s = t.trim();
      if (!s) return [];
      // If JSON-encoded array in DB
      if (s.startsWith("[") && s.endsWith("]")) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) {
            return parsed.filter(
              (v): v is string =>
                typeof v === "string" && v.trim().length > 0
            );
          }
        } catch {
          // fall through
        }
      }
      // If comma-separated or single label
      if (s.includes(","))
        return s.split(",").map((p) => p.trim()).filter(Boolean);
      return [s];
    }
    return [];
  };

  const tierLabelArr = normalizeTier(profile?.tier ?? null);
  const tierLabel = tierLabelArr.length ? tierLabelArr.join(", ") : "Free";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile?.display_name || user.email?.split("@")[0]}
                ! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Ready to find the perfect gifts?
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Trophy className="w-3 h-3 mr-1" />
                {xp} XP
              </Badge>
              <Badge variant="outline">{tierLabel} Tier</Badge>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* ======================= ADMIN-ONLY WIDGETS ======================= */}
        <AdminOnly>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card>
              <CardHeader>
                <CardTitle>Content Calendar</CardTitle>
                <CardDescription>Admin-only planning view</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  [Admin widget placeholder]
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Preview</CardTitle>
                <CardDescription>Admin-only metrics preview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  [Admin widget placeholder]
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
                <CardDescription>Internal summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  [Admin widget placeholder]
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Posts</CardTitle>
                <CardDescription>Internal scheduler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  [Admin widget placeholder]
                </div>
              </CardContent>
            </Card>
          </div>
        </AdminOnly>
        {/* ===================== END ADMIN-ONLY WIDGETS ===================== */}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest gift-finding activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Gift className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Welcome to AgentGift.ai!
                      </p>
                      <p className="text-xs text-gray-500">
                        Earned {xp} XP • Just now
                      </p>
                    </div>
                  </div>

                  <div className="text-center py-8 text-gray-500">
                    <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Start using our features to see your activity here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>XP Progress</span>
                      <span>{xp}/500</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.min((xp / 500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-3">
                      Next milestone: Silver Tier (500 XP)
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                    >
                      View Rewards
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      💡 Smart Search Tip
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Include relationship details for better recommendations
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">
                      🎯 Cultural Context
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Mention cultural background for appropriate suggestions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
