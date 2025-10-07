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
    employees?: { min?: number; max?: number }
    sprinklersRequired?: boolean
    constructionTypes?: string[]
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
  onSelectCarrier?: (carrierName: string) => void
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



export function CarrierFitCompliance({ onNext, onSelectCarrier }: CarrierFitComplianceProps) {
  const { extractedData, getBusinessType, getYearsInBusiness, getTotalInsuredValue, getStates, getSafetyControls, getLossHistory } = useExtraction()
  const [carrierAppetiteData, setCarrierAppetiteData] = useState<CarrierAppetiteData[]>([])
  const [carrierFitResults, setCarrierFitResults] = useState<CarrierAppetite[]>([])

  // Load carrier appetite data
  useEffect(() => {
    const loadCarrierAppetite = async () => {
      try {
        // Load from CSV files and normalize into CarrierAppetiteData shape
        const [libertyCsv, zurichCsv, aigCsv] = await Promise.all([
          fetch('/carrier-liberty.csv').then(r => r.text()),
          fetch('/carrier-zurich.csv').then(r => r.text()),
          fetch('/carrier-aig.csv').then(r => r.text())
        ])

        const parseCsv = (csv: string) => {
          const [header, ...rows] = csv.trim().split(/\r?\n/)
          const cols = header.split(',')
          return rows.map(line => {
            const values = line.split(',')
            const rec: any = {}
            cols.forEach((c, i) => rec[c] = values[i])
            return rec
          })
        }

        const toAppetite = (rec: any): CarrierAppetiteData => {
          const strengths = (rec.strengths || '').split('|').filter(Boolean)
          const concerns = (rec.concerns || '').split('|').filter(Boolean)
          const businessValues = (rec.businessClassValues || '').split('|').filter(Boolean)
          const includeBusinessValues = (rec.includeBusinessClassValues || '').split('|').filter(Boolean)
          const conditionalBusinessValues = (rec.conditionalBusinessClassValues || '').split('|').filter(Boolean)
          const excludeBusinessValues = (rec.excludeBusinessClassValues || '').split('|').filter(Boolean)
          const statesList = (rec.statesList || '').split('|').filter(Boolean)
          const tivMax = rec.tivMax ? Number(rec.tivMax) : undefined
          const tivMin = rec.tivMin ? Number(rec.tivMin) : undefined
          const yearsMin = rec.yearsMin ? Number(rec.yearsMin) : undefined
          const yearsMax = rec.yearsMax ? Number(rec.yearsMax) : undefined
          const lossMaxClaims = rec.lossMaxClaims ? Number(rec.lossMaxClaims) : undefined
          const employeeMin = rec.employeeMin ? Number(rec.employeeMin) : undefined
          const employeeMax = rec.employeeMax ? Number(rec.employeeMax) : undefined
          const hasSprinklersRequired = (rec.hasSprinklersRequired || '').toLowerCase() === 'yes'
          const constructionTypes = (rec.constructionTypes || '').split('|').filter(Boolean)

          // Build business class rules. Prefer split include/conditional/exclude fields if provided; otherwise fallback to single rule
          const businessClassRules: CarrierAppetiteRule[] = []
          if (includeBusinessValues.length > 0 || conditionalBusinessValues.length > 0 || excludeBusinessValues.length > 0) {
            if (includeBusinessValues.length > 0) businessClassRules.push({ type: 'include', values: includeBusinessValues })
            if (conditionalBusinessValues.length > 0) businessClassRules.push({ type: 'conditional', values: conditionalBusinessValues })
            if (excludeBusinessValues.length > 0) businessClassRules.push({ type: 'exclude', values: excludeBusinessValues })
          } else {
            businessClassRules.push({ type: rec.businessClassRuleType as any, values: businessValues, condition: undefined })
          }
          return {
            id: rec.id,
            name: rec.name,
            summary: rec.summary,
            appetiteRules: {
              businessClass: businessClassRules,
              geography: [{ type: rec.statesRuleType as any, values: statesList as any, condition: undefined } as any],
              tiv: { min: tivMin, max: tivMax },
              yearsInBusiness: { min: yearsMin, max: yearsMax },
              lossHistory: { maxClaims: lossMaxClaims, maxSeverity: rec.lossMaxSeverity },
              employees: { min: employeeMin, max: employeeMax },
              sprinklersRequired: hasSprinklersRequired || undefined,
              constructionTypes: constructionTypes.length > 0 ? constructionTypes : undefined
            },
            strengths,
            concerns
          }
        }

        const data: CarrierAppetiteData[] = [
          ...parseCsv(libertyCsv).map(toAppetite),
          ...parseCsv(zurichCsv).map(toAppetite),
          ...parseCsv(aigCsv).map(toAppetite)
        ]
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
      const clientTIV = (() => {
        const raw = getTotalInsuredValue()
        const num = Number((raw || '').toString().replace(/[^0-9]/g, ''))
        return Number.isNaN(num) ? undefined : num
      })()
      const clientState = (() => {
        const raw = getStates()
        const m = /\(([^)]+)\)/.exec(raw || '')
        return m ? m[1] : (raw || 'Any')
      })()
      const clientHasSprinklers = (() => {
        const raw = getSafetyControls()
        return /sprinkler/i.test(raw || '')
      })()
      const clientConstructionType = (() => {
        // Extraction context includes Construction Type directly in extractedData; no getter
        // We infer from Primary Location/other fields not necessary here; leave undefined to avoid penalizing
        return undefined as string | undefined
      })()
      const clientLossClaims = (() => {
        const raw = getLossHistory()
        const m = /(\d+)/.exec(raw || '')
        return m ? parseInt(m[1]) : undefined
      })()

      let results: CarrierAppetite[] = carrierAppetiteData.map(carrier => {
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
        if (carrier.appetiteRules.tiv.max && (clientTIV || 0) > carrier.appetiteRules.tiv.max) {
          if (fit === "fit") fit = "conditional"
          concerns.push(`TIV ($${(clientTIV || 0).toLocaleString()}) exceeds carrier max $${carrier.appetiteRules.tiv.max.toLocaleString()}`)
        }
        if (carrier.appetiteRules.tiv.min && (clientTIV || 0) < carrier.appetiteRules.tiv.min) {
          if (fit === "fit") fit = "conditional"
          concerns.push(`TIV below carrier minimum ($${carrier.appetiteRules.tiv.min.toLocaleString()})`)
        }

        // Check Years in Business
        if (carrier.appetiteRules.yearsInBusiness.min && clientYearsInBusiness < carrier.appetiteRules.yearsInBusiness.min) {
          if (fit === "fit") fit = "conditional"
          concerns.push(`Requires ${carrier.appetiteRules.yearsInBusiness.min}+ years in business (client has ${clientYearsInBusiness})`)
        }

        // Check Loss History
        if (carrier.appetiteRules.lossHistory.maxClaims && (clientLossClaims || 0) > carrier.appetiteRules.lossHistory.maxClaims) {
          if (fit === "fit") fit = "conditional"
          concerns.push(`Loss history (${clientLossClaims || 0} claims) exceeds carrier tolerance (${carrier.appetiteRules.lossHistory.maxClaims} max)`)
        }

        // Check Employees (if we had this data; currently ignored when unknown)
        if (carrier.appetiteRules.employees) {
          const employees: number | undefined = undefined
          if (typeof employees === 'number') {
            if (carrier.appetiteRules.employees.min && employees < carrier.appetiteRules.employees.min) {
              if (fit === "fit") fit = "conditional"
              concerns.push(`Employee count below minimum (${carrier.appetiteRules.employees.min})`)
            }
            if (carrier.appetiteRules.employees.max && employees > carrier.appetiteRules.employees.max) {
              if (fit === "fit") fit = "conditional"
              concerns.push(`Employee count above maximum (${carrier.appetiteRules.employees.max})`)
            }
          }
        }

        // Check Sprinklers
        if (carrier.appetiteRules.sprinklersRequired && !clientHasSprinklers) {
          if (fit === "fit") fit = "conditional"
          concerns.push("Requires sprinkler protection")
        }

        // Check Construction Type
        if (carrier.appetiteRules.constructionTypes && carrier.appetiteRules.constructionTypes.length > 0 && clientConstructionType) {
          const allowed = carrier.appetiteRules.constructionTypes
          if (!allowed.includes(clientConstructionType)) {
            if (fit === "fit") fit = "conditional"
            concerns.push(`Preferred construction: ${allowed.join(', ')}`)
          }
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

      // Tie-breaker: if multiple carriers are Fit for the same Business Type, prefer one and mark others Conditional
      const fitCarriers = results.filter(r => r.fit === "fit")
      if (fitCarriers.length > 1) {
        const preferredByBusinessType: Record<string, string> = {
          Technology: "Zurich",
          Finance: "AIG",
          Manufacturing: "Liberty Mutual",
        }
        const preferred = preferredByBusinessType[clientBusinessType] || fitCarriers[0]?.name
        results = results.map(r => {
          if (r.fit === "fit" && r.name !== preferred) {
            return {
              ...r,
              fit: "conditional",
              concerns: [...r.concerns, `Secondary fit; prioritized ${preferred} for ${clientBusinessType}`],
            }
          }
          return r
        })
      }

      setCarrierFitResults(results)
    }
  }, [carrierAppetiteData, extractedData])

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
              <div key={index} className={cn("p-4 rounded-lg border h-full flex flex-col", getFitColor(carrier.fit))}>
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
                <div className="pt-3 mt-auto flex justify-end">
                  <Button
                    variant="outline"
                    className="bg-white/70"
                    onClick={() => onSelectCarrier?.(carrier.name)}
                  >
                    Build with {carrier.name}
                  </Button>
                </div>
              </div>
            )) : carrierAppetites.map((carrier, index) => (
              <div key={index} className={cn("p-4 rounded-lg border h-full flex flex-col", getFitColor(carrier.fit))}>
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
                <div className="pt-3 mt-auto flex justify-end">
                  <Button
                    variant="outline"
                    className="bg-white/70"
                    onClick={() => onSelectCarrier?.(carrier.name)}
                  >
                    Build with {carrier.name}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>



      {/* Summary Banner */}

      <div className="flex justify-end pt-6">
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
