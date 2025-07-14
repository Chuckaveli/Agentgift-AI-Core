-- Feature Builder System Database Schema

-- Registered Features Table
CREATE TABLE IF NOT EXISTS registered_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  credit_cost INTEGER DEFAULT 1,
  xp_award INTEGER DEFAULT 25,
  tier_access TEXT[] DEFAULT '{"free_agent"}',
  ui_type VARCHAR(50) DEFAULT 'tile', -- tile, modal, quiz, viewer, form
  is_active BOOLEAN DEFAULT true,
  show_locked_preview BOOLEAN DEFAULT true,
  show_on_homepage BOOLEAN DEFAULT false,
  hide_from_free_tier BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature Usage Analytics
CREATE TABLE IF NOT EXISTS feature_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_slug VARCHAR(255) REFERENCES registered_features(slug) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  usage_date DATE DEFAULT CURRENT_DATE,
  usage_count INTEGER DEFAULT 1,
  credits_spent INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feature_slug, user_id, usage_date)
);

-- Feature Templates
CREATE TABLE IF NOT EXISTS feature_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ui_type VARCHAR(50) NOT NULL,
  default_credit_cost INTEGER DEFAULT 1,
  default_xp_award INTEGER DEFAULT 25,
  template_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Packages
CREATE TABLE IF NOT EXISTS campaign_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  feature_slugs TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice Commands Log
CREATE TABLE IF NOT EXISTS voice_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  command_text TEXT NOT NULL,
  parsed_intent JSONB,
  execution_status VARCHAR(50) DEFAULT 'pending', -- pending, success, failed
  feature_created VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook Integrations
CREATE TABLE IF NOT EXISTS feature_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_slug VARCHAR(255) REFERENCES registered_features(slug) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  webhook_type VARCHAR(50) NOT NULL, -- amazon, expedia, doordash, tiktok
  is_active BOOLEAN DEFAULT true,
  api_key_encrypted TEXT,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Templates
INSERT INTO feature_templates (name, description, ui_type, template_code) VALUES
('Surprise Reveal Modal', 'Interactive gift reveal with animations', 'modal', 
'import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Gift, Sparkles } from 'lucide-react'

export default function {{FEATURE_NAME}}() {
  const [isOpen, setIsOpen] = useState(false)
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="p-6">
      <Button onClick={() => setIsOpen(true)} className="w-full">
        <Gift className="w-4 h-4 mr-2" />
        Reveal Surprise
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              {{FEATURE_NAME}}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            {!revealed ? (
              <Button onClick={() => setRevealed(true)}>
                Click to Reveal!
              </Button>
            ) : (
              <div className="animate-bounce">
                <Gift className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                <p>Your surprise is revealed!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}'),

('Gift Voting Carousel', 'Swipeable gift options with voting', 'carousel',
'import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, X, RotateCcw } from 'lucide-react'

export default function {{FEATURE_NAME}}() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [votes, setVotes] = useState({ likes: 0, dislikes: 0 })

  const gifts = [
    { id: 1, name: "Cozy Blanket", image: "/placeholder.svg?height=200&width=200" },
    { id: 2, name: "Coffee Mug", image: "/placeholder.svg?height=200&width=200" },
    { id: 3, name: "Book Set", image: "/placeholder.svg?height=200&width=200" }
  ]

  const handleVote = (type: "like" | "dislike") => {
    setVotes(prev => ({ ...prev, [type === "like" ? "likes" : "dislikes"]: prev[type === "like" ? "likes" : "dislikes"] + 1 }))
    setCurrentIndex((prev) => (prev + 1) % gifts.length)
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardContent className="p-6 text-center">
          <img 
            src={gifts[currentIndex].image || "/placeholder.svg"} 
            alt={gifts[currentIndex].name}
            className="w-48 h-48 mx-auto mb-4 rounded-lg object-cover"
          />
          <h3 className="text-xl font-semibold mb-4">{gifts[currentIndex].name}</h3>
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => handleVote("dislike")}>
              <X className="w-5 h-5 text-red-500" />
            </Button>
            <Button onClick={() => handleVote("like")}>
              <Heart className="w-5 h-5 text-pink-500" />
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Likes: {votes.likes} | Dislikes: {votes.dislikes}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}'),

('Thought Log Form', 'Capture gift thoughts and memories', 'form',
'import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PenTool, Save } from 'lucide-react'

export default function {{FEATURE_NAME}}() {
  const [thought, setThought] = useState("")
  const [recipient, setRecipient] = useState("")
  const [occasion, setOccasion] = useState("")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Save logic here
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-purple-500" />
            {{FEATURE_NAME}}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient</Label>
            <Input 
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Who is this gift for?"
            />
          </div>
          
          <div>
            <Label htmlFor="occasion">Occasion</Label>
            <Input 
              id="occasion"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="What''s the occasion?"
            />
          </div>
          
          <div>
            <Label htmlFor="thought">Your Thoughts</Label>
            <Textarea 
              id="thought"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="What gift ideas are you thinking about?"
              rows={4}
            />
          </div>
          
          <Button onClick={handleSave} className="w-full" disabled={saved}>
            <Save className="w-4 h-4 mr-2" />
            {saved ? "Saved!" : "Save Thought"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}')
ON CONFLICT (name) DO NOTHING;

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_registered_features_slug ON registered_features(slug);
CREATE INDEX IF NOT EXISTS idx_registered_features_active ON registered_features(is_active);
CREATE INDEX IF NOT EXISTS idx_feature_analytics_date ON feature_analytics(usage_date);
CREATE INDEX IF NOT EXISTS idx_feature_analytics_feature ON feature_analytics(feature_slug);
CREATE INDEX IF NOT EXISTS idx_voice_commands_admin ON voice_commands(admin_id);
