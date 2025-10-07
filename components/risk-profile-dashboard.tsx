"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, AlertTriangle, Calendar, Shield, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useExtraction } from "@/lib/extraction-context"

interface RiskFactor {
  icon: React.ElementType
  label: string
  value: string
  risk: "low" | "medium" | "high"
}



interface RiskProfileDashboardProps {
  onNext?: () => void
}

interface BusinessTypeMapping {
  [key: string]: "low" | "medium" | "high"
}

interface YearsInBusinessMapping {
  [key: string]: "low" | "medium" | "high"
}

interface LossHistoryMapping {
  [key: string]: "low" | "medium" | "high"
}

interface SafetyControlsMapping {
  [key: string]: "low" | "medium" | "high"
}

interface StatesMapping {
  [key: string]: "low" | "medium" | "high"
}

// Function to map years in business value to the appropriate range
const mapYearsToRange = (years: string): string => {
  const yearsNum = parseInt(years)
  if (isNaN(yearsNum)) return "11-15 years" // default fallback
  
  if (yearsNum < 1) return "Less than 1 year"
  if (yearsNum <= 2) return "1-2 years"
  if (yearsNum <= 5) return "3-5 years"
  if (yearsNum <= 10) return "6-10 years"
  if (yearsNum <= 15) return "11-15 years"
  if (yearsNum <= 20) return "16-20 years"
  if (yearsNum <= 30) return "21-30 years"
  if (yearsNum < 40) return "30+ years"
  return "Well-established (40+ years)"
}

// Function to map loss history to the appropriate range
const mapLossHistoryToRange = (lossHistory: string): string => {
  // Direct mapping for common patterns
  if (lossHistory.includes("No claims in 5 years")) return "No claims in 5 years"
  if (lossHistory.includes("1 claim / 3 years")) return "1 claim / 3 years"
  if (lossHistory.includes("2 claims / 3 years")) return "2 claims / 3 years"
  if (lossHistory.includes("3 claims / 3 years")) return "3 claims / 3 years"
  if (lossHistory.includes("1 claim / 5 years")) return "1 claim / 5 years"
  if (lossHistory.includes("2 claims / 5 years")) return "2 claims / 5 years"
  if (lossHistory.includes("3 claims / 5 years")) return "3 claims / 5 years"
  if (lossHistory.includes("1 claim / 2 years")) return "1 claim / 2 years"
  if (lossHistory.includes("2 claims / 2 years")) return "2 claims / 2 years"
  if (lossHistory.includes("1 claim / 1 year")) return "1 claim / 1 year"
  
  // Default fallback
  return "2 claims / 3 years"
}

// Function to calculate recommendation strength based on risk factors
const calculateRecommendationStrength = (riskFactors: RiskFactor[]): number => {
  let totalScore = 0
  let totalFactors = riskFactors.length
  
  // Weight each risk level
  const riskWeights = {
    low: 3,    // Low risk = 3 points (good)
    medium: 2, // Medium risk = 2 points (moderate)
    high: 1    // High risk = 1 point (poor)
  }
  
  // Calculate weighted score
  riskFactors.forEach(factor => {
    totalScore += riskWeights[factor.risk]
  })
  
  // Convert to percentage (max possible score is 3 * number of factors)
  const maxPossibleScore = 3 * totalFactors
  const percentage = Math.round((totalScore / maxPossibleScore) * 100)
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, percentage))
}

// Dynamic risk factors that will be updated based on CSV data and context
const getRiskFactors = (
  businessTypeMapping: BusinessTypeMapping, 
  yearsInBusinessMapping: YearsInBusinessMapping,
  lossHistoryMapping: LossHistoryMapping,
  safetyControlsMapping: SafetyControlsMapping,
  statesMapping: StatesMapping,
  yearsInBusiness: string,
  businessType: string,
  lossHistory: string,
  states: string,
  safetyControls: string
): RiskFactor[] => [
  {
    icon: Building2,
    label: "Business Type",
    value: businessType,
    risk: businessTypeMapping[businessType] || "medium",
  },
  {
    icon: MapPin,
    label: "States",
    value: states === "TX" ? "Single State (TX)" : states,
    risk: statesMapping[states] || "low",
  },
  {
    icon: AlertTriangle,
    label: "Loss History",
    value: lossHistory,
    risk: lossHistoryMapping[mapLossHistoryToRange(lossHistory)] || "medium",
  },
  {
    icon: Calendar,
    label: "Years in Business",
    value: `${yearsInBusiness} years`,
    risk: yearsInBusinessMapping[mapYearsToRange(yearsInBusiness)] || "low",
  },
  {
    icon: Shield,
    label: "Safety Controls",
    value: safetyControls,
    risk: safetyControlsMapping[safetyControls] || "low",
  },
]


