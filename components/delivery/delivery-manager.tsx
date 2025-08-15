"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, CreditCard, CheckCircle, AlertCircle, ExternalLink, Crown, Lock, Zap } from "lucide-react"
import { toast } from "sonner"
import {
  EXTERNAL_SERVICES,
  SERVICE_CONFIG,
  handleDelivery,
  getUserAvailableServices,
  type ExternalService,
  type DeliveryOptions,
  type DeliveryResult,
} from "@/lib/external-services"

interface DeliveryManagerProps {
  userId: string
  userTier: string
  userCredits: number
  onCreditsUpdate: (newCredits: number) => void
  prefilledService?: ExternalService
  prefilledOptions?: Partial<DeliveryOptions>
}

export function DeliveryManager({
  userId,
  userTier,
  userCredits,
  onCreditsUpdate,
  prefilledService,
  prefilledOptions,
}: DeliveryManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ExternalService | null>(prefilledService || null)
  const [availableServices, setAvailableServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  // Form state
  const [recipientName, setRecipientName] = useState(prefilledOptions?.recipient?.name || "")
  const [recipientEmail, setRecipientEmail] = useState(prefilledOptions?.recipient?.email || "")
  const [recipientPhone, setRecipientPhone] = useState(prefilledOptions?.recipient?.phone || "")
  const [address, setAddress] = useState({
    street: prefilledOptions?.recipient?.address?.street || "",
    city: prefilledOptions?.recipient?.address?.city || "",
    state: prefilledOptions?.recipient?.address?.state || "",
    zipCode: prefilledOptions?.recipient?.address?.zipCode || "",
    country: prefilledOptions?.recipient?.address?.country || "US",
  })
  const [giftType, setGiftType] = useState(prefilledOptions?.gift?.type || "")
  const [giftDescription, setGiftDescription] = useState(prefilledOptions?.gift?.description || "")
  const [giftValue, setGiftValue] = useState(prefilledOptions?.gift?.value?.toString() || "")
  const [messageText, setMessageText] = useState(prefilledOptions?.message?.text || "")
  const [senderName, setSenderName] = useState(prefilledOptions?.message?.senderName || "")
  const [deliveryDate, setDeliveryDate] = useState(prefilledOptions?.delivery?.date || "")
  const [deliveryTime, setDeliveryTime] = useState(prefilledOptions?.delivery?.time || "")
  const [deliveryInstructions, setDeliveryInstructions] = useState(prefilledOptions?.delivery?.instructions || "")

  useEffect(() => {
    if (isOpen) {
      loadAvailableServices()
    }
  }, [isOpen, userId])

  const loadAvailableServices = async () => {
    try {
      const services = await getUserAvailableServices(userId)
      setAvailableServices(services)
    } catch (error) {
      console.error("Failed to load services:", error)
      toast.error("Failed to load delivery services")
    }
  }

  const handleServiceSelect = (service: ExternalService) => {
    setSelectedService(service)
    setCurrentStep(2)
  }

  const handleDeliverySubmit = async () => {
    if (!selectedService) return

    const serviceConfig = SERVICE_CONFIG[selectedService]

    // Validate required fields
    if (!recipientName || !giftDescription) {
      toast.error("Please fill in all required fields")
      return
    }

    // Check credits
    if (userCredits < serviceConfig.creditCost) {
      toast.error(`Insufficient credits. Need ${serviceConfig.creditCost}, have ${userCredits}`)
      return
    }

    setIsLoading(true)

    try {
      const options: DeliveryOptions = {
        service: selectedService,
        recipient: {
          name: recipientName,
          email: recipientEmail || undefined,
          phone: recipientPhone || undefined,
          address: address.street ? address : undefined,
        },
        gift: {
          type: giftType,
          description: giftDescription,
          value: giftValue ? Number.parseFloat(giftValue) : undefined,
        },
        message: messageText
          ? {
              text: messageText,
              senderName: senderName,
            }
          : undefined,
        delivery: {
          date: deliveryDate || undefined,
          time: deliveryTime || undefined,
          instructions: deliveryInstructions || undefined,
        },
      }

      const result = await handleDelivery(userId, options)
      setDeliveryResult(result)

      if (result.success) {
        onCreditsUpdate(userCredits - result.creditsUsed)
        setCurrentStep(3)
        toast.success(`${serviceConfig.name} delivery initiated successfully!`)
      } else {
        toast.error(result.error || "Delivery failed")
      }
    } catch (error) {
      console.error("Delivery error:", error)
      toast.error("Failed to process delivery")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setSelectedService(null)
    setDeliveryResult(null)
    setRecipientName("")
    setRecipientEmail("")
    setRecipientPhone("")
    setAddress({ street: "", city: "", state: "", zipCode: "", country: "US" })
    setGiftType("")
    setGiftDescription("")
    setGiftValue("")
    setMessageText("")
    setSenderName("")
    setDeliveryDate("")
    setDeliveryTime("")
    setDeliveryInstructions("")
  }

  const getServicesByCategory = () => {
    const categories: Record<string, any[]> = {}
    availableServices.forEach((service) => {
      const category = service.config.category
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(service)
    })
    return categories
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          onClick={() => setIsOpen(true)}
        >
          <Package className="w-4 h-4 mr-2" />
          Send Physical Gift
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Partner Gift Fulfillment
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            1
          </div>
          <div className={`w-12 h-1 rounded ${currentStep >= 2 ? "bg-purple-500" : "bg-gray-200"}`} />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            2
          </div>
          <div className={`w-12 h-1 rounded ${currentStep >= 3 ? "bg-purple-500" : "bg-gray-200"}`} />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3 ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            3
          </div>
        </div>

        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Choose Delivery Service</h3>
              <p className="text-sm text-muted-foreground">
                Select a partner service to send physical gifts and experiences
              </p>
            </div>

            {Object.entries(getServicesByCategory()).map(([category, services]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map(({ service, config, hasAccess, isConnected }) => (
                    <Card
                      key={service}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !hasAccess ? "opacity-60" : ""
                      } ${selectedService === service ? "ring-2 ring-purple-500" : ""}`}
                      onClick={() => hasAccess && isConnected && handleServiceSelect(service)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{config.icon}</span>
                            <div>
                              <h5 className="font-medium text-sm">{config.name}</h5>
                              <p className="text-xs text-muted-foreground">{config.estimatedDelivery}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {config.creditCost} credits
                            </Badge>
                            {!hasAccess && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="w-3 h-3 mr-1" />
                                {SERVICE_CONFIG[service].requiredTier}
                              </Badge>
                            )}
                            {hasAccess && !isConnected && (
                              <Badge variant="outline" className="text-xs text-orange-600">
                                Setup Required
                              </Badge>
                            )}
                            {hasAccess && isConnected && (
                              <Badge variant="outline" className="text-xs text-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Ready
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{config.description}</p>

                        {!hasAccess && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-center">
                            <p className="text-xs text-muted-foreground mb-1">
                              Requires {SERVICE_CONFIG[service].requiredTier} tier
                            </p>
                            <Button size="sm" variant="outline" className="text-xs bg-transparent">
                              <Crown className="w-3 h-3 mr-1" />
                              Upgrade
                            </Button>
                          </div>
                        )}

                        {hasAccess && !isConnected && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-center">
                            <p className="text-xs text-muted-foreground mb-1">Connect your account</p>
                            <Button size="sm" variant="outline" className="text-xs bg-transparent">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Setup
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Delivery Details */}
        {currentStep === 2 && selectedService && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Delivery Details</h3>
                <p className="text-sm text-muted-foreground">
                  {SERVICE_CONFIG[selectedService].name} • {SERVICE_CONFIG[selectedService].creditCost} credits
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                Change Service
              </Button>
            </div>

            <Tabs defaultValue="recipient" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="recipient">Recipient</TabsTrigger>
                <TabsTrigger value="gift">Gift</TabsTrigger>
                <TabsTrigger value="message">Message</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
              </TabsList>

              <TabsContent value="recipient" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipientName">Name *</Label>
                    <Input
                      id="recipientName"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipientEmail">Email</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="recipientPhone">Phone</Label>
                  <Input
                    id="recipientPhone"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Address fields for physical deliveries */}
                {[EXTERNAL_SERVICES.AMAZON_GIFTING, EXTERNAL_SERVICES.DOORDASH, EXTERNAL_SERVICES.SENDOSO].includes(
                  selectedService,
                ) && (
                  <div className="space-y-4">
                    <Separator />
                    <h4 className="font-medium">Delivery Address</h4>
                    <div>
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          placeholder="NY"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={address.zipCode}
                          onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                          placeholder="10001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={address.country}
                          onValueChange={(value) => setAddress({ ...address, country: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="gift" className="space-y-4">
                <div>
                  <Label htmlFor="giftType">Gift Type</Label>
                  <Input
                    id="giftType"
                    value={giftType}
                    onChange={(e) => setGiftType(e.target.value)}
                    placeholder="Birthday gift, Thank you, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="giftDescription">Description *</Label>
                  <Textarea
                    id="giftDescription"
                    value={giftDescription}
                    onChange={(e) => setGiftDescription(e.target.value)}
                    placeholder="Describe what you'd like to send..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="giftValue">Approximate Value ($)</Label>
                  <Input
                    id="giftValue"
                    type="number"
                    value={giftValue}
                    onChange={(e) => setGiftValue(e.target.value)}
                    placeholder="50"
                  />
                </div>
              </TabsContent>

              <TabsContent value="message" className="space-y-4">
                <div>
                  <Label htmlFor="senderName">Your Name</Label>
                  <Input
                    id="senderName"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="messageText">Gift Message</Label>
                  <Textarea
                    id="messageText"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Write a personal message..."
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="delivery" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deliveryDate">Preferred Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryTime">Preferred Time</Label>
                    <Input
                      id="deliveryTime"
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="deliveryInstructions">Special Instructions</Label>
                  <Textarea
                    id="deliveryInstructions"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="Leave at door, ring bell, etc."
                    rows={2}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                <span>Cost: {SERVICE_CONFIG[selectedService].creditCost} credits</span>
                <span>•</span>
                <span>Balance: {userCredits} credits</span>
              </div>
              <Button
                onClick={handleDeliverySubmit}
                disabled={
                  isLoading ||
                  !recipientName ||
                  !giftDescription ||
                  userCredits < SERVICE_CONFIG[selectedService].creditCost
                }
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Send Gift
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && deliveryResult && (
          <div className="space-y-6 text-center">
            {deliveryResult.success ? (
              <>
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Gift Sent Successfully!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your gift has been processed and is on its way to {recipientName}
                  </p>
                </div>

                <Card className="text-left">
                  <CardHeader>
                    <CardTitle className="text-sm">Delivery Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {deliveryResult.orderId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID:</span>
                        <span className="font-mono">{deliveryResult.orderId}</span>
                      </div>
                    )}
                    {deliveryResult.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tracking:</span>
                        <span className="font-mono">{deliveryResult.trackingNumber}</span>
                      </div>
                    )}
                    {deliveryResult.estimatedDelivery && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery:</span>
                        <span>{deliveryResult.estimatedDelivery}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credits Used:</span>
                      <span>{deliveryResult.creditsUsed}</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Delivery Failed</h3>
                  <p className="text-sm text-muted-foreground">{deliveryResult.error}</p>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
                Send Another
              </Button>
              <Button onClick={() => setIsOpen(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

