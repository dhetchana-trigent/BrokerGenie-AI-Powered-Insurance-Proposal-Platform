"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, XCircle, Building2, MapPin, DollarSign, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useExtraction } from "@/lib/extraction-context"

interface CarrierAppetiteRule {
  type: "include" | "exclude" | "conditional"
  values: string[]
  condition?: string
}

interface CarrierAppetiteData {
  id: string
  name: string
  summary: string
  appetiteRules: {
    businessClass: CarrierAppetiteRule[]
    geography: CarrierAppetiteRule[]
    tiv: { min?: number; max?: number; condition?: string }
    yearsInBusiness: { min?: number; max?: number; condition?: string }
    lossHistory: { maxClaims?: number; maxSeverity?: string; condition?: string }
  }
  strengths: string[]
  concerns: string[]
}

interface CarrierAppetite {
  name: string
  logo: string
  fit: "fit" | "conditional" | "not-fit"
  reason: string
  strengths: string[]
  concerns: string[]
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
]



export function CarrierFitCompliance({ onNext }: CarrierFitComplianceProps) {
  const { getBusinessType, getYearsInBusiness } = useExtraction()
  const [carrierAppetiteData, setCarrierAppetiteData] = useState<CarrierAppetiteData[]>([])
  const [carrierFitResults, setCarrierFitResults] = useState<CarrierAppetite[]>([])

  // Load carrier appetite data
  useEffect(() => {
    const loadCarrierAppetite = async () => {
      try {
        const response = await fetch('/carrier-appetite.json')
        const data: CarrierAppetiteData[] = await response.json()
        setCarrierAppetiteData(data)
      } catch (error) {
        console.error('Failed to load carrier appetite data:', error)
        // Fallback to static data
        setCarrierAppetiteData([])
      }
    }
    loadCarrierAppetite()
  }, [])

  // Dynamic matching logic
  useEffect(() => {
    if (carrierAppetiteData.length > 0) {
      const clientBusinessType = getBusinessType()
      const clientYearsInBusiness = parseInt(getYearsInBusiness())
      const clientTIV = 2500000 // From context - you can add this to extraction context
      const clientLocation = "TX" // From context - you can add this to extraction context
      const clientLossHistory = 2 // From context - you can add this to extraction context

      const results: CarrierAppetite[] = carrierAppetiteData.map(carrier => {
        let fit: "fit" | "conditional" | "not-fit" = "fit"
        let reason = carrier.summary
        let strengths = [...carrier.strengths]
        let concerns = [...carrier.concerns]

        // Check Business Class
        const businessClassRule = carrier.appetiteRules.businessClass.find(rule => 
          rule.values.includes(clientBusinessType) || rule.values.includes("Any")
        )
        
        if (businessClassRule) {
          if (businessClassRule.type === "exclude") {
            fit = "not-fit"
            reason = `Not a fit for ${clientBusinessType} business`
            concerns.push(businessClassRule.condition || `Excluded for ${clientBusinessType}`)
          } else if (businessClassRule.type === "conditional") {
            fit = "conditional"
            concerns.push(businessClassRule.condition || `Conditional for ${clientBusinessType}`)
          }
        } else {
          fit = "not-fit"
          reason = `No appetite for ${clientBusinessType} business`
        }

        // Check TIV
        if (carrier.appetiteRules.tiv.max && clientTIV > carrier.appetiteRules.tiv.max) {
          if (fit === "fit") fit = "conditional"
          concerns.push(`TIV ($${clientTIV.toLocaleString()}) exceeds carrier's max appetite of $${carrier.appetiteRules.tiv.max.toLocaleString()}`)
        }

        // Check Years in Business
        if (carrier.appetiteRules.yearsInBusiness.min && clientYearsInBusiness < carrier.appetiteRules.yearsInBusiness.min) {
          if (fit === "fit") fit = "conditional"
          concerns.push(`Requires ${carrier.appetiteRules.yearsInBusiness.min}+ years in business (client has ${clientYearsInBusiness})`)
        }

        // Check Loss History
        if (carrier.appetiteRules.lossHistory.maxClaims && clientLossHistory > carrier.appetiteRules.lossHistory.maxClaims) {
          if (fit === "fit") fit = "conditional"
          concerns.push(`Loss history (${clientLossHistory} claims) exceeds carrier tolerance (${carrier.appetiteRules.lossHistory.maxClaims} max)`)
        }

        return {
          name: carrier.name,
          logo: carrier.id,
          fit,
          reason,
          strengths,
          concerns
        }
      })

      setCarrierFitResults(results)
    }
  }, [carrierAppetiteData, getBusinessType, getYearsInBusiness])

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
            {carrierFitResults.length > 0 ? carrierFitResults.map((carrier, index) => (
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
            )) : carrierAppetites.map((carrier, index) => (
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



      {/* Summary Banner */}
      <Card className="shadow-sm border-accent/20 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-accent mb-2">Carrier Fit Summary</h3>
              <p className="text-sm text-foreground mb-3">
                <strong>1 carrier</strong> shows strong fit, <strong>1 carrier</strong> conditional fit, <strong>1 carrier</strong> not a fit. 
                Limited options available for this risk profile.
              </p>
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
