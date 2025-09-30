"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle, RotateCcw, ChevronDown, Lock, Unlock, CheckCircle2, Circle, Calculator, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface CoverageOption {
  name: string
  value: string
  tooltip: string
}

interface PackageConfig {
  name: string
  description: string
  glLimits: string
  propertyTiv: string
  propertyDeductible: string
  biDays: string
  crime: boolean
  crimeLimit: string
  cyber: boolean
  cyberLimit: string
  epli: boolean
  epliLimit: string
  umbrella: boolean
  umbrellaLimit: string
  endorsements: string[]
  pricing: {
    annual_low: number
    annual_high: number
    monthly: number
    breakdown: {
      gl: number
      property: number
      cyber: number
      epli: number
      umbrella: number
      fees: number
      taxes: number
    }
  }
}

interface PackageBuilderProps {
  onNext?: () => void
}

const glLimitOptions: CoverageOption[] = [
  {
    name: "$1M/$2M",
    value: "1M/2M",
    tooltip: "Manufacturing operations → Standard GL limits for liability protection",
  },
  {
    name: "$2M/$4M",
    value: "2M/4M",
    tooltip: "Higher limits → Better protection for manufacturing liability exposure",
  },
  { name: "$1M/$3M", value: "1M/3M", tooltip: "Alternative structure → Balanced per occurrence and aggregate limits" },
]

const propertyDeductibleOptions: CoverageOption[] = [
  { name: "$500", value: "500", tooltip: "Lower deductible → Reduced out-of-pocket costs for claims" },
  { name: "$1,000", value: "1000", tooltip: "Standard deductible → Balance between premium and retention" },
  { name: "$2,500", value: "2500", tooltip: "Higher deductible → Lower premium with increased retention" },
  { name: "$5,000", value: "5000", tooltip: "High deductible → Significant premium savings for larger losses only" },
]

const biDaysOptions: CoverageOption[] = [
  { name: "30 days", value: "30", tooltip: "Basic coverage → Short-term business interruption protection" },
  { name: "60 days", value: "60", tooltip: "Standard coverage → Moderate business interruption protection" },
  { name: "90 days", value: "90", tooltip: "Extended coverage → Comprehensive business interruption protection" },
  { name: "180 days", value: "180", tooltip: "Maximum coverage → Long-term business interruption protection" },
]

const endorsementOptions = [
  "Equipment Breakdown",
  "Ordinance & Law",
  "Business Income Extra Expense",
  "Accounts Receivable",
  "Electronic Data Processing",
  "Spoilage Coverage",
  "Debris Removal",
  "Professional Liability",
]

// Pricing constants
const BASES = {
  GL_base: 900,
  PROP_base: 1100,
  CYBER_base: 600,
  EPLI_base: 500,
  UMB_base: 750,
}

const CLASS_FACTORS = [0.9, 1.0, 1.2] // NAICS bucket factors
const STATE_FACTORS = [0.95, 1.0, 1.1] // State factors

const DEDUCTIBLE_FACTORS: Record<number, number> = {
  500: 1.1,
  1000: 1.0,
  2500: 0.92,
  5000: 0.86,
}

const UMBRELLA_FACTORS: Record<number, number> = {
  0: 0,
  1000000: 1.0,
  2000000: 1.8,
  3000000: 2.5,
  5000000: 3.8,
}

