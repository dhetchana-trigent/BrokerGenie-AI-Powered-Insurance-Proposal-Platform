"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, AlertTriangle, Calendar, Shield, TrendingUp, CheckCircle, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface RiskFactor {
  icon: React.ElementType
  label: string
  value: string
  risk: "low" | "medium" | "high"
}

interface RecommendationDriver {
  factor: string
  impact: "positive" | "negative"
  description: string
}

interface UpsellSuggestion {
  coverage: string
  reason: string
  priority: "high" | "medium" | "low"
  selected: boolean
}

interface RiskProfileDashboardProps {
  onNext?: () => void
}

const riskFactors: RiskFactor[] = [
  {
    icon: Building2,
    label: "Business Type",
    value: "Manufacturing",
    risk: "medium",
  },
  {
    icon: MapPin,
    label: "States",
    value: "Single State (TX)",
    risk: "low",
  },
  {
    icon: AlertTriangle,
    label: "Loss History",
    value: "2 claims / 3 years",
    risk: "medium",
  },
  {
    icon: Calendar,
    label: "Years in Business",
    value: "15 years",
    risk: "low",
  },
  {
    icon: Shield,
    label: "Safety Controls",
    value: "Sprinklers, Security",
    risk: "low",
  },
]

const recommendationDrivers: RecommendationDriver[] = [
  {
    factor: "Low claims frequency",
    impact: "positive",
    description: "Only 2 claims in 3 years shows good risk management",
  },
  {
    factor: "Established business",
    impact: "positive",
    description: "15 years in operation demonstrates stability",
  },
  {
    factor: "Safety systems in place",
    impact: "positive",
    description: "Sprinkler and security systems reduce property risk",
  },
  {
    factor: "Manufacturing operations",
    impact: "negative",
    description: "Industrial operations present higher liability exposure",
  },
  {
    factor: "Equipment breakdown history",
    impact: "negative",
    description: "Recent equipment failure indicates maintenance risk",
  },
]

export function RiskProfileDashboard({ onNext }: RiskProfileDashboardProps) {
  const [recommendationStrength] = useState(78)
  const [upsellSuggestions, setUpsellSuggestions] = useState<UpsellSuggestion[]>([
    {
      coverage: "Cyber Liability",
      reason: "Manufacturing data systems exposure",
      priority: "high",
      selected: false,
    },
    {
      coverage: "EPLI",
      reason: "15+ employees require employment protection",
      priority: "high",
      selected: false,
    },
    {
      coverage: "Equipment Breakdown",
      reason: "Recent equipment failure history",
      priority: "high",
      selected: false,
    },
    {
      coverage: "Business Interruption",
      reason: "Manufacturing downtime exposure",
      priority: "medium",
      selected: false,
    },
    {
      coverage: "Umbrella",
      reason: "Additional liability protection recommended",
      priority: "medium",
      selected: false,
    },
    {
      coverage: "Flood",
      reason: "Houston location flood zone consideration",
      priority: "low",
      selected: false,
    },
  ])

  const getRiskColor = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
    }
  }

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "low":
        return "bg-blue-100 text-blue-700"
    }
  }

  const toggleUpsellSelection = (index: number) => {
    setUpsellSuggestions((prev) => prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item)))
  }

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return "text-green-600"
    if (strength >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getStrengthLabel = (strength: number) => {
    if (strength >= 80) return "Strong Recommendation"
    if (strength >= 60) return "Moderate Recommendation"
    return "Weak Recommendation"
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">BrokerGenie | Risk Profile</h1>
        <p className="text-muted-foreground mt-2">
          Analyze risk factors and generate coverage recommendations based on extracted data.
        </p>
      </div>

      {/* Risk Factor Chips */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Risk Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskFactors.map((factor, index) => (
              <div
                key={index}
                className={cn("flex items-center gap-3 p-4 rounded-lg border", getRiskColor(factor.risk))}
              >
                <factor.icon className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{factor.label}</p>
                  <p className="text-sm opacity-90">{factor.value}</p>
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {factor.risk}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Strength Gauge */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recommendation Strength</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted opacity-20"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(recommendationStrength / 100) * 314} 314`}
                  className={getStrengthColor(recommendationStrength)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={cn("text-2xl font-bold", getStrengthColor(recommendationStrength))}>
                    {recommendationStrength}
                  </div>
                  <div className="text-xs text-muted-foreground">out of 100</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className={cn("font-semibold", getStrengthColor(recommendationStrength))}>
                {getStrengthLabel(recommendationStrength)}
              </h3>
              <p className="text-sm text-muted-foreground">Based on risk analysis and market conditions</p>
            </div>
          </div>

          {/* Recommendation Drivers */}
          <div className="space-y-3">
            <h4 className="font-medium">Key Factors</h4>
            <div className="space-y-2">
              {recommendationDrivers.map((driver, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      driver.impact === "positive" ? "bg-green-500" : "bg-red-500",
                    )}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{driver.factor}</p>
                    <p className="text-xs text-muted-foreground">{driver.description}</p>
                  </div>
                  {driver.impact === "positive" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upsell Suggestions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Coverage Recommendations</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select additional coverage options to include in the package builder
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upsellSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                  suggestion.selected ? "border-accent bg-accent/5" : "border-border hover:bg-muted/50",
                )}
                onClick={() => toggleUpsellSelection(index)}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    suggestion.selected ? "border-accent bg-accent" : "border-muted-foreground",
                  )}
                >
                  {suggestion.selected ? (
                    <CheckCircle className="h-4 w-4 text-accent-foreground" />
                  ) : (
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{suggestion.coverage}</p>
                    <Badge variant="outline" className={cn("text-xs", getPriorityColor(suggestion.priority))}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span className="font-medium text-sm">
                {upsellSuggestions.filter((s) => s.selected).length} coverage options selected
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Selected options will be included in the package builder for detailed configuration.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" className="bg-transparent">
          Back: Extract with AI
        </Button>
        <Button onClick={onNext}>Next: Carrier Fit & Compliance</Button>
      </div>
    </div>
  )
}
