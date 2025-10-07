"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Download, Building2, Shield, DollarSign, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useExtraction } from "@/lib/extraction-context"

interface PackageData {
  name: string
  badge: string
  glLimits: string
  propertyTiv: number
  propertyDeductible: number
  umbrella: number
  endorsements: {
    cyber: boolean
    epli: boolean
    ordLaw: boolean
    equipBreakdown: boolean
    flood: boolean
  }
  compliance: "eligible" | "conditional" | "excluded"
  annualLow: number
  annualHigh: number
  monthly: number
  notes: string
}

interface CoverageComparisonProps {
  onNext?: () => void
  onBack?: () => void
  selectedPackageData?: any
}

export function CoverageComparison({ onNext, onBack, selectedPackageData }: CoverageComparisonProps) {
  const { getBusinessType, getTotalInsuredValue, getStates, getLossHistory, getYearsInBusiness, getSafetyControls } = useExtraction()
  const [selectedPackage, setSelectedPackage] = useState<string>("balanced")

  // Set the selected package based on data from Package Builder
  useEffect(() => {
    if (selectedPackageData) {
      setSelectedPackage(selectedPackageData.id)
    }
  }, [selectedPackageData])

  // Generate dynamic package data based on business profile
  const generateDynamicPackages = (): Record<string, PackageData> => {
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
    
    // Risk adjustments
    const riskMultiplier = isHighRisk ? 1.3 : (isEstablished && hasGoodSafety ? 0.9 : 1.0)
    
    // Base premiums
    const baseGL = 2500
    const baseProperty = Math.max(2000, Math.min(8000, tivValue * 0.002))
    const baseCyber = 1200
    const baseEPLI = 800
    const baseUmbrella = 1500

    // If we have selected package data from Package Builder, use those values for consistency
    const useSelectedData = selectedPackageData && selectedPackageData.coverageLines

    return {
      essential: {
        name: "Essential",
        badge: "Meets minimums",
        glLimits: useSelectedData && selectedPackageData.id === "essential" 
          ? selectedPackageData.coverageLines.find((line: any) => line.id === "gl")?.limit || "$1M / $2M"
          : "$1M / $2M",
        propertyTiv: tivValue,
        propertyDeductible: 1000,
        umbrella: 0,
        endorsements: {
          cyber: useSelectedData && selectedPackageData.id === "essential" 
            ? selectedPackageData.coverageLines.find((line: any) => line.id === "cyber")?.included || false
            : false,
          epli: useSelectedData && selectedPackageData.id === "essential" 
            ? selectedPackageData.coverageLines.find((line: any) => line.id === "epli")?.included || false
            : false,
          ordLaw: false,
          equipBreakdown: true,
          flood: false,
        },
        compliance: "eligible",
        annualLow: useSelectedData && selectedPackageData.id === "essential"
          ? Math.round(selectedPackageData.totalPremium * 0.9)
          : Math.round((baseGL + baseProperty) * riskMultiplier * 0.9),
        annualHigh: useSelectedData && selectedPackageData.id === "essential"
          ? Math.round(selectedPackageData.totalPremium * 1.1)
          : Math.round((baseGL + baseProperty) * riskMultiplier * 1.1),
        monthly: useSelectedData && selectedPackageData.id === "essential"
          ? selectedPackageData.monthlyPremium
          : Math.round((baseGL + baseProperty) * riskMultiplier / 12),
        notes: "Basic coverage meets state minimums",
      },
      balanced: {
        name: "Balanced",
        badge: "Most Popular",
        glLimits: useSelectedData && selectedPackageData.id === "balanced" 
          ? selectedPackageData.coverageLines.find((line: any) => line.id === "gl")?.limit || "$2M / $4M"
          : "$2M / $4M",
        propertyTiv: tivValue,
        propertyDeductible: 1000,
        umbrella: 1000000,
        endorsements: {
          cyber: useSelectedData && selectedPackageData.id === "balanced" 
            ? selectedPackageData.coverageLines.find((line: any) => line.id === "cyber")?.included || true
            : true,
          epli: useSelectedData && selectedPackageData.id === "balanced" 
            ? selectedPackageData.coverageLines.find((line: any) => line.id === "epli")?.included || true
            : true,
          ordLaw: true,
          equipBreakdown: true,
          flood: false,
        },
        compliance: "eligible",
        annualLow: useSelectedData && selectedPackageData.id === "balanced"
          ? Math.round(selectedPackageData.totalPremium * 0.9)
          : Math.round((baseGL * 1.2 + baseProperty + baseCyber + baseEPLI + baseUmbrella) * riskMultiplier * 0.9),
        annualHigh: useSelectedData && selectedPackageData.id === "balanced"
          ? Math.round(selectedPackageData.totalPremium * 1.1)
          : Math.round((baseGL * 1.2 + baseProperty + baseCyber + baseEPLI + baseUmbrella) * riskMultiplier * 1.1),
        monthly: useSelectedData && selectedPackageData.id === "balanced"
          ? selectedPackageData.monthlyPremium
          : Math.round((baseGL * 1.2 + baseProperty + baseCyber + baseEPLI + baseUmbrella) * riskMultiplier / 12),
        notes: "Comprehensive coverage with essential endorsements",
      },
      comprehensive: {
        name: "Comprehensive",
        badge: "Premium",
        glLimits: useSelectedData && selectedPackageData.id === "comprehensive" 
          ? selectedPackageData.coverageLines.find((line: any) => line.id === "gl")?.limit || "$5M / $10M"
          : "$5M / $10M",
        propertyTiv: tivValue,
        propertyDeductible: 500,
        umbrella: 5000000,
        endorsements: {
          cyber: useSelectedData && selectedPackageData.id === "comprehensive" 
            ? selectedPackageData.coverageLines.find((line: any) => line.id === "cyber")?.included || true
            : true,
          epli: useSelectedData && selectedPackageData.id === "comprehensive" 
            ? selectedPackageData.coverageLines.find((line: any) => line.id === "epli")?.included || true
            : true,
          ordLaw: true,
          equipBreakdown: true,
          flood: true,
        },
        compliance: isHighRisk ? "conditional" : "eligible",
        annualLow: useSelectedData && selectedPackageData.id === "comprehensive"
          ? Math.round(selectedPackageData.totalPremium * 0.9)
          : Math.round((baseGL * 1.5 + baseProperty * 1.1 + baseCyber * 1.5 + baseEPLI * 1.3 + baseUmbrella * 2) * riskMultiplier * 0.9),
        annualHigh: useSelectedData && selectedPackageData.id === "comprehensive"
          ? Math.round(selectedPackageData.totalPremium * 1.1)
          : Math.round((baseGL * 1.5 + baseProperty * 1.1 + baseCyber * 1.5 + baseEPLI * 1.3 + baseUmbrella * 2) * riskMultiplier * 1.1),
        monthly: useSelectedData && selectedPackageData.id === "comprehensive"
          ? selectedPackageData.monthlyPremium
          : Math.round((baseGL * 1.5 + baseProperty * 1.1 + baseCyber * 1.5 + baseEPLI * 1.3 + baseUmbrella * 2) * riskMultiplier / 12),
        notes: "Maximum protection with premium endorsements",
      },
    }
  }

  const packages = generateDynamicPackages()

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case "eligible":
        return "bg-green-100 text-green-700"
      case "conditional":
        return "bg-yellow-100 text-yellow-700"
      case "excluded":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getComplianceLabel = (compliance: string) => {
    switch (compliance) {
      case "eligible":
        return "Meets compliance"
      case "conditional":
        return "Conditional"
      case "excluded":
        return "Excluded"
      default:
        return "Unknown"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatUmbrella = (amount: number) => {
    if (amount === 0) return "None"
    return `$${amount / 1000000}M`
  }

  const generateClientSummaryBullets = () => {
    const bullets = [
      `Business: ${getBusinessType()}`,
      `Location: ${getStates()}`,
      `Years in Business: ${getYearsInBusiness()}`,
      `Total Insured Value: ${getTotalInsuredValue()}`,
      `Loss History: ${getLossHistory()}`,
      `Safety Controls: ${getSafetyControls()}`,
    ]

    return bullets
  }

  const generateSummaryBullets = () => {
    const selected = packages[selectedPackage]
    const bullets = []

    // Compare with Essential to highlight differences
    if (selectedPackage === "balanced") {
      bullets.push("Adds Cyber and EPLI for data/privacy and HR claims.")
      bullets.push("Includes $1M Umbrella for additional liability protection.")
      bullets.push("Ordinance & Law coverage for building code upgrades.")
    } else if (selectedPackage === "comprehensive") {
      bullets.push("Higher umbrella and lower deductible for better protection.")
      bullets.push("Enhanced GL limits ($5M/$10M) for manufacturing operations.")
      bullets.push("Flood sub-limit included for weather-related exposures.")
    } else {
      bullets.push("Basic coverage package meeting minimum requirements.")
      bullets.push("Equipment Breakdown included for manufacturing operations.")
    }

    bullets.push("Meets state minimums across GL/Property.")
    bullets.push(`${selected.name}: ${selected.notes}`)

    return bullets
  }

  const exportToCSV = () => {
    const headers = ["Field", "Essential", "Balanced", "Comprehensive"]
    const rows = [
      ["GL Limits", packages.essential.glLimits, packages.balanced.glLimits, packages.comprehensive.glLimits],
      [
        "Property TIV",
        formatCurrency(packages.essential.propertyTiv),
        formatCurrency(packages.balanced.propertyTiv),
        formatCurrency(packages.comprehensive.propertyTiv),
      ],
      [
        "Property Deductible",
        formatCurrency(packages.essential.propertyDeductible),
        formatCurrency(packages.balanced.propertyDeductible),
        formatCurrency(packages.comprehensive.propertyDeductible),
      ],
      [
        "Umbrella",
        formatUmbrella(packages.essential.umbrella),
        formatUmbrella(packages.balanced.umbrella),
        formatUmbrella(packages.comprehensive.umbrella),
      ],
      [
        "Cyber",
        packages.essential.endorsements.cyber ? "Yes" : "No",
        packages.balanced.endorsements.cyber ? "Yes" : "No",
        packages.comprehensive.endorsements.cyber ? "Yes" : "No",
      ],
      [
        "EPLI",
        packages.essential.endorsements.epli ? "Yes" : "No",
        packages.balanced.endorsements.epli ? "Yes" : "No",
        packages.comprehensive.endorsements.epli ? "Yes" : "No",
      ],
      [
        "Ord&Law",
        packages.essential.endorsements.ordLaw ? "Yes" : "No",
        packages.balanced.endorsements.ordLaw ? "Yes" : "No",
        packages.comprehensive.endorsements.ordLaw ? "Yes" : "No",
      ],
      [
        "Equip Breakdown",
        packages.essential.endorsements.equipBreakdown ? "Yes" : "No",
        packages.balanced.endorsements.equipBreakdown ? "Yes" : "No",
        packages.comprehensive.endorsements.equipBreakdown ? "Yes" : "No",
      ],
      [
        "Flood",
        packages.essential.endorsements.flood ? "Yes" : "No",
        packages.balanced.endorsements.flood ? "Yes" : "No",
        packages.comprehensive.endorsements.flood ? "Yes" : "No",
      ],
      [
        "Compliance",
        getComplianceLabel(packages.essential.compliance),
        getComplianceLabel(packages.balanced.compliance),
        getComplianceLabel(packages.comprehensive.compliance),
      ],
      [
        "Annual Range",
        `${formatCurrency(packages.essential.annualLow)} - ${formatCurrency(packages.essential.annualHigh)}`,
        `${formatCurrency(packages.balanced.annualLow)} - ${formatCurrency(packages.balanced.annualHigh)}`,
        `${formatCurrency(packages.comprehensive.annualLow)} - ${formatCurrency(packages.comprehensive.annualHigh)}`,
      ],
      [
        "Monthly",
        formatCurrency(packages.essential.monthly),
        formatCurrency(packages.balanced.monthly),
        formatCurrency(packages.comprehensive.monthly),
      ],
    ]

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "coverage-comparison.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">BrokerGenie | Coverage Comparison</h1>
        <p className="text-muted-foreground">
          Compare options and send a client-ready proposal in minutes
        </p>
      </div>

      <div className="flex gap-6">
        {/* Left Column - Comparison Table */}
        <div className="flex-[2] space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Coverage Comparison</h2>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Coverage</th>
                      {Object.entries(packages).map(([key, pkg]) => (
                        <th key={key} className="text-center p-4 min-w-[200px]">
                          <div className="space-y-2">
                            <div className="font-semibold">{pkg.name}</div>
                            <Badge variant="outline" className="text-xs">
                              {pkg.badge}
                            </Badge>
                            {selectedPackage === key && (
                              <Badge variant="default" className="text-xs bg-accent text-accent-foreground">
                                Selected
                              </Badge>
                            )}
                            <div className="mt-3">
                              <RadioGroup
                                value={selectedPackage}
                                onValueChange={setSelectedPackage}
                                className="flex justify-center"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value={key} id={`select-${key}`} />
                                  <Label htmlFor={`select-${key}`} className="text-xs">
                                    Select this package
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">GL limits</td>
                      {Object.values(packages).map((pkg, index) => (
                        <td key={index} className="p-4 text-center">
                          {pkg.glLimits}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Property — Limit (TIV)</td>
                      {Object.values(packages).map((pkg, index) => (
                        <td key={index} className="p-4 text-center">
                          {formatCurrency(pkg.propertyTiv)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Property — Deductible</td>
                      {Object.values(packages).map((pkg, index) => (
                        <td key={index} className="p-4 text-center">
                          {formatCurrency(pkg.propertyDeductible)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Umbrella</td>
                      {Object.values(packages).map((pkg, index) => (
                        <td key={index} className="p-4 text-center">
                          {formatUmbrella(pkg.umbrella)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Annual premium (range)</td>
                      {Object.values(packages).map((pkg, index) => (
                        <td key={index} className="p-4 text-center font-semibold">
                          {formatCurrency(pkg.annualLow)} – {formatCurrency(pkg.annualHigh)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Approx. monthly</td>
                      {Object.values(packages).map((pkg, index) => (
                        <td key={index} className="p-4 text-center">
                          {formatCurrency(pkg.monthly)}/mo
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Notes</td>
                      {Object.values(packages).map((pkg, index) => (
                        <td key={index} className="p-4 text-center text-sm text-muted-foreground">
                          {pkg.notes}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Client Summary & Actions (Sticky) */}
        <div className="flex-1 space-y-4 sticky top-6 self-start">
          {/* Client Summary */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {generateClientSummaryBullets().map((bullet, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t text-xs text-muted-foreground">
                All premiums shown are indicative ranges. Final terms subject to underwriting and binding.
              </div>
            </CardContent>
          </Card>

          {/* Selected Package */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Selected Package</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-semibold text-lg">Selected: {packages[selectedPackage].name}</div>
                <div className="text-sm text-muted-foreground mt-1">{packages[selectedPackage].badge}</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>GL Limits:</span>
                  <span className="font-medium">{packages[selectedPackage].glLimits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Property TIV:</span>
                  <span className="font-medium">{formatCurrency(packages[selectedPackage].propertyTiv)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Property Deductible:</span>
                  <span className="font-medium">{formatCurrency(packages[selectedPackage].propertyDeductible)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Umbrella:</span>
                  <span className="font-medium">{formatUmbrella(packages[selectedPackage].umbrella)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Endorsements:</span>
                  <span className="font-medium">
                    {Object.values(packages[selectedPackage].endorsements).filter(Boolean).length} active
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-lg font-semibold">
                  {formatCurrency(packages[selectedPackage].annualLow)} –{" "}
                  {formatCurrency(packages[selectedPackage].annualHigh)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(packages[selectedPackage].monthly)}/month
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  onClick={() => {
                    console.log("[v0] Generate Proposal button clicked")
                    onNext?.()
                  }}
                  className="w-full"
                >
                  Generate Proposal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("[v0] Back to Pricing button clicked")
                    onBack?.()
                  }}
                  className="w-full bg-transparent"
                >
                  Back to Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
