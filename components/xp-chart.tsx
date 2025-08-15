"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Jan", xp: 2400 },
  { month: "Feb", xp: 3200 },
  { month: "Mar", xp: 4100 },
  { month: "Apr", xp: 5300 },
  { month: "May", xp: 6800 },
  { month: "Jun", xp: 8500 },
  { month: "Jul", xp: 9200 },
]

export function XPChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#F3F4F6",
            }}
            formatter={(value) => [`${value} XP`, "Company XP"]}
          />
          <Line
            type="monotone"
            dataKey="xp"
            stroke="#8B5CF6"
            strokeWidth={3}
            dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#8B5CF6", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

