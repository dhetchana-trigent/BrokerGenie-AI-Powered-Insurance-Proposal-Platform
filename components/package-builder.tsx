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
  onNext?: (selectedPackageData?: any) => void
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
}

export function PackageBuilder({ onNext }: PackageBuilderProps) {
  const { getBusinessType, getTotalInsuredValue, getStates, getLossHistory, getYearsInBusiness, getSafetyControls } = useExtraction()
  
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([])
  const [coverageLines, setCoverageLines] = useState<CoverageLine[]>([])
  const [carrierName, setCarrierName] = useState<string | null>(null)


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
    
    // Apply small carrier-specific variations
    const carrierMultiplier = carrierName === 'Liberty Mutual' ? 0.97
      : carrierName === 'Zurich' ? 1.03
      : carrierName === 'AIG' ? 1.08
      : 1.0

    const isAIG = carrierName === 'AIG'
    const isZurich = carrierName === 'Zurich'

    // Finance-specific base premiums (used for AIG finance packages)
    const baseDirectorsOfficers = 1800
    const baseProfessionalLiability = 2200
    const baseCrime = 1000
    const baseFiduciary = 900

    // Technology-specific base premiums (used for Zurich technology packages)
    const baseTechEO = 2000
    const baseNetworkSecurity = 1500
    const baseMediaLiability = 900
    const baseBreachResponse = 800

    const packages: PackageOption[] = [
      {
        id: "essential",
        name: carrierName ? (isAIG ? `AIG Finance Core` : isZurich ? `Zurich Tech Core` : `${carrierName} Essential`) : "Essential Coverage",
        description: isAIG ? "Core protection tailored for financial services" : isZurich ? "Core cyber and tech liability protection" : "Basic protection meeting minimum requirements",
        badge: "Budget-Friendly",
        badgeVariant: "default",
        icon: Shield,
        coverageLines: isAIG ? [
          {
            id: "eo",
            name: "Professional Liability (E&O)",
            description: "Covers errors, omissions, and negligence in professional services",
            included: true,
            limit: "$1M",
            premium: Math.round(baseProfessionalLiability * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "do",
            name: "Directors & Officers (D&O)",
            description: "Protects directors and officers against management decisions",
            included: false,
            limit: "$1M",
            premium: Math.round(baseDirectorsOfficers * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "crime",
            name: "Crime / Employee Dishonesty",
            description: "Losses from fraud, theft, and employee dishononesty",
            included: false,
            limit: "$100k",
            premium: Math.round(baseCrime * riskMultiplier * carrierMultiplier),
            icon: Shield
          }
        ] : isZurich ? [
          {
            id: "cyber",
            name: "Cyber Liability",
            description: "Protection for data breaches, ransomware, and cyber extortion",
            included: true,
            limit: "$1M",
            premium: Math.round(baseCyber * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "tech_eo",
            name: "Technology E&O",
            description: "Errors & omissions for software and technology services",
            included: false,
            limit: "$1M",
            premium: Math.round(baseTechEO * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "network",
            name: "Network Security & Privacy",
            description: "Liability arising from unauthorized access or data privacy events",
            included: false,
            limit: "$1M",
            premium: Math.round(baseNetworkSecurity * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "media",
            name: "Media Liability",
            description: "IP infringement and media content liabilities",
            included: false,
            limit: "$500k",
            premium: Math.round(baseMediaLiability * riskMultiplier * carrierMultiplier),
            icon: Shield
          }
        ] : [
          {
            id: "gl",
            name: "General Liability",
            description: "Protects against third-party bodily injury and property damage claims",
            included: true,
            limit: "$1M/$2M",
            premium: Math.round(baseGL * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "property",
            name: "Property Insurance",
            description: "Covers buildings, equipment, and business personal property",
            included: true,
            limit: `$${tivValue.toLocaleString()}`,
            premium: Math.round(baseProperty * riskMultiplier * carrierMultiplier),
            icon: Building2
          },
          {
            id: "cyber",
            name: "Cyber Liability",
            description: "Protects against data breaches and cyber attacks",
            included: false,
            limit: "$1M",
            premium: Math.round(baseCyber * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "epli",
            name: "Employment Practices",
            description: "Covers employment-related claims and lawsuits",
            included: false,
            limit: "$1M",
            premium: Math.round(baseEPLI * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "umbrella",
            name: "Umbrella Liability",
            description: "Additional liability coverage above primary policies",
            included: false,
            limit: "$2M",
            premium: Math.round(baseUmbrella * riskMultiplier * carrierMultiplier),
            icon: Shield
          }
        ],
        totalPremium: 0,
        monthlyPremium: 0,
        features: isAIG ? [
          "E&O included",
          "Optional D&O",
          "Optional Crime Coverage"
        ] : isZurich ? [
          "Core Cyber Protection",
          "Optional Technology E&O",
          "Optional Network Security & Media"
        ] : [
          "General Liability Coverage",
          "Property Protection",
          "Basic Risk Management"
        ],
      },
      {
        id: "balanced",
        name: carrierName ? (isAIG ? `AIG Finance Advantage` : isZurich ? `Zurich Tech Advantage` : `${carrierName} Balanced`) : "Balanced Protection",
        description: isAIG ? "Expanded finance coverages with stronger limits" : isZurich ? "Expanded technology coverages with stronger limits" : "Comprehensive coverage with essential endorsements",
        badge: "Best Value",
        badgeVariant: "default",
        icon: Target,
        coverageLines: isAIG ? [
          {
            id: "eo",
            name: "Professional Liability (E&O)",
            description: "Covers errors, omissions, and negligence in professional services",
            included: true,
            limit: "$2M",
            premium: Math.round(baseProfessionalLiability * 1.2 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "do",
            name: "Directors & Officers (D&O)",
            description: "Protects directors and officers against management decisions",
            included: true,
            limit: "$1M",
            premium: Math.round(baseDirectorsOfficers * 1.2 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "crime",
            name: "Crime / Employee Dishonesty",
            description: "Losses from fraud, theft, and employee dishonesty",
            included: true,
            limit: "$250k",
            premium: Math.round(baseCrime * 1.1 * riskMultiplier * carrierMultiplier),
            icon: Shield
          }
        ] : isZurich ? [
          {
            id: "cyber",
            name: "Cyber Liability",
            description: "Protection for data breaches, ransomware, and cyber extortion",
            included: true,
            limit: "$2M",
            premium: Math.round(baseCyber * 1.2 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "tech_eo",
            name: "Technology E&O",
            description: "Errors & omissions for software and technology services",
            included: true,
            limit: "$2M",
            premium: Math.round(baseTechEO * 1.2 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "network",
            name: "Network Security & Privacy",
            description: "Liability arising from unauthorized access or data privacy events",
            included: true,
            limit: "$1M",
            premium: Math.round(baseNetworkSecurity * 1.1 * riskMultiplier * carrierMultiplier),
            icon: Shield
          }
        ] : [
          {
            id: "gl",
            name: "General Liability",
            description: "Protects against third-party bodily injury and property damage claims",
            included: true,
            limit: "$2M/$4M",
            premium: Math.round(baseGL * 1.2 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "property",
            name: "Property Insurance",
            description: "Covers buildings, equipment, and business personal property",
            included: true,
            limit: `$${tivValue.toLocaleString()}`,
            premium: Math.round(baseProperty * riskMultiplier * carrierMultiplier),
            icon: Building2
          },
          {
            id: "cyber",
            name: "Cyber Liability",
            description: "Protects against data breaches and cyber attacks",
            included: true,
            limit: "$2M",
            premium: Math.round(baseCyber * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "epli",
            name: "Employment Practices",
            description: "Covers employment-related claims and lawsuits",
            included: true,
            limit: "$1M",
            premium: Math.round(baseEPLI * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "umbrella",
            name: "Umbrella Liability",
            description: "Additional liability coverage above primary policies",
            included: true,
            limit: "$5M",
            premium: Math.round(baseUmbrella * 1.5 * riskMultiplier * carrierMultiplier),
            icon: Shield
          }
        ],
        totalPremium: 0,
        monthlyPremium: 0,
        features: isAIG ? [
          "E&O and D&O included",
          "Crime coverage included",
          "Cyber and Umbrella protection"
        ] : isZurich ? [
          "Cyber + Tech E&O included",
          "Network Security included",
          "Tech-focused limits"
        ] : [
          "Enhanced General Liability",
          "Cyber Protection",
          "Employment Practices Coverage",
          "Umbrella Protection",
          "Comprehensive Risk Management"
        ],
      },
      {
        id: "comprehensive",
        name: carrierName ? (isAIG ? `AIG Finance Elite` : isZurich ? `Zurich Tech Elite` : `${carrierName} Comprehensive`) : "Comprehensive Shield",
        description: isAIG ? "Elite finance program with highest limits and extras" : isZurich ? "Elite technology program with highest cyber/tech limits" : "Maximum protection with premium endorsements",
        badge: "Premium",
        badgeVariant: "default",
        icon: Star,
        coverageLines: isAIG ? [
          {
            id: "eo",
            name: "Professional Liability (E&O)",
            description: "Covers errors, omissions, and negligence in professional services",
            included: true,
            limit: "$5M",
            premium: Math.round(baseProfessionalLiability * 1.5 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "do",
            name: "Directors & Officers (D&O)",
            description: "Protects directors and officers against management decisions",
            included: true,
            limit: "$2M",
            premium: Math.round(baseDirectorsOfficers * 1.5 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "crime",
            name: "Crime / Employee Dishonesty",
            description: "Losses from fraud, theft, and employee dishonesty",
            included: true,
            limit: "$500k",
            premium: Math.round(baseCrime * 1.3 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "fiduciary",
            name: "Fiduciary Liability",
            description: "Claims alleging mismanagement of employee benefit plans",
            included: true,
            limit: "$1M",
            premium: Math.round(baseFiduciary * 1.2 * riskMultiplier * carrierMultiplier),
            icon: Shield
          }
        ] : isZurich ? [
          {
            id: "cyber",
            name: "Cyber Liability",
            description: "Protection for data breaches, ransomware, and cyber extortion",
            included: true,
            limit: "$5M",
            premium: Math.round(baseCyber * 1.5 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "tech_eo",
            name: "Technology E&O",
            description: "Errors & omissions for software and technology services",
            included: true,
            limit: "$5M",
            premium: Math.round(baseTechEO * 1.5 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "network",
            name: "Network Security & Privacy",
            description: "Liability arising from unauthorized access or data privacy events",
            included: true,
            limit: "$2M",
            premium: Math.round(baseNetworkSecurity * 1.3 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "breach",
            name: "Data Breach Response",
            description: "Forensics, notification costs, and public relations support",
            included: true,
            limit: "$500k",
            premium: Math.round(baseBreachResponse * 1.2 * riskMultiplier * carrierMultiplier),
            icon: Shield
          }
        ] : [
          {
            id: "gl",
            name: "General Liability",
            description: "Protects against third-party bodily injury and property damage claims",
            included: true,
            limit: "$5M/$10M",
            premium: Math.round(baseGL * 1.5 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "property",
            name: "Property Insurance",
            description: "Covers buildings, equipment, and business personal property",
            included: true,
            limit: `$${tivValue.toLocaleString()}`,
            premium: Math.round(baseProperty * 1.1 * riskMultiplier * carrierMultiplier),
            icon: Building2
          },
          {
            id: "cyber",
            name: "Cyber Liability",
            description: "Protects against data breaches and cyber attacks",
            included: true,
            limit: "$5M",
            premium: Math.round(baseCyber * 1.5 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "epli",
            name: "Employment Practices",
            description: "Covers employment-related claims and lawsuits",
            included: true,
            limit: "$2M",
            premium: Math.round(baseEPLI * 1.3 * riskMultiplier * carrierMultiplier),
            icon: Shield
          },
          {
            id: "umbrella",
            name: "Umbrella Liability",
            description: "Additional liability coverage above primary policies",
            included: true,
            limit: "$10M",
            premium: Math.round(baseUmbrella * 2 * riskMultiplier * carrierMultiplier),
            icon: Shield
          }
        ],
        totalPremium: 0,
        monthlyPremium: 0,
        features: isAIG ? [
          "Highest E&O and D&O limits",
          "Crime and Fiduciary included",
          "High-limit Umbrella and Cyber"
        ] : isZurich ? [
          "Highest Cyber + Tech E&O limits",
          "Network Security and Breach Response included",
          "Tech-focused elite protection"
        ] : [
          "Maximum Liability Limits",
          "Advanced Cyber Protection",
          "Enhanced Employment Coverage",
          "High-Limit Umbrella",
          "Premium Risk Management",
          "Priority Claims Handling"
        ],
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

  // Read selected carrier on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('bg_selected_carrier')
      setCarrierName(stored)
    } catch {}
  }, [])

  // Regenerate package options whenever carrier or extracted inputs change
  useEffect(() => {
    const options = generatePackageOptions()
    setPackageOptions(options)

    if (selectedPackage) {
      const selectedPkg = options.find(pkg => pkg.id === selectedPackage)
      if (selectedPkg) {
        setCoverageLines(selectedPkg.coverageLines)
      }
    }
  }, [carrierName, getBusinessType(), getTotalInsuredValue(), getYearsInBusiness(), getLossHistory(), getSafetyControls()])

  // Update coverage lines when package selection changes
  useEffect(() => {
    const selectedPkg = packageOptions.find(pkg => pkg.id === selectedPackage)
    if (selectedPkg) {
      setCoverageLines(selectedPkg.coverageLines)
    }
  }, [selectedPackage, packageOptions])

  // Calculate total premium
  const totalPremium = coverageLines
    .filter(line => line.included)
    .reduce((sum, line) => sum + line.premium, 0)

  const finalPremium = totalPremium

  const toggleCoverage = (id: string) => {
    setCoverageLines(prev => 
      prev.map(line => 
        line.id === id ? { ...line, included: !line.included } : line
      )
    )
  }

  const updateLimit = (id: string, limit: string) => {
    setCoverageLines(prev => 
      prev.map(line => 
        line.id === id ? { ...line, limit } : line
      )
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{carrierName ? `${carrierName} | Package Builder & Pricing` : 'BrokerGenie | Package Builder & Pricing'}</h1>
        <p className="text-muted-foreground">
          {carrierName ? `Carrier-specific options and pricing tuned for ${carrierName}` : 'Build your insurance package based on your risk profile and coverage needs'}
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
            Coverage details for your selected package - customize as needed
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedPackage ? (
            coverageLines.map((line) => {
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
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Please select a package above to view coverage details</p>
            </div>
          )}
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
            {selectedPackage ? (
              <>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Annual Premium</span>
                  <span>${finalPremium.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Monthly Payment</span>
                  <span>${Math.round(finalPremium / 12).toLocaleString()}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select a package to view pricing</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end pt-6">
        <Button 
          onClick={() => {
            const selectedPkg = packageOptions.find(pkg => pkg.id === selectedPackage)
            if (selectedPkg) {
              // Update the package with current calculated premium (including toggled coverage lines)
              const updatedPackage = {
                ...selectedPkg,
                totalPremium: finalPremium,
                monthlyPremium: Math.round(finalPremium / 12),
                coverageLines: coverageLines // Include current coverage line states
              }
              onNext?.(updatedPackage)
            }
          }}
          disabled={!selectedPackage}
        >
          Generate Proposal
        </Button>
      </div>
    </div>
  )
}