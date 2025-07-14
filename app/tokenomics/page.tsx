import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from "lucide-react"

export default function TokenomicsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Tokenomics Overview</h1>

      {/* Cultural Intelligence Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Cultural Intelligence Bonuses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Holiday XP Multipliers</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bonus XP during cultural holidays</div>
              </div>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                1.5x - 2.5x
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Cross-Cultural Gifting</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Extra XP for culturally-aware gifts</div>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">+25 XP</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Cultural Respect Badge</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Unlock by following cultural etiquette</div>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">+100 XP</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
