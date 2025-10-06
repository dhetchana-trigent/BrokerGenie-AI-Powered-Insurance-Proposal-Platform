"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Building2, Shield, DollarSign, CheckCircle, AlertCircle, Star, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { useExtraction } from "@/lib/extraction-context"

interface PackageBuilderProps {
  onNext?: () => void
}

interface CoverageLine {
  id: string
  name: string
  description: string
  included: boolean
  limit: string
  premium: number
  icon: React.ComponentType<any>
}

interface PackageOption {
  id: string
  name: string
  description: string
  badge: string
  badgeVariant: "default" | "secondary" | "destructive" | "outline"
  icon: React.ComponentType<any>
  coverageLines: CoverageLine[]
  totalPremium: number
  monthlyPremium: number
  features: string[]
  recommended: boolean
  customizable?: boolean
}

export function PackageBuilder({ onNext }: PackageBuilderProps) {
  const { getBusinessType, getTotalInsuredValue, getStates, getLossHistory, getYearsInBusiness, getSafetyControls } = useExtraction()
  
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([])
  const [coverageLines, setCoverageLines] = useState<CoverageLine[]>([])
  const [customPackageConfig, setCustomPackageConfig] = useState<CoverageLine[]>([])


  // Generate dynamic package options based on business data
  const generatePackageOptions = (): PackageOption[] => {
    const businessType = getBusinessType()
    const tiv = getTotalInsuredValue()
    const yearsInBusiness = parseInt(getYearsInBusiness()) || 15
    const lossHistory = getLossHistory()
    const safetyControls = getSafetyControls()
    
    // Parse TIV value (remove $ and commas)
    const tivValue = parseInt(tiv.replace(/[$,]/g, '')) || 2500000
    
    // Determine risk factors
    const isHighRisk = lossHistory.includes('claims') && parseInt(lossHistory) > 1
    const isEstablished = yearsInBusiness > 10
    const hasGoodSafety = safetyControls.includes('Sprinklers') || safetyControls.includes('Security')
    
    // Base premiums adjusted by business factors
    const baseGL = 2500
    const baseProperty = Math.max(2000, Math.min(8000, tivValue * 0.002)) // 0.2% of TIV
    const baseCyber = 1200
    const baseEPLI = 800
    const baseUmbrella = 1500
    
    // Risk adjustments
    const riskMultiplier = isHighRisk ? 1.3 : (isEstablished && hasGoodSafety ? 0.9 : 1.0)
    
    const packages: PackageOption[] = [
      {
        id: "essential",
        name: "Essential Coverage",
        description: "Basic protection meeting minimum requirements",
        badge: "Budget-Friendly",
        badgeVariant: "secondary",
        icon: Shield,
        coverageLines: [
          {
            id: "gl",
            name: "General Liability",
            description: "Protects against third-party bodily injury and property damage claims",
            included: true,
            limit: "$1M/$2M",
            premium: Math.round(baseGL * riskMultiplier),
            icon: Shield
          },
          {
            id: "property",
            name: "Property Insurance",
            description: "Covers buildings, equipment, and business personal property",
            included: true,
            limit: `$${tivValue.toLocaleString()}`,
            premium: Math.round(baseProperty * riskMultiplier),
            icon: Building2
          },
          {
            id: "cyber",
            name: "Cyber Liability",
            description: "Protects against data breaches and cyber attacks",
            included: false,
            limit: "$1M",
            premium: Math.round(baseCyber * riskMultiplier),
            icon: Shield
          },
          {
            id: "epli",
            name: "Employment Practices",
            description: "Covers employment-related claims and lawsuits",
            included: false,
            limit: "$1M",
            premium: Math.round(baseEPLI * riskMultiplier),
            icon: Shield
          },
          {
            id: "umbrella",
            name: "Umbrella Liability",
            description: "Additional liability coverage above primary policies",
            included: false,
            limit: "$2M",
            premium: Math.round(baseUmbrella * riskMultiplier),
            icon: Shield
          }
        ],
        totalPremium: 0,
        monthlyPremium: 0,
        features: [
          "General Liability Coverage",
          "Property Protection",
          "Basic Risk Management"
        ],
        recommended: false
      },
      {
        id: "balanced",
        name: "Balanced Protection",
        description: "Customize your coverage to match your specific needs",
        badge: "Customizable",
        badgeVariant: "default",
        icon: Target,
        coverageLines: [
          {
            id: "gl",
            name: "General Liability",
            description: "Protects against third-party bodily injury and property damage claims",
            included: true,
            limit: "$2M/$4M",
            premium: Math.round(baseGL * 1.2 * riskMultiplier),
            icon: Shield
          },
          {
            id: "property",
            name: "Property Insurance",
            description: "Covers buildings, equipment, and business personal property",
            included: true,
            limit: `$${tivValue.toLocaleString()}`,
            premium: Math.round(baseProperty * riskMultiplier),
            icon: Building2
          },
          {
            id: "cyber",
            name: "Cyber Liability",
            description: "Protects against data breaches and cyber attacks",
            included: false,
            limit: "$2M",
            premium: Math.round(baseCyber * riskMultiplier),
            icon: Shield
          },
          {
            id: "epli",
            name: "Employment Practices",
            description: "Covers employment-related claims and lawsuits",
            included: false,
            limit: "$1M",
            premium: Math.round(baseEPLI * riskMultiplier),
            icon: Shield
          },
          {
            id: "umbrella",
            name: "Umbrella Liability",
            description: "Additional liability coverage above primary policies",
            included: false,
            limit: "$5M",
            premium: Math.round(baseUmbrella * 1.5 * riskMultiplier),
            icon: Shield
          }
        ],
        totalPremium: 0,
        monthlyPremium: 0,
        features: [
          "Enhanced General Liability",
          "Property Protection",
          "Choose Your Endorsements",
          "Flexible Coverage Options",
          "Tailored Risk Management"
        ],
        recommended: true,
        customizable: true
      },
      {
        id: "comprehensive",
        name: "Comprehensive Shield",
        description: "Maximum protection with premium endorsements",
        badge: "Premium",
        badgeVariant: "outline",
        icon: Star,
        coverageLines: [
          {
            id: "gl",
            name: "General Liability",
            description: "Protects against third-party bodily injury and property damage claims",
            included: true,
            limit: "$5M/$10M",
            premium: Math.round(baseGL * 1.5 * riskMultiplier),
            icon: Shield
          },
          {
            id: "property",
            name: "Property Insurance",
            description: "Covers buildings, equipment, and business personal property",
            included: true,
            limit: `$${tivValue.toLocaleString()}`,
            premium: Math.round(baseProperty * 1.1 * riskMultiplier),
            icon: Building2
          },
          {
            id: "cyber",
            name: "Cyber Liability",
            description: "Protects against data breaches and cyber attacks",
            included: true,
            limit: "$5M",
            premium: Math.round(baseCyber * 1.5 * riskMultiplier),
            icon: Shield
          },
          {
            id: "epli",
            name: "Employment Practices",
            description: "Covers employment-related claims and lawsuits",
            included: true,
            limit: "$2M",
            premium: Math.round(baseEPLI * 1.3 * riskMultiplier),
            icon: Shield
          },
          {
            id: "umbrella",
            name: "Umbrella Liability",
            description: "Additional liability coverage above primary policies",
            included: true,
            limit: "$10M",
            premium: Math.round(baseUmbrella * 2 * riskMultiplier),
            icon: Shield
          }
        ],
        totalPremium: 0,
        monthlyPremium: 0,
        features: [
          "Maximum Liability Limits",
          "Advanced Cyber Protection",
          "Enhanced Employment Coverage",
          "High-Limit Umbrella",
          "Premium Risk Management",
          "Priority Claims Handling"
        ],
        recommended: false
      }
    ]

    // Calculate totals for each package
    return packages.map(pkg => {
      const totalPremium = pkg.coverageLines
        .filter(line => line.included)
        .reduce((sum, line) => sum + line.premium, 0)
      
      return {
        ...pkg,
        totalPremium,
        monthlyPremium: Math.round(totalPremium / 12)
      }
    })
  }

  // Initialize package options when component mounts or data changes
  useEffect(() => {
    const options = generatePackageOptions()
    setPackageOptions(options)
    
    // Set default selection to recommended package
    const recommended = options.find(pkg => pkg.recommended)
    if (recommended) {
      setSelectedPackage(recommended.id)
      setCoverageLines(recommended.coverageLines)
    }
  }, [getBusinessType(), getTotalInsuredValue(), getYearsInBusiness(), getLossHistory(), getSafetyControls()])

  // Update coverage lines when package selection changes
  useEffect(() => {
    const selectedPkg = packageOptions.find(pkg => pkg.id === selectedPackage)
    if (selectedPkg) {
      if (selectedPkg.customizable) {
        // For customizable packages, use custom config if available, otherwise use package defaults
        setCoverageLines(customPackageConfig.length > 0 ? customPackageConfig : selectedPkg.coverageLines)
      } else {
        setCoverageLines(selectedPkg.coverageLines)
      }
    }
  }, [selectedPackage, packageOptions, customPackageConfig])

  // Calculate total premium
  const totalPremium = coverageLines
    .filter(line => line.included)
    .reduce((sum, line) => sum + line.premium, 0)

  const finalPremium = totalPremium

  const toggleCoverage = (id: string) => {
    const updatedLines = coverageLines.map(line => 
      line.id === id ? { ...line, included: !line.included } : line
    )
    
    setCoverageLines(updatedLines)
    
    // If current package is customizable, update the custom config
    const selectedPkg = packageOptions.find(pkg => pkg.id === selectedPackage)
    if (selectedPkg?.customizable) {
      setCustomPackageConfig(updatedLines)
    }
  }

  const updateLimit = (id: string, limit: string) => {
    const updatedLines = coverageLines.map(line => 
      line.id === id ? { ...line, limit } : line
    )
    
    setCoverageLines(updatedLines)
    
    // If current package is customizable, update the custom config
    const selectedPkg = packageOptions.find(pkg => pkg.id === selectedPackage)
    if (selectedPkg?.customizable) {
      setCustomPackageConfig(updatedLines)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Package Builder & Pricing</h1>
        <p className="text-muted-foreground">
          Build your insurance package based on your risk profile and coverage needs
        </p>
      </div>

      {/* Client Summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Client Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Business Type</Label>
              <p className="font-semibold">{getBusinessType()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Total Insured Value</Label>
              <p className="font-semibold">{getTotalInsuredValue()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Location</Label>
              <p className="font-semibold">{getStates()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Loss History</Label>
              <p className="font-semibold">{getLossHistory()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Selection */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Choose Your Package
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select a package tailored to your business needs and risk profile
          </p>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage} className="space-y-4">
            {packageOptions.map((pkg) => {
              const Icon = pkg.icon
              return (
                <div key={pkg.id} className="relative">
                  {selectedPackage === pkg.id && (
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div 
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                      selectedPackage === pkg.id 
                        ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <RadioGroupItem 
                          value={pkg.id} 
                          id={pkg.id} 
                          className={cn(
                            "mt-1 h-5 w-5 border-2",
                            selectedPackage === pkg.id 
                              ? "border-primary text-primary" 
                              : "border-gray-300 hover:border-primary/50"
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg">{pkg.name}</h3>
                            <Badge variant={pkg.badgeVariant}>{pkg.badge}</Badge>
                            {pkg.recommended && (
                              <Badge variant="default" className="bg-green-600">
                                <Star className="h-3 w-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                            {pkg.customizable && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Target className="h-3 w-3 mr-1" />
                                Customizable
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                          
                          {/* Features */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                            {pkg.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Pricing */}
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-primary">
                          ${pkg.totalPremium.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Annual</div>
                        <div className="text-lg font-semibold">
                          ${pkg.monthlyPremium.toLocaleString()}/mo
                        </div>
                        <div className="text-sm text-muted-foreground">Monthly</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Coverage Lines */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Coverage Lines
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {(() => {
              const selectedPkg = packageOptions.find(pkg => pkg.id === selectedPackage)
              if (selectedPkg?.customizable) {
                return "Customize your coverage selection and limits below"
              }
              return "Coverage details for your selected package - customize as needed"
            })()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {coverageLines.map((line) => {
            const Icon = line.icon
            return (
              <div key={line.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">{line.name}</h3>
                      <p className="text-sm text-muted-foreground">{line.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Limit</p>
                      <Input
                        value={line.limit}
                        onChange={(e) => updateLimit(line.id, e.target.value)}
                        className="w-32 text-sm"
                        disabled={!line.included}
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Premium</p>
                      <p className="font-semibold">${line.premium.toLocaleString()}</p>
                    </div>
                    <Switch
                      checked={line.included}
                      onCheckedChange={() => toggleCoverage(line.id)}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>


      {/* Pricing Summary */}
      <Card className="shadow-sm border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Annual Premium</span>
              <span>${finalPremium.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Monthly Payment</span>
              <span>${Math.round(finalPremium / 12).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" className="bg-transparent">
          Back: Carrier Fit & Compliance
        </Button>
        <Button onClick={onNext}>
          Next: Activity
        </Button>
      </div>
    </div>
  )
}