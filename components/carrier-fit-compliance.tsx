"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, XCircle, Building2, MapPin, DollarSign, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface CarrierAppetite {
  name: string
  logo: string
  fit: "fit" | "conditional" | "not-fit"
  reason: string
  strengths: string[]
  concerns: string[]
}

interface ComplianceRequirement {
  line: string
  requirement: string
  status: "met" | "conditional" | "not-met"
  details: string
}

interface LineOutcome {
  line: string
  status: "eligible" | "conditional" | "excluded"
  rationale: string
  icon: React.ElementType
}

interface CarrierFitComplianceProps {
  onNext?: () => void
}

const carrierAppetites: CarrierAppetite[] = [
  {
    name: "Liberty Mutual",
    logo: "LM",
    fit: "fit",
    reason: "Strong appetite for manufacturing in Texas",
    strengths: ["Manufacturing class expertise", "Texas market presence", "TIV capacity up to $5M"],
    concerns: [],
  },
  {
    name: "Travelers",
    logo: "TR",
    fit: "fit",
    reason: "Excellent fit for established manufacturers",
    strengths: ["15+ years experience preferred", "Equipment breakdown coverage", "Loss control services"],
    concerns: [],
  },
  {
    name: "Hartford",
    logo: "HT",
    fit: "conditional",
    reason: "TIV near automatic binding limit",
    strengths: ["Competitive GL rates", "Strong cyber offerings"],
    concerns: ["$2.5M TIV requires underwriter review", "Recent equipment breakdown claim"],
  },
  {
    name: "Zurich",
    logo: "ZU",
    fit: "conditional",
    reason: "Class allowed but requires loss control",
    strengths: ["Large account capabilities", "Risk engineering services"],
    concerns: ["Requires safety inspection", "Higher minimum premiums"],
  },
  {
    name: "AIG",
    logo: "AI",
    fit: "not-fit",
    reason: "Manufacturing moratorium in Texas",
    strengths: [],
    concerns: ["Current underwriting restrictions", "Geographic limitations"],
  },
  {
    name: "Chubb",
    logo: "CH",
    fit: "not-fit",
    reason: "TIV exceeds appetite for this class",
    strengths: ["Premium account focus"],
    concerns: ["$2.5M TIV too high for manufacturing", "Minimum revenue requirements not met"],
  },
]

const complianceRequirements: ComplianceRequirement[] = [
  {
    line: "General Liability",
    requirement: "Texas minimum: $300K per occurrence",
    status: "met",
    details: "Requested $1M/$2M exceeds state minimums",
  },
  {
    line: "General Liability",
    requirement: "Products liability coverage required",
    status: "met",
    details: "Manufacturing operations require products coverage",
  },
  {
    line: "Property",
    requirement: "Replacement cost valuation",
    status: "met",
    details: "SOV shows replacement cost basis",
  },
  {
    line: "Property",
    requirement: "Minimum $1,000 deductible",
    status: "conditional",
    details: "Client requested $500 deductible - may need adjustment",
  },
  {
    line: "Workers Compensation",
    requirement: "Texas coverage required for 15+ employees",
    status: "met",
    details: "Manufacturing operations with 15+ employees",
  },
  {
    line: "Auto",
    requirement: "Commercial auto if business vehicles",
    status: "conditional",
    details: "Need to verify vehicle usage and ownership",
  },
]

const lineOutcomes: LineOutcome[] = [
  {
    line: "General Liability",
    status: "eligible",
    rationale: "Standard manufacturing class with good loss history",
    icon: CheckCircle,
  },
  {
    line: "Property",
    status: "conditional",
    rationale: "TIV requires underwriter approval at some carriers",
    icon: AlertCircle,
  },
  {
    line: "Workers Compensation",
    status: "eligible",
    rationale: "Standard coverage for manufacturing operations",
    icon: CheckCircle,
  },
  {
    line: "Cyber Liability",
    status: "conditional",
    rationale: "Manufacturing data exposure requires risk assessment",
    icon: AlertCircle,
  },
  {
    line: "EPLI",
    status: "eligible",
    rationale: "Standard coverage for 15+ employee operations",
    icon: CheckCircle,
  },
  {
    line: "Equipment Breakdown",
    status: "conditional",
    rationale: "Recent claim history may impact terms",
    icon: AlertCircle,
  },
]

