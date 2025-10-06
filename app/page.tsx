"use client"

import { useState } from "react"
import { ExtractionProvider } from "@/lib/extraction-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StepperNavigation } from "@/components/stepper-navigation"
import { ClientIntake } from "@/components/client-intake"
import { UploadPreview } from "@/components/upload-preview"
import AIExtractInterface from "@/components/ai-extract-interface"
import { RiskProfileDashboard } from "@/components/risk-profile-dashboard"
import { CarrierFitCompliance } from "@/components/carrier-fit-compliance"
import { PackageBuilder } from "@/components/package-builder"
import { QuoteOptionsPricing } from "@/components/quote-options-pricing"
import { CoverageComparison } from "@/components/coverage-comparison"
import { ProposalBuilder } from "@/components/proposal-builder"
import { Activity } from "@/components/activity"
import { Home, ChevronLeft, ChevronRight } from "lucide-react"

export default function BrokerGeniePage() {
  const [showNavigation, setShowNavigation] = useState(false)
  const [currentStep, setCurrentStep] = useState("client-intake")

  const handleStart = () => {
    setShowNavigation(true)
    setCurrentStep("client-intake")
  }

  const handleViewSampleProposal = () => {
    // Route to Coverage Comparison with sample scenario
    setShowNavigation(true)
    setCurrentStep("coverage-comparison")
  }

  const handleNextStep = () => {
    const steps = [
      "client-intake",
      "upload-preview",
      "extract-ai",
      "risk-profile",
      "carrier-fit",
      "package-builder",
      "coverage-comparison",
      "proposal-builder",
      "activity",
    ]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handlePreviousStep = () => {
    const steps = [
      "client-intake",
      "upload-preview",
      "extract-ai",
      "risk-profile",
      "carrier-fit",
      "package-builder",
      "coverage-comparison",
      "proposal-builder",
      "activity",
    ]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleGoHome = () => {
    setShowNavigation(false)
    setCurrentStep("client-intake")
  }

  const getStepTitle = (step: string) => {
    const stepTitles: Record<string, string> = {
      "client-intake": "Client Intake",
      "upload-preview": "Upload & Preview",
      "extract-ai": "Extract with AI",
      "risk-profile": "Risk Profile",
      "carrier-fit": "Carrier Fit & Compliance",
      "package-builder": "Package Builder & Pricing",
      "coverage-comparison": "Coverage Comparison",
      "proposal-builder": "Proposal Builder",
      activity: "Activity",
    }
    return stepTitles[step] || "BrokerGenie"
  }

  const canGoPrevious = () => {
    const steps = [
      "client-intake",
      "upload-preview",
      "extract-ai",
      "risk-profile",
      "carrier-fit",
      "package-builder",
      "coverage-comparison",
      "proposal-builder",
      "activity",
    ]
    return steps.indexOf(currentStep) > 0
  }

  const canGoNext = () => {
    const steps = [
      "client-intake",
      "upload-preview",
      "extract-ai",
      "risk-profile",
      "carrier-fit",
      "package-builder",
      "coverage-comparison",
      "proposal-builder",
      "activity",
    ]
    return steps.indexOf(currentStep) < steps.length - 1
  }

  if (showNavigation) {
    return (
      <ExtractionProvider>
        <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-white border-b border-black/8 shadow-sm ml-64">
          <div className="h-[62px] px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePreviousStep}
                disabled={!canGoPrevious()}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">{getStepTitle(currentStep)}</h1>
              <Button
                onClick={handleNextStep}
                disabled={!canGoNext()}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="h-9 px-4 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-3 bg-transparent"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">Home</span>
            </Button>
          </div>
        </header>
        <div className="flex">
          <StepperNavigation currentStep={currentStep} onStepChange={setCurrentStep} />
          <main className="flex-1 ml-64">
            <div className="p-6">
              {currentStep === "client-intake" && <ClientIntake onNext={handleNextStep} />}
              {currentStep === "upload-preview" && <UploadPreview onNext={handleNextStep} />}
              {currentStep === "extract-ai" && <AIExtractInterface onNext={handleNextStep} />}
              {currentStep === "risk-profile" && <RiskProfileDashboard onNext={handleNextStep} />}
              {currentStep === "carrier-fit" && <CarrierFitCompliance onNext={handleNextStep} />}
              {currentStep === "package-builder" && <PackageBuilder onNext={handleNextStep} />}
              {currentStep === "coverage-comparison" && (
                <CoverageComparison onNext={handleNextStep} onBack={handlePreviousStep} />
              )}
              {currentStep === "proposal-builder" && <ProposalBuilder onNext={handleNextStep} />}
              {currentStep === "activity" && <Activity />}
              {![
                "client-intake",
                "upload-preview",
                "extract-ai",
                "risk-profile",
                "carrier-fit",
                "package-builder",
                "coverage-comparison",
                "proposal-builder",
                "activity",
              ].includes(currentStep) && (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
                  <p className="text-muted-foreground">This step will be implemented next.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      </ExtractionProvider>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center">
        {/* Company Logo */}
        <div className="mb-6">
          <img src="/trigent-logo.svg" alt="Trigent" className="h-14 w-auto mx-auto" style={{ maxHeight: "56px" }} />
        </div>

        {/* App Title */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6">BrokerGenie</h1>

        {/* Primary Tagline */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Personalized coverage packages. Broker-branded proposals. Fast.
        </h2>

        {/* Supporting Line */}
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Upload ACORDs and prior policies, Extract with AI, compare options, and send a client-ready proposal in
          minutes.
        </p>

        {/* KPI Chips */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Badge
            variant="secondary"
            className="px-6 py-3 text-base font-bold bg-gray-100 text-gray-900 border-gray-200 rounded-xl shadow-sm"
          >
            Cut quoting & proposal time by 70%
          </Badge>
          <Badge
            variant="secondary"
            className="px-6 py-3 text-base font-bold bg-gray-100 text-gray-900 border-gray-200 rounded-xl shadow-sm"
          >
            Improve client retention & conversion by 25–30%
          </Badge>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={handleStart}
            size="lg"
            className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start
          </Button>
          <Button
            onClick={handleViewSampleProposal}
            variant="outline"
            size="lg"
            className="px-8 py-4 text-lg font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 bg-transparent"
          >
            View Sample Proposal
          </Button>
        </div>
      </div>
    </div>
  )
}
