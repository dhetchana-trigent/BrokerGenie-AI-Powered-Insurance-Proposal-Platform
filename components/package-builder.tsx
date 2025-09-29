"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle, RotateCcw } from "lucide-react"
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
    },
  ])

  const [editingPackage, setEditingPackage] = useState<number | null>(null)

  const updatePackage = (index: number, field: string, value: any) => {
    setPackages((prev) => prev.map((pkg, i) => (i === index ? { ...pkg, [field]: value } : pkg)))
  }

  const toggleEndorsement = (packageIndex: number, endorsement: string) => {
    setPackages((prev) =>
      prev.map((pkg, i) => {
        if (i === packageIndex) {
          const endorsements = pkg.endorsements.includes(endorsement)
            ? pkg.endorsements.filter((e) => e !== endorsement)
            : [...pkg.endorsements, endorsement]
          return { ...pkg, endorsements }
        }
        return pkg
      }),
    )
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
      },
    ])
  }

  const formatCurrency = (value: string) => {
    const num = Number.parseInt(value)
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    return `$${num.toLocaleString()}`
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
          <Button variant="outline" onClick={resetToDefaults} className="bg-transparent">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
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

        <div className="flex justify-between pt-6">
          <Button variant="outline" className="bg-transparent">
            Back: Carrier Fit & Compliance
          </Button>
          <Button
            onClick={() => {
              console.log("[v0] Next: Quote Options & Pricing button clicked")
              onNext?.()
            }}
          >
            Next: Quote Options & Pricing
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