export function CarrierFitCompliance({ onNext }: CarrierFitComplianceProps) {
  const getFitColor = (fit: "fit" | "conditional" | "not-fit") => {
    switch (fit) {
      case "fit":
        return "bg-green-100 text-green-700 border-green-200"
      case "conditional":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "not-fit":
        return "bg-red-100 text-red-700 border-red-200"
    }
  }

  const getFitIcon = (fit: "fit" | "conditional" | "not-fit") => {
    switch (fit) {
      case "fit":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "conditional":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "not-fit":
        return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusColor = (status: "met" | "conditional" | "not-met" | "eligible" | "excluded") => {
    switch (status) {
      case "met":
      case "eligible":
        return "bg-green-100 text-green-700"
      case "conditional":
        return "bg-yellow-100 text-yellow-700"
      case "not-met":
      case "excluded":
        return "bg-red-100 text-red-700"
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">BrokerGenie | Carrier Fit & Compliance</h1>
        <p className="text-muted-foreground mt-2">
          Evaluate carrier appetite and ensure state compliance requirements are met.
        </p>
      </div>

      {/* Carrier Appetite Cards */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Carrier Appetite Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">Based on business class, geography, TIV, and loss history</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {carrierAppetites.map((carrier, index) => (
              <div key={index} className={cn("p-4 rounded-lg border", getFitColor(carrier.fit))}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <span className="font-bold text-xs text-gray-700">{carrier.logo}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{carrier.name}</h3>
                      <Badge variant="outline" className="text-xs capitalize mt-1">
                        {carrier.fit === "not-fit" ? "Not a Fit" : carrier.fit}
                      </Badge>
                    </div>
                  </div>
                  {getFitIcon(carrier.fit)}
                </div>

                <p className="text-sm mb-3">{carrier.reason}</p>

                {carrier.strengths.length > 0 && (
                  <div className="mb-2">
                    <p className="font-medium text-xs mb-1">Strengths:</p>
                    <ul className="space-y-1">
                      {carrier.strengths.map((strength, i) => (
                        <li key={i} className="text-xs flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {carrier.concerns.length > 0 && (
                  <div>
                    <p className="font-medium text-xs mb-1">Concerns:</p>
                    <ul className="space-y-1">
                      {carrier.concerns.map((concern, i) => (
                        <li key={i} className="text-xs flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* State Compliance Checklist */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>State Compliance Checklist</CardTitle>
          <p className="text-sm text-muted-foreground">Texas regulatory requirements by coverage line</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceRequirements.map((req, index) => (
              <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                <div className="flex-shrink-0">
                  {req.status === "met" && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {req.status === "conditional" && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                  {req.status === "not-met" && <XCircle className="h-5 w-5 text-red-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {req.line}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs", getStatusColor(req.status))}>
                      {req.status === "met" ? "Met" : req.status === "conditional" ? "Conditional" : "Not Met"}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm">{req.requirement}</p>
                  <p className="text-xs text-muted-foreground mt-1">{req.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Line Outcomes */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Coverage Line Outcomes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Eligibility status by coverage line based on carrier appetite and compliance
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lineOutcomes.map((outcome, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <outcome.icon
                  className={cn(
                    "h-6 w-6",
                    outcome.status === "eligible"
                      ? "text-green-600"
                      : outcome.status === "conditional"
                        ? "text-yellow-600"
                        : "text-red-600",
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{outcome.line}</h3>
                    <Badge variant="outline" className={cn("text-xs capitalize", getStatusColor(outcome.status))}>
                      {outcome.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{outcome.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Banner */}
      <Card className="shadow-sm border-accent/20 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-accent mb-2">Carrier Fit Summary</h3>
              <p className="text-sm text-foreground mb-3">
                <strong>2 carriers</strong> show strong fit, <strong>2 carriers</strong> conditional fit. Most coverage
                lines eligible with standard terms.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  <Building2 className="h-3 w-3 mr-1" />
                  Manufacturing Class: Acceptable
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  <MapPin className="h-3 w-3 mr-1" />
                  Texas Geography: Preferred
                </Badge>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                  <DollarSign className="h-3 w-3 mr-1" />
                  TIV: Near Limits
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  <Users className="h-3 w-3 mr-1" />
                  Loss History: Acceptable
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" className="bg-transparent">
          Back: Risk Profile
        </Button>
        <Button
          onClick={() => {
            console.log("[v0] Next: Package Builder button clicked, calling onNext")
            onNext?.()
          }}
        >
          Next: Package Builder
        </Button>
      </div>
    </div>
  )
}
