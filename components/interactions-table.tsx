"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Gift, Calendar, Trophy, Users, ExternalLink } from "lucide-react"

const interactions = [
  {
    id: 1,
    employee: "Sarah Chen",
    avatar: "/placeholder.svg?height=32&width=32",
    action: "Sent Desk Drop",
    type: "gift",
    recipient: "Marketing Team",
    xp: 150,
    timestamp: "2 hours ago",
    status: "completed",
  },
  {
    id: 2,
    employee: "Marcus Johnson",
    avatar: "/placeholder.svg?height=32&width=32",
    action: "Joined Culture Quest",
    type: "event",
    recipient: "Q4 Innovation Challenge",
    xp: 200,
    timestamp: "4 hours ago",
    status: "active",
  },
  {
    id: 3,
    employee: "Emily Rodriguez",
    avatar: "/placeholder.svg?height=32&width=32",
    action: "Earned Badge",
    type: "achievement",
    recipient: "Team Builder",
    xp: 500,
    timestamp: "1 day ago",
    status: "completed",
  },
  {
    id: 4,
    employee: "David Kim",
    avatar: "/placeholder.svg?height=32&width=32",
    action: "Organized Event",
    type: "event",
    recipient: "Coffee & Code Session",
    xp: 300,
    timestamp: "2 days ago",
    status: "completed",
  },
  {
    id: 5,
    employee: "Lisa Wang",
    avatar: "/placeholder.svg?height=32&width=32",
    action: "Gift Exchange",
    type: "gift",
    recipient: "Alex Thompson",
    xp: 100,
    timestamp: "3 days ago",
    status: "completed",
  },
]

const getActionIcon = (type: string) => {
  switch (type) {
    case "gift":
      return <Gift className="w-4 h-4 text-green-400" />
    case "event":
      return <Calendar className="w-4 h-4 text-blue-400" />
    case "achievement":
      return <Trophy className="w-4 h-4 text-yellow-400" />
    default:
      return <Users className="w-4 h-4 text-purple-400" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-900/50 text-green-300 border-green-700">Completed</Badge>
    case "active":
      return <Badge className="bg-blue-900/50 text-blue-300 border-blue-700">Active</Badge>
    case "pending":
      return <Badge className="bg-yellow-900/50 text-yellow-300 border-yellow-700">Pending</Badge>
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}

export function InteractionsTable() {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Employee Activity</span>
          <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800 bg-transparent">
            <ExternalLink className="w-4 h-4 mr-2" />
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">Employee</TableHead>
                <TableHead className="text-gray-400">Action</TableHead>
                <TableHead className="text-gray-400">Target</TableHead>
                <TableHead className="text-gray-400">XP Earned</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interactions.map((interaction) => (
                <TableRow key={interaction.id} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={interaction.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {interaction.employee
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{interaction.employee}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getActionIcon(interaction.type)}
                      <span>{interaction.action}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{interaction.recipient}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-purple-400">+{interaction.xp}</span>
                      <span className="text-xs text-gray-500">XP</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(interaction.status)}</TableCell>
                  <TableCell className="text-gray-400 text-sm">{interaction.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
