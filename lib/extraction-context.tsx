"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface ExtractedData {
  [key: string]: string
}

interface ExtractionContextType {
  extractedData: ExtractedData
  updateExtractedData: (field: string, value: string) => void
  getYearsInBusiness: () => string
  getBusinessType: () => string
  getLossHistory: () => string
  getStates: () => string
  getSafetyControls: () => string
  getTotalInsuredValue: () => string
}

const ExtractionContext = createContext<ExtractionContextType | undefined>(undefined)

export function ExtractionProvider({ children }: { children: ReactNode }) {
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    "Years in Business": "15",
    "Business Type": "Manufacturing",
    "Legal Name": "Acme Manufacturing Inc.",
    "FEIN": "12-3456789",
    "NAICS Code": "332710 - Machine Shops",
    "Primary Location": "1234 Industrial Blvd, Houston, TX 77001",
    "Coastal Indicator": "No",
    "Brush Fire Zone": "Low Risk",
    "Total Insured Value": "$2,500,000",
    "Construction Type": "Masonry Non-Combustible",
    "Roof Age": "8 years",
    "Sprinkler System": "Full Coverage",
    "Loss History": "2 claims / 3 years",
    "States": "Texas (TX)",
    "Safety Controls": "Sprinklers, Security",
  })

  const updateExtractedData = (field: string, value: string) => {
    setExtractedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getYearsInBusiness = () => {
    return extractedData["Years in Business"] || "15"
  }

  const getBusinessType = () => {
    return extractedData["Business Type"] || "Manufacturing"
  }

  const getLossHistory = () => {
    return extractedData["Loss History"] || "2 claims / 3 years"
  }

  const getStates = () => {
    return extractedData["States"] || "Texas (TX)"
  }

  const getSafetyControls = () => {
    return extractedData["Safety Controls"] || "Sprinklers, Security"
  }

  const getTotalInsuredValue = () => {
    return extractedData["Total Insured Value"] || "$2,500,000"
  }

  return (
    <ExtractionContext.Provider value={{
      extractedData,
      updateExtractedData,
      getYearsInBusiness,
      getBusinessType,
      getLossHistory,
      getStates,
      getSafetyControls,
      getTotalInsuredValue
    }}>
      {children}
    </ExtractionContext.Provider>
  )
}

export function useExtraction() {
  const context = useContext(ExtractionContext)
  if (context === undefined) {
    throw new Error("useExtraction must be used within an ExtractionProvider")
  }
  return context
}
