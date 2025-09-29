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
import { ChevronDown, Lock, Unlock, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PackageData {
  selectedPackage: string
  gl_limits: string
  property: {
    tiv: number
    deductible: number
  }
  umbrella: number
  endorsements: {
    cyber: boolean
    epli: boolean
    ord_law: boolean
    equip_breakdown: boolean
    flood: boolean
  }
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

interface QuoteOptionsPricingProps {
  onNext?: () => void
}

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

export function QuoteOptionsPricing({ onNext }: QuoteOptionsPricingProps) {
  const [packages, setPackages] = useState<Record<string, PackageData>>({
    Essential: {
      selectedPackage: "Essential",
      gl_limits: "1M/2M",
      property: { tiv: 2500000, deductible: 1000 },
      umbrella: 0,
      endorsements: { cyber: false, epli: false, ord_law: false, equip_breakdown: true, flood: false },
      pricing: {
        annual_low: 0,
        annual_high: 0,
        monthly: 0,
        breakdown: { gl: 0, property: 0, cyber: 0, epli: 0, umbrella: 0, fees: 50, taxes: 0 },
      },
    },
    Balanced: {
      selectedPackage: "Balanced",
      gl_limits: "1M/2M",
      property: { tiv: 2500000, deductible: 1000 },
      umbrella: 1000000,
      endorsements: { cyber: true, epli: true, ord_law: true, equip_breakdown: true, flood: false },
      pricing: {
        annual_low: 0,
        annual_high: 0,
        monthly: 0,
        breakdown: { gl: 0, property: 0, cyber: 0, epli: 0, umbrella: 0, fees: 50, taxes: 0 },
      },
    },
    Comprehensive: {
      selectedPackage: "Comprehensive",
      gl_limits: "2M/4M",
      property: { tiv: 2500000, deductible: 500 },
      umbrella: 5000000,
      endorsements: { cyber: true, epli: true, ord_law: true, equip_breakdown: true, flood: true },
      pricing: {
        annual_low: 0,
        annual_high: 0,
        monthly: 0,
        breakdown: { gl: 0, property: 0, cyber: 0, epli: 0, umbrella: 0, fees: 50, taxes: 0 },
      },
    },
  })

  const [credits, setCredits] = useState({
    prior_coverage: false,
    risk_control: false,
  })

  const [scheduleAdjustment, setScheduleAdjustment] = useState([0])
  const [lockedPackage, setLockedPackage] = useState<string | null>(null)
  const [expandedExplain, setExpandedExplain] = useState<string | null>(null)

  // Calculate pricing for a package
  const calculatePricing = (packageName: string, packageData: PackageData) => {
    const classIndex = 1 // Default to middle class factor
    const stateIndex = 1 // Default to middle state factor

    const gl_class = CLASS_FACTORS[classIndex] || 1.0
    const gl_state = STATE_FACTORS[stateIndex] || 1.0
    const prop_class = CLASS_FACTORS[classIndex] || 1.0
    const prop_state = STATE_FACTORS[stateIndex] || 1.0

    const tiv_factor = Math.max(0.6, Math.min(2.0, packageData.property.tiv / 500000))
    const deductible_factor = DEDUCTIBLE_FACTORS[packageData.property.deductible] || 1.0
    const umbrella_factor = UMBRELLA_FACTORS[packageData.umbrella] || 0

    // Calculate base premiums
    const gl_premium = BASES.GL_base * gl_class * gl_state
    const prop_premium =
      packageData.property.tiv > 0 ? BASES.PROP_base * prop_class * prop_state * tiv_factor * deductible_factor : 0
    const cyber_premium = packageData.endorsements.cyber ? BASES.CYBER_base : 0
    const epli_premium = packageData.endorsements.epli ? BASES.EPLI_base : 0
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
    const updatedPackages = { ...packages }
    Object.keys(updatedPackages).forEach((packageName) => {
      updatedPackages[packageName].pricing = calculatePricing(packageName, updatedPackages[packageName])
    })
    setPackages(updatedPackages)
  }, [credits, scheduleAdjustment])

  const updatePackage = (packageName: string, updates: Partial<PackageData>) => {
    setPackages((prev) => {
      const updated = {
        ...prev,
        [packageName]: { ...prev[packageName], ...updates },
      }
      // Recalculate pricing for this package
      updated[packageName].pricing = calculatePricing(packageName, updated[packageName])
      return updated
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getPackageBadge = (packageName: string) => {
    switch (packageName) {
      case "Essential":
        return { text: "Meets minimums", variant: "secondary" as const }
      case "Balanced":
        return { text: "Recommended", variant: "default" as const }
      case "Comprehensive":
        return { text: "Enhanced protection", variant: "secondary" as const }
      default:
        return { text: "", variant: "secondary" as const }
    }
  }

  const getRecommendationText = (packageName: string, packageData: PackageData) => {
    const deductible = formatCurrency(packageData.property.deductible)
    const cyber = packageData.endorsements.cyber ? "Cyber recommended" : "Basic coverage"
    const range = `${formatCurrency(packageData.pricing.annual_low)}–${formatCurrency(packageData.pricing.annual_high)}`
    const monthly = formatCurrency(packageData.pricing.monthly)

    return `${packageName} with ${deductible} property deductible and ${cyber}; expected annual ${range}, ${monthly}/mo.`
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Package Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">BrokerGenie | Quote Options & Pricing</h1>
            <p className="text-muted-foreground mt-2">
              Explore different quote options and pricing. All premiums shown are indicative ranges.
            </p>
          </div>

          {/* Global Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Global Adjustments</CardTitle>
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

          {/* Package Cards */}
          {Object.entries(packages).map(([packageName, packageData]) => {
            const badge = getPackageBadge(packageName)
            return (
              <Card key={packageName} className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{packageName}</CardTitle>
                      <Badge variant={badge.variant}>{badge.text}</Badge>
                      <Badge variant="outline" className="bg-transparent">
                        Fit
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* General Liability */}
                    <div>
                      <Label className="font-medium">General Liability limits</Label>
                      <Select
                        value={packageData.gl_limits}
                        onValueChange={(value) => updatePackage(packageName, { gl_limits: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1M/2M">$1M / $2M</SelectItem>
                          <SelectItem value="2M/4M">$2M / $4M</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Property TIV */}
                    <div>
                      <Label className="font-medium">Property Limit (TIV)</Label>
                      <Input
                        type="number"
                        value={packageData.property.tiv}
                        onChange={(e) =>
                          updatePackage(packageName, {
                            property: { ...packageData.property, tiv: Number.parseInt(e.target.value) || 0 },
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    {/* Property Deductible */}
                    <div>
                      <Label className="font-medium">Property Deductible</Label>
                      <div className="mt-2">
                        <Slider
                          value={[packageData.property.deductible]}
                          onValueChange={([value]) =>
                            updatePackage(packageName, {
                              property: { ...packageData.property, deductible: value },
                            })
                          }
                          max={5000}
                          min={500}
                          step={500}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>$500</span>
                          <span>{formatCurrency(packageData.property.deductible)}</span>
                          <span>$5,000</span>
                        </div>
                      </div>
                    </div>

                    {/* Umbrella */}
                    <div>
                      <Label className="font-medium">Umbrella</Label>
                      <Select
                        value={packageData.umbrella.toString()}
                        onValueChange={(value) => updatePackage(packageName, { umbrella: Number.parseInt(value) })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          <SelectItem value="1000000">$1M</SelectItem>
                          <SelectItem value="2000000">$2M</SelectItem>
                          <SelectItem value="3000000">$3M</SelectItem>
                          <SelectItem value="5000000">$5M</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Endorsements */}
                  <div>
                    <Label className="font-medium">Endorsements</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {Object.entries(packageData.endorsements).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="text-sm capitalize">{key.replace("_", " ")}</Label>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) =>
                              updatePackage(packageName, {
                                endorsements: { ...packageData.endorsements, [key]: checked },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Results */}
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(packageData.pricing.annual_low)} –{" "}
                        {formatCurrency(packageData.pricing.annual_high)}
                      </div>
                      <div className="text-sm text-muted-foreground">Annual premium (range)</div>
                      <div className="text-lg font-semibold mt-1">{formatCurrency(packageData.pricing.monthly)}/mo</div>
                      <div className="text-sm text-muted-foreground">Approx. monthly</div>
                    </div>

                    {/* Breakdown Table */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Breakdown</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>GL</span>
                          <span>{formatCurrency(packageData.pricing.breakdown.gl)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Property</span>
                          <span>{formatCurrency(packageData.pricing.breakdown.property)}</span>
                        </div>
                        {packageData.endorsements.cyber && (
                          <div className="flex justify-between">
                            <span>Cyber</span>
                            <span>{formatCurrency(packageData.pricing.breakdown.cyber)}</span>
                          </div>
                        )}
                        {packageData.endorsements.epli && (
                          <div className="flex justify-between">
                            <span>EPLI</span>
                            <span>{formatCurrency(packageData.pricing.breakdown.epli)}</span>
                          </div>
                        )}
                        {packageData.umbrella > 0 && (
                          <div className="flex justify-between">
                            <span>Umbrella</span>
                            <span>{formatCurrency(packageData.pricing.breakdown.umbrella)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Fees</span>
                          <span>{formatCurrency(packageData.pricing.breakdown.fees)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxes</span>
                          <span>{formatCurrency(packageData.pricing.breakdown.taxes)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="text-sm text-muted-foreground">
                      {getRecommendationText(packageName, packageData)}
                    </div>

                    {/* Explain Price */}
                    <Collapsible
                      open={expandedExplain === packageName}
                      onOpenChange={(open) => setExpandedExplain(open ? packageName : null)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-auto">
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 mr-1 transition-transform",
                              expandedExplain === packageName && "rotate-180",
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
                        <div>TIV factor: {(packageData.property.tiv / 500000).toFixed(2)}</div>
                        <div>Deductible factor: {DEDUCTIBLE_FACTORS[packageData.property.deductible]}</div>
                        <div>Schedule adjustment: {scheduleAdjustment[0]}%</div>
                        <div>Credits: {(credits.prior_coverage ? 100 : 0) + (credits.risk_control ? 100 : 0)}</div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLockedPackage(lockedPackage === packageName ? null : packageName)}
                        className="bg-transparent"
                      >
                        {lockedPackage === packageName ? (
                          <>
                            <Unlock className="h-4 w-4 mr-1" />
                            Unlock
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-1" />
                            Lock This Package
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Right Column - Selection Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>Selected Package</CardTitle>
              </CardHeader>
              <CardContent>
                {!lockedPackage ? (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">Lock a package to continue.</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{lockedPackage}</span>
                      <Badge variant={getPackageBadge(lockedPackage).variant}>
                        {getPackageBadge(lockedPackage).text}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>GL limits: {packages[lockedPackage].gl_limits}</div>
                      <div>Property deductible: {formatCurrency(packages[lockedPackage].property.deductible)}</div>
                      <div>
                        Umbrella:{" "}
                        {packages[lockedPackage].umbrella > 0
                          ? formatCurrency(packages[lockedPackage].umbrella)
                          : "None"}
                      </div>
                      <div>
                        Endorsements:{" "}
                        {Object.entries(packages[lockedPackage].endorsements)
                          .filter(([_, value]) => value)
                          .map(([key, _]) => key.replace("_", " "))
                          .join(", ") || "None"}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="text-lg font-bold">
                        {formatCurrency(packages[lockedPackage].pricing.annual_low)} –{" "}
                        {formatCurrency(packages[lockedPackage].pricing.annual_high)}
                      </div>
                      <div className="text-sm text-muted-foreground">Annual range</div>
                      <div className="font-semibold">{formatCurrency(packages[lockedPackage].pricing.monthly)}/mo</div>
                      <div className="text-sm text-muted-foreground">Approx. monthly</div>
                    </div>

                    <Separator />

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
                        disabled={!lockedPackage}
                      >
                        Next: Coverage Comparison
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        All premiums shown are indicative ranges. Final terms subject to underwriting and binding.
      </div>
    </div>
  )
}
