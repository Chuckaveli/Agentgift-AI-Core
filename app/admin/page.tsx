"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Users,
  FileText,
  Settings,
  MessageSquare,
  Award,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  LogOut,
  Moon,
  Sun,
  BarChart3,
  UserCheck,
  Zap,
  Gift,
  Bell,
  Shield,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

// Mock data
const adminData = {
  name: "Sarah Chen",
  email: "sarah@agentgift.ai",
  avatar: "/placeholder.svg?height=40&width=40",
  role: "Super Admin",
}

const siteMetrics = {
  newUsers: { value: 1247, change: 12.5, trend: "up" },
  totalUsers: { value: 15683, change: 8.2, trend: "up" },
  topFeature: { name: "AI Recommendations", usage: 89.3, change: 5.1, trend: "up" },
  errors: { value: 23, change: -15.2, trend: "down" },
  revenue: { value: 45280, change: 18.7, trend: "up" },
  satisfaction: { value: 4.8, change: 0.2, trend: "up" },
}

const recentBlogs = [
  {
    id: 1,
    title: "10 AI-Powered Gift Ideas for Tech Lovers",
    author: "Emma Wilson",
    status: "published",
    views: 2847,
    publishedAt: "2024-01-15",
    category: "Tech Gifts",
  },
  {
    id: 2,
    title: "The Psychology Behind Perfect Gift Giving",
    author: "Dr. Michael Chen",
    status: "draft",
    views: 0,
    publishedAt: null,
    category: "Psychology",
  },
  {
    id: 3,
    title: "Holiday Gift Trends 2024: What Our AI Learned",
    author: "Sarah Johnson",
    status: "published",
    views: 5234,
    publishedAt: "2024-01-12",
    category: "Trends",
  },
  {
    id: 4,
    title: "Building Emotional Intelligence in AI",
    author: "Alex Rodriguez",
    status: "review",
    views: 0,
    publishedAt: null,
    category: "AI",
  },
  {
    id: 5,
    title: "Customer Success Stories: Gifts That Changed Lives",
    author: "Lisa Park",
    status: "published",
    views: 3891,
    publishedAt: "2024-01-10",
    category: "Stories",
  },
]

const navigationItems = [
  {
    title: "Overview",
    icon: BarChart3,
    href: "/admin",
    isActive: true,
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users",
    badge: "1.2k",
  },
  {
    title: "Blogs",
    icon: FileText,
    href: "/admin/blogs",
    badge: "12",
  },
  {
    title: "Features",
    icon: Zap,
    href: "/admin/features",
  },
  {
    title: "Concierge Logs",
    icon: MessageSquare,
    href: "/admin/concierge",
    badge: "new",
  },
  {
    title: "Badge Manager",
    icon: Award,
    href: "/admin/badges",
  },
]

function AdminSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-4 py-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AgentGift.ai
            </h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <Link href={item.href} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge variant={item.badge === "new" ? "destructive" : "secondary"} className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/settings">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/security">
                    <Shield className="w-4 h-4" />
                    <span>Security</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={adminData.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-purple-600 text-white text-sm">
                {adminData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{adminData.name}</p>
              <p className="text-xs text-muted-foreground truncate">{adminData.role}</p>
            </div>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-9 h-9"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function MetricCard({ title, value, change, trend, prefix = "", suffix = "" }: any) {
  const isPositive = trend === "up"
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TrendIcon className={`h-4 w-4 ${isPositive ? "text-green-600" : "text-red-600"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}
          {typeof value === "number" ? value.toLocaleString() : value}
          {suffix}
        </div>
        <p className="text-xs text-muted-foreground">
          <span className={isPositive ? "text-green-600" : "text-red-600"}>
            {isPositive ? "+" : ""}
            {change}%
          </span>{" "}
          from last month
        </p>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredBlogs = recentBlogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "default",
      draft: "secondary",
      review: "outline",
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any} className="capitalize">
        {status}
      </Badge>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          {/* Top Navigation */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="-ml-1" />
                <div className="hidden md:block">
                  <h1 className="text-lg font-semibold">Dashboard Overview</h1>
                  <p className="text-sm text-muted-foreground">Welcome back, {adminData.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
                </Button>

                <ThemeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={adminData.avatar || "/placeholder.svg"} alt={adminData.name} />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {adminData.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{adminData.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{adminData.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserCheck className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 space-y-6 p-4 md:p-6">
            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <MetricCard
                title="New Users"
                value={siteMetrics.newUsers.value}
                change={siteMetrics.newUsers.change}
                trend={siteMetrics.newUsers.trend}
              />
              <MetricCard
                title="Total Users"
                value={siteMetrics.totalUsers.value}
                change={siteMetrics.totalUsers.change}
                trend={siteMetrics.totalUsers.trend}
              />
              <MetricCard
                title="Top Feature Usage"
                value={siteMetrics.topFeature.usage}
                change={siteMetrics.topFeature.change}
                trend={siteMetrics.topFeature.trend}
                suffix="%"
              />
              <MetricCard
                title="System Errors"
                value={siteMetrics.errors.value}
                change={siteMetrics.errors.change}
                trend={siteMetrics.errors.trend}
              />
              <MetricCard
                title="Revenue"
                value={siteMetrics.revenue.value}
                change={siteMetrics.revenue.change}
                trend={siteMetrics.revenue.trend}
                prefix="$"
              />
              <MetricCard
                title="Satisfaction"
                value={siteMetrics.satisfaction.value}
                change={siteMetrics.satisfaction.change}
                trend={siteMetrics.satisfaction.trend}
                suffix="/5"
              />
            </div>

            {/* Recent Blog Submissions */}
            <Card>
              <CardHeader>
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div>
                    <CardTitle>Recent Blog Submissions</CardTitle>
                    <CardDescription>Latest blog posts and their current status</CardDescription>
                  </div>
                  <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search blogs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full md:w-[250px]"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="hidden md:table-cell">Author</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Category</TableHead>
                        <TableHead className="hidden lg:table-cell">Views</TableHead>
                        <TableHead className="hidden xl:table-cell">Published</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBlogs.map((blog) => (
                        <TableRow key={blog.id}>
                          <TableCell className="font-medium">
                            <div className="max-w-[200px] truncate">{blog.title}</div>
                            <div className="md:hidden text-sm text-muted-foreground">{blog.author}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{blog.author}</TableCell>
                          <TableCell>{getStatusBadge(blog.status)}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="outline">{blog.category}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center">
                              <Eye className="mr-1 h-3 w-3" />
                              {blog.views.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {blog.publishedAt ? (
                              <div className="flex items-center text-sm">
                                <Calendar className="mr-1 h-3 w-3" />
                                {new Date(blog.publishedAt).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View</DropdownMenuItem>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center p-6">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Manage Users</p>
                    <p className="text-2xl font-bold">15.6k</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center p-6">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Content</p>
                    <p className="text-2xl font-bold">247</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center p-6">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Support</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center p-6">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