export function PackageBuilder({ onNext }: PackageBuilderProps) {
  const [packages, setPackages] = useState<PackageConfig[]>([
    {
      name: "Essential",
      description: "Meets minimum requirements and compliance standards",
      glLimits: "1M/2M",
      propertyTiv: "2500000",
      propertyDeductible: "1000",
      biDays: "30",
      crime: false,
      crimeLimit: "25000",
      cyber: false,
      cyberLimit: "1000000",
      epli: false,
      epliLimit: "1000000",
      umbrella: false,
      umbrellaLimit: "1000000",
      endorsements: ["Equipment Breakdown"],
      pricing: {
        annual_low: 0,
        annual_high: 0,
        monthly: 0,
        breakdown: { gl: 0, property: 0, cyber: 0, epli: 0, umbrella: 0, fees: 50, taxes: 0 },
      },
    },
    {
      name: "Balanced",
      description: "Recommended coverage with balanced protection and cost",
      glLimits: "1M/2M",
      propertyTiv: "2500000",
      propertyDeductible: "1000",
      biDays: "60",
      crime: true,
      crimeLimit: "50000",
      cyber: true,
      cyberLimit: "1000000",
      epli: true,
      epliLimit: "1000000",
      umbrella: true,
      umbrellaLimit: "5000000",
      endorsements: ["Equipment Breakdown", "Ordinance & Law", "Business Income Extra Expense"],
      pricing: {
        annual_low: 0,
        annual_high: 0,
        monthly: 0,
        breakdown: { gl: 0, property: 0, cyber: 0, epli: 0, umbrella: 0, fees: 50, taxes: 0 },
      },
    },
    {
      name: "Comprehensive",
      description: "Maximum protection with higher limits and endorsements",
      glLimits: "2M/4M",
      propertyTiv: "2500000",
      propertyDeductible: "500",
      biDays: "90",
      crime: true,
      crimeLimit: "100000",
      cyber: true,
      cyberLimit: "2000000",
      epli: true,
      epliLimit: "2000000",
      umbrella: true,
      umbrellaLimit: "5000000",
      endorsements: [
        "Equipment Breakdown",
        "Ordinance & Law",
        "Business Income Extra Expense",
        "Accounts Receivable",
        "Electronic Data Processing",
        "Spoilage Coverage",
      ],
      pricing: {
        annual_low: 0,
        annual_high: 0,
        monthly: 0,
        breakdown: { gl: 0, property: 0, cyber: 0, epli: 0, umbrella: 0, fees: 50, taxes: 0 },
      },
    },
  ])

  const [editingPackage, setEditingPackage] = useState<number | null>(null)
  const [credits, setCredits] = useState({
    prior_coverage: false,
    risk_control: false,
  })
  const [scheduleAdjustment, setScheduleAdjustment] = useState([0])
  const [lockedPackage, setLockedPackage] = useState<number | null>(null)
  const [expandedExplain, setExpandedExplain] = useState<number | null>(null)
  const [showPricingDetails, setShowPricingDetails] = useState(false)

  // Calculate pricing for a package
  const calculatePricing = (pkg: PackageConfig) => {
    const classIndex = 1 // Default to middle class factor
    const stateIndex = 1 // Default to middle state factor

    const gl_class = CLASS_FACTORS[classIndex] || 1.0
    const gl_state = STATE_FACTORS[stateIndex] || 1.0
    const prop_class = CLASS_FACTORS[classIndex] || 1.0
    const prop_state = STATE_FACTORS[stateIndex] || 1.0

    const tiv = Number.parseInt(pkg.propertyTiv)
    const deductible = Number.parseInt(pkg.propertyDeductible)
    const umbrellaLimit = pkg.umbrella ? Number.parseInt(pkg.umbrellaLimit) : 0

    const tiv_factor = Math.max(0.6, Math.min(2.0, tiv / 500000))
    const deductible_factor = DEDUCTIBLE_FACTORS[deductible] || 1.0
    const umbrella_factor = UMBRELLA_FACTORS[umbrellaLimit] || 0

    // Calculate base premiums
    const gl_premium = BASES.GL_base * gl_class * gl_state
    const prop_premium = tiv > 0 ? BASES.PROP_base * prop_class * prop_state * tiv_factor * deductible_factor : 0
    const cyber_premium = pkg.cyber ? BASES.CYBER_base : 0
    const epli_premium = pkg.epli ? BASES.EPLI_base : 0
    const umbrella_premium = BASES.UMB_base * umbrella_factor

    const premium_base = gl_premium + prop_premium + cyber_premium + epli_premium + umbrella_premium

    // Schedule adjustment
    const schedule_pct = scheduleAdjustment[0] / 100
    const schedule_adj = premium_base * schedule_pct

    // Credits
    const credits_total = (credits.prior_coverage ? 100 : 0) + (credits.risk_control ? 100 : 0)

    // Fees and taxes
    const fees = 50
    const taxes = Math.round((premium_base + schedule_adj - credits_total + fees) * 0.03)

    const annual_total = premium_base + schedule_adj - credits_total + fees + taxes
    const annual_low = Math.round(annual_total * 0.92)
    const annual_high = Math.round(annual_total * 1.08)
    const monthly = Math.round(annual_total / 12)

    return {
      annual_low,
      annual_high,
      monthly,
      breakdown: {
        gl: Math.round(gl_premium),
        property: Math.round(prop_premium),
        cyber: Math.round(cyber_premium),
        epli: Math.round(epli_premium),
        umbrella: Math.round(umbrella_premium),
        fees,
        taxes,
      },
    }
  }

  // Update pricing when any value changes
  useEffect(() => {
    setPackages((prev) =>
      prev.map((pkg) => ({
        ...pkg,
        pricing: calculatePricing(pkg),
      }))
    )
  }, [credits, scheduleAdjustment])

  const updatePackage = (index: number, field: string, value: any) => {
    setPackages((prev) => {
      const updated = prev.map((pkg, i) => (i === index ? { ...pkg, [field]: value } : pkg))
      // Recalculate pricing for the updated package
      updated[index].pricing = calculatePricing(updated[index])
      return updated
    })
  }

  const toggleEndorsement = (packageIndex: number, endorsement: string) => {
    setPackages((prev) =>
      prev.map((pkg, i) => {
        if (i === packageIndex) {
          const endorsements = pkg.endorsements.includes(endorsement)
            ? pkg.endorsements.filter((e) => e !== endorsement)
            : [...pkg.endorsements, endorsement]
          const updated = { ...pkg, endorsements }
          updated.pricing = calculatePricing(updated)
          return updated
        }
        return pkg
      }),
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCurrencyString = (value: string) => {
    const num = Number.parseInt(value)
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    return `$${num.toLocaleString()}`
  }

  const getPackageBadge = (index: number) => {
    switch (index) {
      case 0:
        return { text: "Meets minimums", variant: "secondary" as const }
      case 1:
        return { text: "Recommended", variant: "default" as const }
      case 2:
        return { text: "Enhanced protection", variant: "secondary" as const }
      default:
        return { text: "", variant: "secondary" as const }
    }
  }

  const resetToDefaults = () => {
    // Reset packages to original defaults
    setPackages([
      {
        name: "Essential",
        description: "Meets minimum requirements and compliance standards",
        glLimits: "1M/2M",
        propertyTiv: "2500000",
        propertyDeductible: "1000",
        biDays: "30",
        crime: false,
        crimeLimit: "25000",
        cyber: false,
        cyberLimit: "1000000",
        epli: false,
        epliLimit: "1000000",
        umbrella: false,
        umbrellaLimit: "1000000",
        endorsements: ["Equipment Breakdown"],
        pricing: {
          annual_low: 0,
          annual_high: 0,
          monthly: 0,
          breakdown: { gl: 0, property: 0, cyber: 0, epli: 0, umbrella: 0, fees: 50, taxes: 0 },
        },
      },
      {
        name: "Balanced",
        description: "Recommended coverage with balanced protection and cost",
        glLimits: "1M/2M",
        propertyTiv: "2500000",
        propertyDeductible: "1000",
        biDays: "60",
        crime: true,
        crimeLimit: "50000",
        cyber: true,
        cyberLimit: "1000000",
        epli: true,
        epliLimit: "1000000",
        umbrella: true,
        umbrellaLimit: "5000000",
        endorsements: ["Equipment Breakdown", "Ordinance & Law", "Business Income Extra Expense"],
        pricing: {
          annual_low: 0,
          annual_high: 0,
          monthly: 0,
          breakdown: { gl: 0, property: 0, cyber: 0, epli: 0, umbrella: 0, fees: 50, taxes: 0 },
        },
      },
      {
        name: "Comprehensive",
        description: "Maximum protection with higher limits and endorsements",
        glLimits: "2M/4M",
        propertyTiv: "2500000",
        propertyDeductible: "500",
        biDays: "90",
        crime: true,
        crimeLimit: "100000",
        cyber: true,
        cyberLimit: "2000000",
        epli: true,
        epliLimit: "2000000",
        umbrella: true,
        umbrellaLimit: "5000000",
        endorsements: [
          "Equipment Breakdown",
          "Ordinance & Law",
          "Business Income Extra Expense",
          "Accounts Receivable",
          "Electronic Data Processing",
          "Spoilage Coverage",
        ],
        pricing: {
          annual_low: 0,
          annual_high: 0,
          monthly: 0,
          breakdown: { gl: 0, property: 0, cyber: 0, epli: 0, umbrella: 0, fees: 50, taxes: 0 },
        },
      },
    ])
  }


  const getPackageColor = (index: number) => {
    switch (index) {
      case 0:
        return "border-blue-200 bg-blue-50"
      case 1:
        return "border-accent/20 bg-accent/5"
      case 2:
        return "border-green-200 bg-green-50"
      default:
        return "border-border bg-card"
    }
  }

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">BrokerGenie | Package Builder</h1>
            <p className="text-muted-foreground mt-2">
              Configure three coverage packages with different protection levels and costs.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPricingDetails(!showPricingDetails)}
              className="bg-transparent"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {showPricingDetails ? "Hide" : "Show"} Pricing Details
            </Button>
            <Button variant="outline" onClick={resetToDefaults} className="bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <Card key={index} className={cn("shadow-sm", getPackageColor(index))}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{pkg.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                  </div>
                  {index === 1 && (
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      Recommended
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* General Liability */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="font-medium">General Liability</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Manufacturing operations → GL limits for liability protection</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={pkg.glLimits} onValueChange={(value) => updatePackage(index, "glLimits", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {glLimitOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Property */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="font-medium">Property TIV</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Total Insured Value from SOV analysis</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input value={formatCurrency(pkg.propertyTiv)} readOnly className="bg-muted/50" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="font-medium">Property Deductible</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Higher deductible → Lower premium with increased retention</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select
                      value={pkg.propertyDeductible}
                      onValueChange={(value) => updatePackage(index, "propertyDeductible", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyDeductibleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Business Interruption */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="font-medium">Business Interruption</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Manufacturing downtime → Extended BI coverage recommended</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={pkg.biDays} onValueChange={(value) => updatePackage(index, "biDays", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {biDaysOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Optional Coverages */}
                <div className="space-y-3">
                  <h4 className="font-medium">Optional Coverages</h4>

                  {/* Crime */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>Crime</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Employee theft and forgery protection</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch checked={pkg.crime} onCheckedChange={(checked) => updatePackage(index, "crime", checked)} />
                  </div>
                  {pkg.crime && (
                    <Input value={formatCurrency(pkg.crimeLimit)} readOnly className="bg-muted/50 text-sm" />
                  )}

                  {/* Cyber */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>Cyber Liability</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Manufacturing data systems → Cyber exposure protection</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch checked={pkg.cyber} onCheckedChange={(checked) => updatePackage(index, "cyber", checked)} />
                  </div>
                  {pkg.cyber && (
                    <Input value={formatCurrency(pkg.cyberLimit)} readOnly className="bg-muted/50 text-sm" />
                  )}

                  {/* EPLI */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>EPLI</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">15+ employees → Employment practices liability protection</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch checked={pkg.epli} onCheckedChange={(checked) => updatePackage(index, "epli", checked)} />
                  </div>
                  {pkg.epli && <Input value={formatCurrency(pkg.epliLimit)} readOnly className="bg-muted/50 text-sm" />}

                  {/* Umbrella */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>Umbrella</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Additional liability protection above primary limits</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      checked={pkg.umbrella}
                      onCheckedChange={(checked) => updatePackage(index, "umbrella", checked)}
                    />
                  </div>
                  {pkg.umbrella && (
                    <Input value={formatCurrency(pkg.umbrellaLimit)} readOnly className="bg-muted/50 text-sm" />
                  )}
                </div>

                {/* Endorsements */}
                <div>
                  <h4 className="font-medium mb-2">Key Endorsements</h4>
                  <div className="space-y-2">
                    {endorsementOptions.map((endorsement) => (
                      <div key={endorsement} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`${index}-${endorsement}`}
                          checked={pkg.endorsements.includes(endorsement)}
                          onChange={() => toggleEndorsement(index, endorsement)}
                          className="rounded border-border"
                        />
                        <Label htmlFor={`${index}-${endorsement}`} className="text-sm">
                          {endorsement}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coverage Summary */}
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">Coverage Summary</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>GL: {pkg.glLimits}</div>
                    <div>
                      Property: {formatCurrency(pkg.propertyTiv)} / ${pkg.propertyDeductible} ded
                    </div>
                    <div>BI: {pkg.biDays} days</div>
                    <div>
                      Optional:{" "}
                      {[pkg.crime && "Crime", pkg.cyber && "Cyber", pkg.epli && "EPLI", pkg.umbrella && "Umbrella"]
                        .filter(Boolean)
                        .join(", ") || "None"}
                    </div>
                    <div>Endorsements: {pkg.endorsements.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Global Pricing Controls */}
        {showPricingDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Global Pricing Adjustments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Prior coverage credit ($100)</Label>
                  <Switch
                    checked={credits.prior_coverage}
                    onCheckedChange={(checked) => setCredits((prev) => ({ ...prev, prior_coverage: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Risk control credit ($100)</Label>
                  <Switch
                    checked={credits.risk_control}
                    onCheckedChange={(checked) => setCredits((prev) => ({ ...prev, risk_control: checked }))}
                  />
                </div>
              </div>
              <div>
                <Label>Schedule adjustment (−10% … +10%)</Label>
                <div className="mt-2">
                  <Slider
                    value={scheduleAdjustment}
                    onValueChange={setScheduleAdjustment}
                    max={10}
                    min={-10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>-10%</span>
                    <span>{scheduleAdjustment[0]}%</span>
                    <span>+10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Results for Each Package */}
        {showPricingDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {packages.map((pkg, index) => {
              const badge = getPackageBadge(index)
              return (
                <Card key={`pricing-${index}`} className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{pkg.name} Pricing</CardTitle>
                        <Badge variant={badge.variant}>{badge.text}</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLockedPackage(lockedPackage === index ? null : index)}
                        className="bg-transparent"
                      >
                        {lockedPackage === index ? (
                          <>
                            <Unlock className="h-4 w-4 mr-1" />
                            Unlock
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-1" />
                            Lock
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Pricing Results */}
                    <div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(pkg.pricing.annual_low)} – {formatCurrency(pkg.pricing.annual_high)}
                      </div>
                      <div className="text-sm text-muted-foreground">Annual premium (range)</div>
                      <div className="text-lg font-semibold mt-1">{formatCurrency(pkg.pricing.monthly)}/mo</div>
                      <div className="text-sm text-muted-foreground">Approx. monthly</div>
                    </div>

                    {/* Breakdown Table */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Breakdown</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>GL</span>
                          <span>{formatCurrency(pkg.pricing.breakdown.gl)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Property</span>
                          <span>{formatCurrency(pkg.pricing.breakdown.property)}</span>
                        </div>
                        {pkg.cyber && (
                          <div className="flex justify-between">
                            <span>Cyber</span>
                            <span>{formatCurrency(pkg.pricing.breakdown.cyber)}</span>
                          </div>
                        )}
                        {pkg.epli && (
                          <div className="flex justify-between">
                            <span>EPLI</span>
                            <span>{formatCurrency(pkg.pricing.breakdown.epli)}</span>
                          </div>
                        )}
                        {pkg.umbrella && (
                          <div className="flex justify-between">
                            <span>Umbrella</span>
                            <span>{formatCurrency(pkg.pricing.breakdown.umbrella)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Fees</span>
                          <span>{formatCurrency(pkg.pricing.breakdown.fees)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxes</span>
                          <span>{formatCurrency(pkg.pricing.breakdown.taxes)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Explain Price */}
                    <Collapsible
                      open={expandedExplain === index}
                      onOpenChange={(open) => setExpandedExplain(open ? index : null)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-auto">
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 mr-1 transition-transform",
                              expandedExplain === index && "rotate-180",
                            )}
                          />
                          Explain price
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="text-xs text-muted-foreground mt-2 space-y-1">
                        <div>
                          Base rates: GL ${BASES.GL_base}, Property ${BASES.PROP_base}
                        </div>
                        <div>Class factor: 1.0, State factor: 1.0</div>
                        <div>TIV factor: {(Number.parseInt(pkg.propertyTiv) / 500000).toFixed(2)}</div>
                        <div>Deductible factor: {DEDUCTIBLE_FACTORS[Number.parseInt(pkg.propertyDeductible)]}</div>
                        <div>Schedule adjustment: {scheduleAdjustment[0]}%</div>
                        <div>Credits: {(credits.prior_coverage ? 100 : 0) + (credits.risk_control ? 100 : 0)}</div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Selected Package Summary */}
        {lockedPackage !== null && showPricingDetails && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Package: {packages[lockedPackage].name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(packages[lockedPackage].pricing.annual_low)} –{" "}
                      {formatCurrency(packages[lockedPackage].pricing.annual_high)}
                    </div>
                    <div className="text-sm text-muted-foreground">Annual range</div>
                    <div className="text-lg font-semibold mt-1">
                      {formatCurrency(packages[lockedPackage].pricing.monthly)}/mo
                    </div>
                    <div className="text-sm text-muted-foreground">Approx. monthly</div>
                  </div>

                  <div>
                    <div className="font-medium mb-2">Bindability Checklist</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Signed app</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Loss runs received</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-muted-foreground" />
                        <span>Sanctions screen</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-muted-foreground" />
                        <span>Payment method</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div>GL limits: {packages[lockedPackage].glLimits}</div>
                    <div>Property deductible: ${packages[lockedPackage].propertyDeductible}</div>
                    <div>
                      Umbrella:{" "}
                      {packages[lockedPackage].umbrella
                        ? formatCurrencyString(packages[lockedPackage].umbrellaLimit)
                        : "None"}
                    </div>
                    <div>
                      Endorsements:{" "}
                      {packages[lockedPackage].endorsements.length > 0
                        ? packages[lockedPackage].endorsements.join(", ")
                        : "None"}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLockedPackage(null)}
                      className="bg-transparent"
                    >
                      Unlock / Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        console.log("[v0] Next: Coverage Comparison button clicked")
                        onNext?.()
                      }}
                      disabled={lockedPackage === null}
                    >
                      Next: Coverage Comparison
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" className="bg-transparent">
            Back: Carrier Fit & Compliance
          </Button>
          <Button
            onClick={() => {
              console.log("[v0] Next: Coverage Comparison button clicked")
              onNext?.()
            }}
          >
            Next: Coverage Comparison
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
