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
import { ProposalBuilder } from "@/components/proposal-builder"
import { Home, ChevronLeft, ChevronRight } from "lucide-react"

export default function BrokerGeniePage() {
  const [showNavigation, setShowNavigation] = useState(false)
  const [currentStep, setCurrentStep] = useState("client-intake")
  const [selectedPackageData, setSelectedPackageData] = useState<any>(null)
  const [samplePdfUrl, setSamplePdfUrl] = useState<string | null>(null)

  const handleStart = () => {
    setShowNavigation(true)
    setCurrentStep("client-intake")
  }

  // Generate a 2-page sample proposal PDF from the landing page
  const generateSampleProposal = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      if (!jsPDF) return

      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      let yPosition = 20

      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: number[] = [0,0,0], align: 'left' | 'center' | 'right' = 'left', x?: number) => {
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', isBold ? 'bold' : 'normal')
        doc.setTextColor(color[0], color[1], color[2])
        const textX = x || margin
        if (align === 'center') doc.text(text, pageWidth / 2, yPosition, { align: 'center' })
        else if (align === 'right') doc.text(text, pageWidth - margin, yPosition, { align: 'right' })
        else doc.text(text, textX, yPosition)
        yPosition += fontSize * 0.4 + 2
      }

      const addLineBreak = (spacing: number = 8) => { yPosition += spacing }
      const addSectionHeader = (title: string) => { addLineBreak(3); addText(title, 14, true, [0,32,96]); addLineBreak(6) }

      // Header
      doc.setFillColor(0,32,96)
      doc.rect(0, 0, pageWidth, 20, 'F')
      doc.setFontSize(16); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255)
      doc.text('BROKERGENIE INSURANCE PROPOSAL', pageWidth/2, 12, { align: 'center' })
      yPosition = 35
      addText(`Generated on: ${new Date().toLocaleDateString()}`)
      addLineBreak(15)

      // Client Information
      addSectionHeader('CLIENT INFORMATION')
      ;[
        'Business Name: Acme Manufacturing Inc.',
        'Business Type: Manufacturing',
        'FEIN: 12-3456789',
        'Primary Location: 123 Industrial Blvd, Detroit, MI 48201',
        'States of Operation: Michigan, Ohio, Indiana',
        'Years in Business: 15 years'
      ].forEach(line => addText(line))
      addLineBreak(10)

      // Recommended Package + Premium
      addSectionHeader('RECOMMENDED PACKAGE')
      addText('Essential Coverage', 12, true)
      addText('Comprehensive coverage tailored to your business needs', 10, false, [100,100,100])
      addLineBreak(8)
      const boxX = margin, boxY = yPosition - 3, boxWidth = 80, boxHeight = 25
      doc.setDrawColor(0,32,96); doc.setLineWidth(1); doc.rect(boxX, boxY, boxWidth, boxHeight, 'S')
      doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(0,32,96)
      doc.text('$45,000', boxX + 5, boxY + 8)
      doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0)
      doc.text('Annual Premium', boxX + 5, boxY + 13)
      doc.setFontSize(10); doc.setFont('helvetica','bold')
      doc.text('$3,750/month', boxX + 5, boxY + 20)
      yPosition += 30
      addLineBreak(10)

      // Executive Summary (bullets)
      addSectionHeader('EXECUTIVE SUMMARY')
      ;[
        '• Based on our comprehensive analysis of Acme Manufacturing Inc.',
        '• We recommend the Essential Coverage insurance package',
        '• This package best fits your business needs and risk profile',
        '• Competitive rates with flexible payment options available'
      ].forEach(line => addText(line, 10, false, [0,0,0], 'left', margin + 5))

      // Page-break if needed
      if (yPosition > pageHeight - 120) { doc.addPage(); yPosition = 20 }

      // Risk Assessment
      addSectionHeader('RISK ASSESSMENT')
      addText('Our risk analysis identified several key factors:')
      ;[
        '• Business type and operational risks',
        '• Years in business and experience level',
        '• Loss history and claims record',
        '• Safety controls and risk management'
      ].forEach(line => addText(line, 10, false, [0,0,0], 'left', margin + 5))
      addLineBreak(8)

      // Coverage Highlights
      addSectionHeader('COVERAGE HIGHLIGHTS')
      addText('Key coverage features of the Essential Coverage package:')
      ;[
        '• Comprehensive general liability protection',
        '• Property damage and business interruption coverage',
        '• Professional liability and errors & omissions'
      ].forEach(line => addText(line, 10, false, [0,0,0], 'left', margin + 5))
      addLineBreak(8)

      // Terms & Conditions
      addSectionHeader('TERMS & CONDITIONS')
      ;[
        '• Coverage is subject to underwriting approval',
        '• Premium is based on current risk assessment',
        '• Policy terms and conditions apply',
        '• Claims are subject to policy limits and deductibles'
      ].forEach(line => addText(line, 10, false, [0,0,0], 'left', margin + 5))
      addLineBreak(8)

      // Next Steps + Contact
      addSectionHeader('NEXT STEPS')
      addText('To proceed with this proposal:')
      ;[
        '1. Review the terms and conditions',
        '2. Contact us to finalize coverage',
        '3. Complete application process',
        '4. Submit required documentation'
      ].forEach(line => addText(line, 10, false, [0,0,0], 'left', margin + 5))
      addLineBreak(8)

      addSectionHeader('CONTACT INFORMATION')
      ;[
        'BrokerGenie Insurance Solutions',
        'Email: support@brokergenie.com',
        'Phone: (555) 122 4567'
      ].forEach(line => addText(line))
      addLineBreak(5)

      // Footer
      doc.setDrawColor(200,200,200); doc.setLineWidth(1)
      doc.line(margin, yPosition, pageWidth - margin, yPosition); yPosition += 10
      addText('This proposal is valid for 30 days from the date of issue.', 9, false, [100,100,100], 'center')
      addText('Coverage is subject to underwriting approval and payment of premium.', 9, false, [100,100,100], 'center')

      // Create blob URL for in-app preview instead of downloading
      const blob = doc.output('blob') as Blob
      const url = URL.createObjectURL(blob)
      setSamplePdfUrl(url)
    } catch (e) {
      console.error(e)
      alert('Unable to generate sample proposal. Please try again.')
    }
  }

  const handleViewSampleProposal = () => {
    // Generate a sample proposal PDF from the landing page
    generateSampleProposal()
  }

  const handleNextStep = () => {
    const steps = [
      "client-intake",
      "upload-preview",
      "extract-ai",
      "risk-profile",
      "carrier-fit",
      "package-builder",
      "proposal-builder",
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
      "proposal-builder",
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
      "proposal-builder",
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
      "proposal-builder",
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
              {currentStep !== "proposal-builder" && (
                <Button
                  onClick={handleNextStep}
                  disabled={!canGoNext()}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
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
              {currentStep === "carrier-fit" && (
                <CarrierFitCompliance 
                  onNext={handleNextStep}
                  onSelectCarrier={(carrierName) => {
                    // Pass carrier name via sessionStorage and go to package builder
                    try { sessionStorage.setItem('bg_selected_carrier', carrierName) } catch {}
                    setCurrentStep('package-builder')
                  }}
                />
              )}
              {currentStep === "package-builder" && <PackageBuilder onNext={(packageData) => {
                setSelectedPackageData(packageData)
                handleNextStep()
              }} />}
              {currentStep === "proposal-builder" && (
                <ProposalBuilder 
                  onNext={handleNextStep}
                  selectedPackageData={selectedPackageData}
                />
              )}
              {![
                "client-intake",
                "upload-preview",
                "extract-ai",
                "risk-profile",
                "carrier-fit",
                "package-builder",
                "proposal-builder",
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
            className="px-8 py-4 text-lg font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-black rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 bg-transparent"
          >
            View Sample Proposal
          </Button>
        </div>
      </div>
      {/* Preview Modal */}
      {samplePdfUrl && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[80vh] rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Sample Proposal Preview</h3>
              <Button
                variant="outline"
                onClick={() => { URL.revokeObjectURL(samplePdfUrl); setSamplePdfUrl(null) }}
                className="bg-transparent"
              >
                Close
              </Button>
            </div>
            <iframe
              src={samplePdfUrl}
              className="flex-1 w-full"
              title="Sample Proposal PDF"
            />
          </div>
        </div>
      )}
    </div>
  )
}
