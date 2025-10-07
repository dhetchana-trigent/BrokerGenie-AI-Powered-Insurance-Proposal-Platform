"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  Building2, 
  Shield, 
  DollarSign, 
  FileText, 
  Download, 
  Mail, 
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  CheckCircle,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useExtraction } from "@/lib/extraction-context"

interface ProposalBuilderProps {
  onNext?: () => void
  selectedPackageData?: any
}

export function ProposalBuilder({ onNext, selectedPackageData }: ProposalBuilderProps) {
  const { 
    getBusinessType, 
    getTotalInsuredValue, 
    getStates, 
    getLossHistory, 
    getYearsInBusiness, 
    getSafetyControls,
    extractedData 
  } = useExtraction()

  const [proposalData, setProposalData] = useState({
    executiveSummary: "",
    riskAssessment: "",
    coverageHighlights: "",
    nextSteps: ""
  })

  // Generate dynamic proposal content based on business data
  const generateProposalContent = () => {
    const businessType = getBusinessType()
    const tiv = getTotalInsuredValue()
    const yearsInBusiness = getYearsInBusiness()
    const lossHistory = getLossHistory()
    const safetyControls = getSafetyControls()
    const states = getStates()
    
    const selectedPackage = selectedPackageData || { name: "Balanced Protection", totalPremium: 0, monthlyPremium: 0 }
    
    const executiveSummary = `Based on our comprehensive analysis of ${extractedData["Legal Name"] || "your business"}, we recommend the ${selectedPackage.name} insurance package. This ${businessType.toLowerCase()} operation, established for ${yearsInBusiness}, requires comprehensive coverage to protect against the unique risks associated with your industry and operations across ${states}.`

    const riskAssessment = `Our risk analysis identified several key factors:
• Industry Risk: ${businessType} operations present specific liability exposures
• Geographic Exposure: Operations in ${states} require multi-state coverage considerations
• Business Maturity: ${yearsInBusiness} in business demonstrates stability and experience
• Loss History: ${lossHistory} indicates ${lossHistory.includes('claims') && parseInt(lossHistory) > 1 ? 'elevated' : 'favorable'} risk profile
• Safety Measures: ${safetyControls} provide strong risk mitigation
• Asset Value: Total Insured Value of ${tiv} requires adequate property protection`

    const coverageHighlights = `Key coverage features of the ${selectedPackage.name} package:
• General Liability: Comprehensive protection against third-party claims
• Property Coverage: Full replacement cost coverage for your ${tiv} in assets
• Cyber Liability: Protection against data breaches and cyber attacks
• Employment Practices: Coverage for employment-related claims
• Umbrella Coverage: Additional liability protection beyond primary limits
• Multi-state Coverage: Seamless protection across your operations in ${states}
• Competitive Premium: Starting at $${selectedPackage.monthlyPremium?.toLocaleString() || '0'}/month`

    const nextSteps = `To proceed with this proposal:
1. Review the attached coverage details and pricing
2. Schedule a call to discuss any questions or modifications
3. Complete the application process
4. Provide required documentation (loss runs, financial statements)
5. Finalize terms and binding instructions`

    return {
      executiveSummary,
      riskAssessment,
      coverageHighlights,
      nextSteps
    }
  }

  // Initialize proposal content
  useEffect(() => {
    const content = generateProposalContent()
    setProposalData(prev => ({
      ...prev,
      ...content
    }))
  }, [selectedPackageData, getBusinessType(), getTotalInsuredValue(), getStates(), getLossHistory(), getYearsInBusiness(), getSafetyControls()])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const generateProposalPDF = async () => {
    try {
      // Check if jsPDF is available
      const { jsPDF } = await import('jspdf')
      if (!jsPDF) {
        throw new Error('jsPDF library not available')
      }
      
      const doc = new jsPDF('p', 'mm', 'a4')
      
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      let yPosition = 20
      
      // Helper function to add text with proper alignment
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: number[] = [0, 0, 0], align: 'left' | 'center' | 'right' = 'left', x?: number) => {
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', isBold ? 'bold' : 'normal')
        doc.setTextColor(color[0], color[1], color[2])
        
        const textX = x || margin
        
        if (align === 'center') {
          doc.text(text, pageWidth / 2, yPosition, { align: 'center' })
        } else if (align === 'right') {
          doc.text(text, pageWidth - margin, yPosition, { align: 'right' })
        } else {
          // Left align - ensure consistent left margin
          doc.text(text, textX, yPosition)
        }
        
        yPosition += fontSize * 0.4 + 2
      }
      
      // Helper function to add line break
      const addLineBreak = (spacing: number = 8) => {
        yPosition += spacing
      }
      
      // Helper function to add section header
      const addSectionHeader = (title: string) => {
        addLineBreak(3)
        addText(title, 14, true, [0, 32, 96]) // Blue color
        addLineBreak(6)
      }
      
      // Helper function to check if we need a new page
      const checkNewPage = () => {
        if (yPosition > pageHeight - 40) {
          doc.addPage()
          yPosition = 20
        }
      }
      
      // PAGE 1: Header and Client Information
      
      // Blue header bar
      doc.setFillColor(0, 32, 96) // Blue color
      doc.rect(0, 0, pageWidth, 20, 'F')
      
      // White text on blue header
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text('BROKERGENIE INSURANCE PROPOSAL', pageWidth / 2, 12, { align: 'center' })
      
      yPosition = 35
      
      // Generated date
      addText(`Generated on: ${new Date().toLocaleDateString()}`, 10, false, [0, 0, 0])
      addLineBreak(15)
      
      // CLIENT INFORMATION section
      addSectionHeader('CLIENT INFORMATION')
      
      const clientInfo = [
        `Business Name: ${extractedData["Legal Name"] || "Client Business"}`,
        `Business Type: ${getBusinessType() || "Not specified"}`,
        `FEIN: ${extractedData["FEIN"] || "XX-XXXXXXX"}`,
        `Primary Location: ${extractedData["Primary Location"] || "Location TBD"}`,
        `States of Operation: ${getStates() || "Not specified"}`,
        `Years in Business: ${getYearsInBusiness() || "Not specified"}`
      ]
      
      clientInfo.forEach(info => {
        addText(info, 10, false, [0, 0, 0])
      })
      
      addLineBreak(10)
      
      // RISK PROFILE SUMMARY section
      addSectionHeader('RISK PROFILE SUMMARY')
      
      // Calculate risk levels based on available data
      const businessType = getBusinessType() || "Not specified"
      const yearsInBusiness = getYearsInBusiness() || "Not specified"
      const lossHistory = getLossHistory() || "Not specified"
      const safetyControls = getSafetyControls() || "Not specified"
      const states = getStates() || "Not specified"
      
      const riskInfo = [
        `Business Type: ${businessType}`,
        `Years in Business: ${yearsInBusiness}`,
        `Loss History: ${lossHistory}`,
        `Safety Controls: ${safetyControls}`,
        `States of Operation: ${states}`
      ]
      
      riskInfo.forEach(info => {
        addText(info, 10, false, [0, 0, 0])
      })
      
      addLineBreak(10)
      
      // RECOMMENDED PACKAGE section
      addSectionHeader('RECOMMENDED PACKAGE')
      
      // Package name
      addText(selectedPackageData?.name || "Essential Coverage", 12, true, [0, 0, 0])
      addText('Comprehensive coverage tailored to your business needs', 10, false, [100, 100, 100])
      addLineBreak(8)
      
      // Premium box
      const boxWidth = 80
      const boxHeight = 25
      const boxX = margin
      const boxY = yPosition - 3
      
      // Box border
      doc.setDrawColor(0, 32, 96) // Blue border
      doc.setLineWidth(1)
      doc.rect(boxX, boxY, boxWidth, boxHeight, 'S')
      
      // Premium amount
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 32, 96) // Blue color
      doc.text(formatCurrency(selectedPackageData?.totalPremium || 0), boxX + 5, boxY + 8)
      
      // Annual Premium label
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text('Annual Premium', boxX + 5, boxY + 13)
      
      // Monthly amount
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(`${formatCurrency(selectedPackageData?.monthlyPremium || 0)}/month`, boxX + 5, boxY + 20)
      
      yPosition += 30
      addLineBreak(10)
      
      // EXECUTIVE SUMMARY section
      addSectionHeader('EXECUTIVE SUMMARY')
      
      const executiveSummaryPoints = [
        `• Based on our comprehensive analysis of ${extractedData["Legal Name"] || "your business"}`,
        `• We recommend the ${selectedPackageData?.name || "Essential Coverage"} insurance package`,
        `• This package best fits your business needs and risk profile`,
        `• Coverage includes comprehensive protection for your operations`,
        `• Competitive rates with flexible payment options available`
      ]
      
      executiveSummaryPoints.forEach(point => {
        addText(point, 10, false, [0, 0, 0], 'left', margin + 5)
      })
      
      // Check if we need a new page - only add if content would overflow
      if (yPosition > pageHeight - 120) {
        doc.addPage()
        yPosition = 20
      }
      
      // RISK ASSESSMENT section
      addSectionHeader('RISK ASSESSMENT')
      addText("Our risk analysis identified several key factors:", 10, false, [0, 0, 0])
      addLineBreak(5)
      
      const riskFactors = [
        "• Business type and operational risks",
        "• Years in business and experience level",
        "• Loss history and claims record",
        "• Safety controls and risk management",
        "• Geographic and regulatory factors"
      ]
      
      riskFactors.forEach(factor => {
        addText(factor, 10, false, [0, 0, 0], 'left', margin + 5)
      })
      addLineBreak(12)
      
      // COVERAGE HIGHLIGHTS section
      addSectionHeader('COVERAGE HIGHLIGHTS')
      addText("Key coverage features of the Essential Coverage package:", 10, false, [0, 0, 0])
      addLineBreak(5)
      
      const coverageFeatures = [
        "• Comprehensive general liability protection",
        "• Property damage and business interruption coverage",
        "• Professional liability and errors & omissions",
        "• Flexible payment options and competitive rates"
      ]
      
      coverageFeatures.forEach(feature => {
        addText(feature, 10, false, [0, 0, 0], 'left', margin + 5)
      })
      addLineBreak(8)
      
      // TERMS & CONDITIONS section
      addSectionHeader('TERMS & CONDITIONS')
      const termsText = [
        "• Coverage is subject to underwriting approval",
        "• Premium is based on current risk assessment",
        "• Policy terms and conditions apply",
        "• Claims are subject to policy limits and deductibles"
      ]
      
      termsText.forEach(term => {
        addText(term, 10, false, [0, 0, 0], 'left', margin + 5)
      })
      
      addLineBreak(8)
      
      // NEXT STEPS section
      addSectionHeader('NEXT STEPS')
      addText("To proceed with this proposal:", 10, false, [0, 0, 0])
      addLineBreak(3)
      
      const nextSteps = [
        "1. Review the terms and conditions",
        "2. Contact us to finalize coverage",
        "3. Complete application process",
        "4. Submit required documentation"
      ]
      
      nextSteps.forEach(step => {
        addText(step, 10, false, [0, 0, 0], 'left', margin + 5)
      })
      addLineBreak(8)
      
      // CONTACT INFORMATION section
      addSectionHeader('CONTACT INFORMATION')
      const contactInfo = [
        "BrokerGenie Insurance Solutions",
        "Email: support@brokergenie.com",
        "Phone: (555) 122 4567"
      ]
      
      contactInfo.forEach(info => {
        addText(info, 10, false, [0, 0, 0], 'left', margin)
      })
      
      addLineBreak(5)
      
      // Footer
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(1)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      
      addText('This proposal is valid for 30 days from the date of issue.', 9, false, [100, 100, 100], 'center')
      addText('Coverage is subject to underwriting approval and payment of premium.', 9, false, [100, 100, 100], 'center')
      
      // Save the PDF
      try {
        const clientName = extractedData["Legal Name"]?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Client'
        const fileName = `Insurance_Proposal_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`
        
        doc.save(fileName)
        alert('2-page Proposal PDF has been generated and saved to your downloads folder!')
      } catch (saveError) {
        console.error('Error saving PDF:', saveError)
        alert('PDF generated successfully but there was an issue saving the file. Please try again.')
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again or contact support.')
    }
  }

  const sendProposalEmail = () => {
    const subject = `Insurance Proposal - ${extractedData["Legal Name"] || "Your Business"}`
    const body = `Dear Client,

Please find attached your personalized insurance proposal.

${proposalData.executiveSummary}

Recommended Package: ${selectedPackageData?.name || "Balanced Protection"}
Annual Premium: ${formatCurrency(selectedPackageData?.totalPremium || 0)}
Monthly Premium: ${formatCurrency(selectedPackageData?.monthlyPremium || 0)}/mo

Please review the proposal and let me know if you have any questions.

Best regards,
BrokerGenie Insurance Solutions
support@brokergenie.com
(555) 123-4567`
    
    const mailtoLink = `mailto:${extractedData["Primary Contact Email"] || "client@example.com"}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const scheduleFollowUp = () => {
    const subject = `Follow-up Meeting - Insurance Proposal Discussion`
    const body = `Hi ${extractedData["Primary Contact Name"] || "there"},

I hope you've had a chance to review the insurance proposal I sent. I'd like to schedule a follow-up meeting to discuss any questions you might have and move forward with the next steps.

Please let me know your availability for a 30-minute call this week.

Best regards,
BrokerGenie Insurance Solutions
support@brokergenie.com
(555) 123-4567`
    
    const mailtoLink = `mailto:${extractedData["Primary Contact Email"] || "client@example.com"}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const generateSampleProposal = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      if (!jsPDF) {
        throw new Error('jsPDF library not available')
      }
      
      const doc = new jsPDF('p', 'mm', 'a4')
      
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      let yPosition = 20
      
      // Helper function to add text with proper alignment
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: number[] = [0, 0, 0], align: 'left' | 'center' | 'right' = 'left', x?: number) => {
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', isBold ? 'bold' : 'normal')
        doc.setTextColor(color[0], color[1], color[2])
        
        const textX = x || margin
        
        if (align === 'center') {
          doc.text(text, pageWidth / 2, yPosition, { align: 'center' })
        } else if (align === 'right') {
          doc.text(text, pageWidth - margin, yPosition, { align: 'right' })
        } else {
          doc.text(text, textX, yPosition)
        }
        
        yPosition += fontSize * 0.4 + 2
      }
      
      // Helper function to add line break
      const addLineBreak = (spacing: number = 8) => {
        yPosition += spacing
      }
      
      // Helper function to add section header
      const addSectionHeader = (title: string) => {
        addLineBreak(3)
        addText(title, 14, true, [0, 32, 96]) // Blue color
        addLineBreak(6)
      }
      
      // Blue header bar
      doc.setFillColor(0, 32, 96) // Blue color
      doc.rect(0, 0, pageWidth, 20, 'F')
      
      // White text on blue header
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text('BROKERGENIE INSURANCE PROPOSAL', pageWidth / 2, 12, { align: 'center' })
      
      yPosition = 35
      
      // Generated date
      addText(`Generated on: ${new Date().toLocaleDateString()}`, 10, false, [0, 0, 0])
      addLineBreak(15)
      
      // CLIENT INFORMATION section
      addSectionHeader('CLIENT INFORMATION')
      
      const clientInfo = [
        `Business Name: Acme Manufacturing Inc.`,
        `Business Type: Manufacturing`,
        `FEIN: 12-3456789`,
        `Primary Location: 123 Industrial Blvd, Detroit, MI 48201`,
        `States of Operation: Michigan, Ohio, Indiana`,
        `Years in Business: 15 years`
      ]
      
      clientInfo.forEach(info => {
        addText(info, 10, false, [0, 0, 0])
      })
      
      addLineBreak(10)
      
      // RISK PROFILE SUMMARY section
      addSectionHeader('RISK PROFILE SUMMARY')
      
      const riskInfo = [
        `Business Type: Manufacturing`,
        `Years in Business: 15 years`,
        `Loss History: Minimal claims`,
        `Safety Controls: Comprehensive safety program`,
        `States of Operation: Michigan, Ohio, Indiana`
      ]
      
      riskInfo.forEach(info => {
        addText(info, 10, false, [0, 0, 0])
      })
      
      addLineBreak(10)
      
      // RECOMMENDED PACKAGE section
      addSectionHeader('RECOMMENDED PACKAGE')
      
      // Package name
      addText("Essential Coverage", 12, true, [0, 0, 0])
      addText('Comprehensive coverage tailored to your business needs', 10, false, [100, 100, 100])
      addLineBreak(8)
      
      // Premium box
      const boxWidth = 80
      const boxHeight = 25
      const boxX = margin
      const boxY = yPosition - 3
      
      // Box border
      doc.setDrawColor(0, 32, 96) // Blue border
      doc.setLineWidth(1)
      doc.rect(boxX, boxY, boxWidth, boxHeight, 'S')
      
      // Premium amount
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 32, 96) // Blue color
      doc.text('$45,000', boxX + 5, boxY + 8)
      
      // Annual Premium label
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text('Annual Premium', boxX + 5, boxY + 13)
      
      // Monthly amount
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('$3,750/month', boxX + 5, boxY + 20)
      
      yPosition += 30
      addLineBreak(10)
      
      // EXECUTIVE SUMMARY section
      addSectionHeader('EXECUTIVE SUMMARY')
      
      const executiveSummaryPoints = [
        `• Based on our comprehensive analysis of Acme Manufacturing Inc.`,
        `• We recommend the Essential Coverage insurance package`,
        `• This package best fits your business needs and risk profile`,
        `• Coverage includes comprehensive protection for your operations`,
        `• Competitive rates with flexible payment options available`
      ]
      
      executiveSummaryPoints.forEach(point => {
        addText(point, 10, false, [0, 0, 0], 'left', margin + 5)
      })
      
      // Check if we need a new page
      if (yPosition > pageHeight - 120) {
        doc.addPage()
        yPosition = 20
      }
      
      // RISK ASSESSMENT section
      addSectionHeader('RISK ASSESSMENT')
      addText("Our risk analysis identified several key factors:", 10, false, [0, 0, 0])
      addLineBreak(5)
      
      const riskFactors = [
        "• Business type and operational risks",
        "• Years in business and experience level",
        "• Loss history and claims record",
        "• Safety controls and risk management",
        "• Geographic and regulatory factors"
      ]
      
      riskFactors.forEach(factor => {
        addText(factor, 10, false, [0, 0, 0], 'left', margin + 5)
      })
      addLineBreak(8)
      
      // COVERAGE HIGHLIGHTS section
      addSectionHeader('COVERAGE HIGHLIGHTS')
      addText("Key coverage features of the Essential Coverage package:", 10, false, [0, 0, 0])
      addLineBreak(5)
      
      const coverageFeatures = [
        "• Comprehensive general liability protection",
        "• Property damage and business interruption coverage",
        "• Professional liability and errors & omissions",
        "• Flexible payment options and competitive rates"
      ]
      
      coverageFeatures.forEach(feature => {
        addText(feature, 10, false, [0, 0, 0], 'left', margin + 5)
      })
      addLineBreak(8)
      
      // TERMS & CONDITIONS section
      addSectionHeader('TERMS & CONDITIONS')
      const termsText = [
        "• Coverage is subject to underwriting approval",
        "• Premium is based on current risk assessment",
        "• Policy terms and conditions apply",
        "• Claims are subject to policy limits and deductibles"
      ]
      
      termsText.forEach(term => {
        addText(term, 10, false, [0, 0, 0], 'left', margin + 5)
      })
      
      addLineBreak(8)
      
      // NEXT STEPS section
      addSectionHeader('NEXT STEPS')
      addText("To proceed with this proposal:", 10, false, [0, 0, 0])
      addLineBreak(3)
      
      const nextSteps = [
        "1. Review the terms and conditions",
        "2. Contact us to finalize coverage",
        "3. Complete application process",
        "4. Submit required documentation"
      ]
      
      nextSteps.forEach(step => {
        addText(step, 10, false, [0, 0, 0], 'left', margin + 5)
      })
      addLineBreak(8)
      
      // CONTACT INFORMATION section
      addSectionHeader('CONTACT INFORMATION')
      const contactInfo = [
        "BrokerGenie Insurance Solutions",
        "Email: support@brokergenie.com",
        "Phone: (555) 122 4567"
      ]
      
      contactInfo.forEach(info => {
        addText(info, 10, false, [0, 0, 0], 'left', margin)
      })
      
      addLineBreak(5)
      
      // Footer
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(1)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      
      addText('This proposal is valid for 30 days from the date of issue.', 9, false, [100, 100, 100], 'center')
      addText('Coverage is subject to underwriting approval and payment of premium.', 9, false, [100, 100, 100], 'center')
      
      // Save the PDF
      try {
        const fileName = `Sample_Insurance_Proposal_${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(fileName)
        alert('Sample Proposal PDF has been generated and saved to your downloads folder!')
      } catch (saveError) {
        console.error('Error saving PDF:', saveError)
        alert('PDF generated successfully but there was an issue saving the file. Please try again.')
      }
      
    } catch (error) {
      console.error('Error generating sample PDF:', error)
      alert('Error generating sample PDF. Please try again or contact support.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">BrokerGenie | Proposal Builder</h1>
        <p className="text-muted-foreground">
          Generate a professional insurance proposal based on your analysis and selected package
        </p>
      </div>

      {/* Client Summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Business Name</Label>
              <p className="font-semibold">{extractedData["Legal Name"] || "Client Business"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Business Type</Label>
              <p className="font-semibold">{getBusinessType()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">FEIN</Label>
              <p className="font-semibold">{extractedData["FEIN"] || "XX-XXXXXXX"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Primary Location</Label>
              <p className="font-semibold">{extractedData["Primary Location"] || "Location TBD"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">States of Operation</Label>
              <p className="font-semibold">{getStates()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Years in Business</Label>
              <p className="font-semibold">{getYearsInBusiness()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Package Summary */}
      <Card className="shadow-sm border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recommended Package
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{selectedPackageData?.name || "Balanced Protection"}</h3>
              <p className="text-muted-foreground">Comprehensive coverage tailored to your business needs</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(selectedPackageData?.totalPremium || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Annual Premium</div>
              <div className="text-lg font-semibold">
                {formatCurrency(selectedPackageData?.monthlyPremium || 0)}/mo
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposal Content */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proposal Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Executive Summary */}
          <div>
            <Label htmlFor="executiveSummary" className="text-base font-semibold">Executive Summary</Label>
            <Textarea
              id="executiveSummary"
              value={proposalData.executiveSummary}
              onChange={(e) => setProposalData(prev => ({ ...prev, executiveSummary: e.target.value }))}
              className="mt-2 min-h-[100px]"
              placeholder="Executive summary will be auto-generated based on your business profile..."
            />
          </div>

          {/* Risk Assessment */}
          <div>
            <Label htmlFor="riskAssessment" className="text-base font-semibold">Risk Assessment</Label>
            <Textarea
              id="riskAssessment"
              value={proposalData.riskAssessment}
              onChange={(e) => setProposalData(prev => ({ ...prev, riskAssessment: e.target.value }))}
              className="mt-2 min-h-[120px]"
              placeholder="Risk assessment will be auto-generated based on your business profile..."
            />
          </div>

          {/* Coverage Highlights */}
          <div>
            <Label htmlFor="coverageHighlights" className="text-base font-semibold">Coverage Highlights</Label>
            <Textarea
              id="coverageHighlights"
              value={proposalData.coverageHighlights}
              onChange={(e) => setProposalData(prev => ({ ...prev, coverageHighlights: e.target.value }))}
              className="mt-2 min-h-[100px]"
              placeholder="Coverage highlights will be auto-generated based on your selected package..."
            />
          </div>

          {/* Next Steps */}
          <div>
            <Label htmlFor="nextSteps" className="text-base font-semibold">Next Steps</Label>
            <Textarea
              id="nextSteps"
              value={proposalData.nextSteps}
              onChange={(e) => setProposalData(prev => ({ ...prev, nextSteps: e.target.value }))}
              className="mt-2 min-h-[100px]"
              placeholder="Next steps will be auto-generated..."
            />
          </div>
        </CardContent>
      </Card>


      {/* Action Buttons */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Proposal Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={generateProposalPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Generate PDF
            </Button>
            <Button variant="outline" onClick={sendProposalEmail} className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Send via Email
            </Button>
            <Button variant="outline" onClick={scheduleFollowUp} className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Follow-up
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end pt-6" />
    </div>
  )
}