export function RiskProfileDashboard({ onNext }: RiskProfileDashboardProps) {
  const { getYearsInBusiness, getBusinessType, getLossHistory, getStates, getSafetyControls } = useExtraction()
  const [businessTypeMapping, setBusinessTypeMapping] = useState<BusinessTypeMapping>({})
  const [yearsInBusinessMapping, setYearsInBusinessMapping] = useState<YearsInBusinessMapping>({})
  const [lossHistoryMapping, setLossHistoryMapping] = useState<LossHistoryMapping>({})
  const [safetyControlsMapping, setSafetyControlsMapping] = useState<SafetyControlsMapping>({})
  const [statesMapping, setStatesMapping] = useState<StatesMapping>({})
  const [recommendationStrength, setRecommendationStrength] = useState(78)

  // Load CSV data on component mount
  useEffect(() => {
    const loadBusinessTypeMapping = async () => {
      try {
        const response = await fetch('/risk-profile-excel.csv')
        const csvText = await response.text()
        const lines = csvText.split('\n').filter(line => line.trim())
        const mapping: BusinessTypeMapping = {}
        
        // Skip header row, parse data
        for (let i = 1; i < lines.length; i++) {
          const [businessType, criticality] = lines[i].split(',')
          if (businessType && criticality) {
            mapping[businessType.trim()] = criticality.trim().toLowerCase() as "low" | "medium" | "high"
          }
        }
        
        setBusinessTypeMapping(mapping)
      } catch (error) {
        console.error('Failed to load business type mapping:', error)
        // Fallback to default mapping
        setBusinessTypeMapping({
          'Manufacturing': 'medium',
          'Technology': 'low',
          'Healthcare': 'high',
          'Finance': 'high',
          'Infrastructure': 'high',
          'Retail': 'medium',
          'Fashion': 'medium',
          'Logistics': 'medium',
          'Education': 'low',
          'Real Estate': 'medium'
        })
      }
    }

    const loadYearsInBusinessMapping = async () => {
      try {
        const response = await fetch('/years-in-business-criticality.csv')
        const csvText = await response.text()
        const lines = csvText.split('\n').filter(line => line.trim())
        const mapping: YearsInBusinessMapping = {}
        
        // Skip header row, parse data
        for (let i = 1; i < lines.length; i++) {
          const [yearsRange, criticality] = lines[i].split(',')
          if (yearsRange && criticality) {
            mapping[yearsRange.trim()] = criticality.trim().toLowerCase() as "low" | "medium" | "high"
          }
        }
        
        setYearsInBusinessMapping(mapping)
      } catch (error) {
        console.error('Failed to load years in business mapping:', error)
        // Fallback to default mapping
        setYearsInBusinessMapping({
          'Less than 1 year': 'high',
          '1-2 years': 'high',
          '3-5 years': 'medium',
          '6-10 years': 'medium',
          '11-15 years': 'low',
          '16-20 years': 'low',
          '21-30 years': 'low',
          '30+ years': 'low',
          'New Startup': 'high',
          'Well-established (40+ years)': 'low'
        })
      }
    }

    const loadLossHistoryMapping = async () => {
      try {
        const response = await fetch('/loss-history-criticality.csv')
        const csvText = await response.text()
        const lines = csvText.split('\n').filter(line => line.trim())
        const mapping: LossHistoryMapping = {}
        
        // Skip header row, parse data
        for (let i = 1; i < lines.length; i++) {
          const [lossHistory, criticality] = lines[i].split(',')
          if (lossHistory && criticality) {
            mapping[lossHistory.trim()] = criticality.trim().toLowerCase() as "low" | "medium" | "high"
          }
        }
        
        setLossHistoryMapping(mapping)
      } catch (error) {
        console.error('Failed to load loss history mapping:', error)
        // Fallback to default mapping
        setLossHistoryMapping({
          'No claims in 5 years': 'low',
          '1 claim / 3 years': 'low',
          '2 claims / 3 years': 'medium',
          '3 claims / 3 years': 'high',
          '1 claim / 5 years': 'high',
          '2 claims / 5 years': 'medium',
          '3 claims / 5 years': 'high',
          '1 claim / 2 years': 'medium',
          '2 claims / 2 years': 'high',
          '1 claim / 1 year': 'high'
        })
      }
    }

    const loadSafetyControlsMapping = async () => {
      try {
        const response = await fetch('/safety-controls-criticality.csv')
        const csvText = await response.text()
        const lines = csvText.split('\n').filter(line => line.trim())
        const mapping: SafetyControlsMapping = {}
        
        // Skip header row, parse data
        for (let i = 1; i < lines.length; i++) {
          const [control, criticality] = lines[i].split(',')
          if (control && criticality) {
            mapping[control.trim()] = criticality.trim().toLowerCase() as "low" | "medium" | "high"
          }
        }
        
        setSafetyControlsMapping(mapping)
      } catch (error) {
        console.error('Failed to load safety controls mapping:', error)
        // Fallback to default mapping
        setSafetyControlsMapping({
          'None': 'high',
          'Basic Alarms Only': 'medium',
          'Fire Extinguishers Only': 'medium',
          'Sprinklers': 'low',
          'Sprinklers + Alarms': 'low',
          'CCTV + Security Personnel': 'low',
          'Fire Drills & Emergency Plans': 'low',
          'Sprinklers, Security': 'medium',
          'Comprehensive Risk Management Program': 'low',
          'Hazard-prone site, poor controls': 'high'
        })
      }
    }

    const loadStatesMapping = async () => {
      try {
        const response = await fetch('/states-criticality.csv')
        const csvText = await response.text()
        const lines = csvText.split('\n').filter(line => line.trim())
        const mapping: StatesMapping = {}
        
        // Skip header row, parse data
        for (let i = 1; i < lines.length; i++) {
          const [state, criticality] = lines[i].split(',')
          if (state && criticality) {
            mapping[state.trim()] = criticality.trim().toLowerCase() as "low" | "medium" | "high"
          }
        }
        
        setStatesMapping(mapping)
      } catch (error) {
        console.error('Failed to load states mapping:', error)
        // Fallback to default mapping
        setStatesMapping({
          'Texas (TX)': 'low',
          'California (CA)': 'high',
          'Florida (FL)': 'high',
          'New York (NY)': 'medium',
          'Illinois (IL)': 'medium',
          'Ohio (OH)': 'low',
          'Georgia (GA)': 'medium',
          'Arizona (AZ)': 'medium',
          'Colorado (CO)': 'low',
          'Miami (MI)': 'medium'
        })
      }
    }

    loadBusinessTypeMapping()
    loadYearsInBusinessMapping()
    loadLossHistoryMapping()
    loadSafetyControlsMapping()
    loadStatesMapping()
  }, [])

  // Calculate recommendation strength whenever risk factors change
  useEffect(() => {
    if (businessTypeMapping && yearsInBusinessMapping && lossHistoryMapping && safetyControlsMapping && statesMapping) {
      const riskFactors = getRiskFactors(
        businessTypeMapping, 
        yearsInBusinessMapping, 
        lossHistoryMapping, 
        safetyControlsMapping, 
        statesMapping, 
        getYearsInBusiness(), 
        getBusinessType(), 
        getLossHistory(), 
        getStates(), 
        getSafetyControls()
      )
      
      const newStrength = calculateRecommendationStrength(riskFactors)
      setRecommendationStrength(newStrength)
    }
  }, [businessTypeMapping, yearsInBusinessMapping, lossHistoryMapping, safetyControlsMapping, statesMapping, getYearsInBusiness, getBusinessType, getLossHistory, getStates, getSafetyControls])

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

// priority colors removed from UI per request


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
            {getRiskFactors(businessTypeMapping, yearsInBusinessMapping, lossHistoryMapping, safetyControlsMapping, statesMapping, getYearsInBusiness(), getBusinessType(), getLossHistory(), getStates(), getSafetyControls()).map((factor, index) => (
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

        </CardContent>
      </Card>


      <div className="flex justify-end pt-6">
        <Button onClick={onNext}>Next: Carrier Fit & Compliance</Button>
      </div>
    </div>
  )
}
