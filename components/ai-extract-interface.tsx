"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Edit3, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useExtraction } from "@/lib/extraction-context"

interface ExtractedEntity {
  field: string
  value: string
  source: string
  category: string
  editable: boolean
}

interface ExtractionProgress {
  document: string
  status: "pending" | "processing" | "complete"
  progress: number
  type: string
}

interface AIExtractInterfaceProps {
  onNext?: () => void
}

const mockExtractionProgress: ExtractionProgress[] = [
  { document: "ACORD_125.pdf", status: "complete", progress: 100, type: "ACORD" },
  { document: "loss_runs_2021-2024.pdf", status: "complete", progress: 100, type: "Loss Runs" },
  { document: "property_SOV.xlsx", status: "complete", progress: 100, type: "SOV" },
  { document: "prior_declarations.pdf", status: "complete", progress: 100, type: "Prior Policy" },
]

const mockExtractedData: ExtractedEntity[] = [
  // Client & Operations
  {
    field: "Legal Name",
    value: "Acme Manufacturing Inc.",
    source: "ACORD_125.pdf, Page 1",
    category: "client",
    editable: true,
  },
  {
    field: "FEIN",
    value: "12-3456789",
    source: "ACORD_125.pdf, Page 1",
    category: "client",
    editable: true,
  },
  {
    field: "NAICS Code",
    value: "332710 - Machine Shops",
    source: "ACORD_125.pdf, Page 1",
    category: "client",
    editable: true,
  },
  {
    field: "Years in Business",
    value: "15",
    source: "ACORD_125.pdf, Page 2",
    category: "client",
    editable: true,
  },
  {
    field: "Loss History",
    value: "2 claims / 3 years",
    source: "loss_runs_2021-2024.pdf, Summary",
    category: "client",
    editable: true,
  },
  {
    field: "Business Type",
    value: "Manufacturing",
    source: "ACORD_125.pdf, Page 1",
    category: "client",
    editable: true,
  },

  // Locations
  {
    field: "Primary Location",
    value: "1234 Industrial Blvd, Houston, TX 77001",
    source: "ACORD_125.pdf, Page 2",
    category: "locations",
    editable: true,
  },
  {
    field: "Coastal Indicator",
    value: "No",
    source: "property_SOV.xlsx, Row 2",
    category: "locations",
    editable: true,
  },
  {
    field: "Brush Fire Zone",
    value: "Low Risk",
    source: "property_SOV.xlsx, Row 3",
    category: "locations",
    editable: true,
  },
  {
    field: "States",
    value: "Texas (TX)",
    source: "ACORD_125.pdf, Page 2",
    category: "locations",
    editable: true,
  },

  // Loss History
  {
    field: "2023 Loss - Date",
    value: "03/15/2023",
    source: "loss_runs_2021-2024.pdf, Page 1",
    category: "losses",
    editable: true,
  },
  {
    field: "2023 Loss - Cause",
    value: "Equipment Breakdown",
    source: "loss_runs_2021-2024.pdf, Page 1",
    category: "losses",
    editable: true,
  },
  {
    field: "2023 Loss - Paid",
    value: "$45,000",
    source: "loss_runs_2021-2024.pdf, Page 1",
    category: "losses",
    editable: true,
  },
  {
    field: "2022 Loss - Date",
    value: "08/22/2022",
    source: "loss_runs_2021-2024.pdf, Page 2",
    category: "losses",
    editable: true,
  },
  {
    field: "2022 Loss - Cause",
    value: "Slip and Fall",
    source: "loss_runs_2021-2024.pdf, Page 2",
    category: "losses",
    editable: true,
  },
  {
    field: "2022 Loss - Paid",
    value: "$12,500",
    source: "loss_runs_2021-2024.pdf, Page 2",
    category: "losses",
    editable: true,
  },

  // Property Values
  {
    field: "Total Insured Value",
    value: "$2,500,000",
    source: "property_SOV.xlsx, Row 1",
    category: "property",
    editable: true,
  },
  {
    field: "Construction Type",
    value: "Masonry Non-Combustible",
    source: "property_SOV.xlsx, Row 4",
    category: "property",
    editable: true,
  },
  {
    field: "Roof Age",
    value: "8 years",
    source: "property_SOV.xlsx, Row 5",
    category: "property",
    editable: true,
  },
  {
    field: "Sprinkler System",
    value: "Full Coverage",
    source: "property_SOV.xlsx, Row 6",
    category: "property",
    editable: true,
  },
  {
    field: "Safety Controls",
    value: "Sprinklers, Security",
    source: "property_SOV.xlsx, Row 7",
    category: "property",
    editable: true,
  },

  // Coverage Requests
  {
    field: "General Liability",
    value: "$1M/$2M",
    source: "ACORD_125.pdf, Page 3",
    category: "coverage",
    editable: true,
  },
  {
    field: "Property Coverage",
    value: "$2.5M",
    source: "ACORD_125.pdf, Page 3",
    category: "coverage",
    editable: true,
  },
  {
    field: "Umbrella Coverage",
    value: "$5M",
    source: "ACORD_125.pdf, Page 4",
    category: "coverage",
    editable: true,
  },
  {
    field: "Cyber Liability",
    value: "Requested",
    source: "ACORD_125.pdf, Page 4",
    category: "coverage",
    editable: true,
  },
]

function AIExtractInterface({ onNext }: AIExtractInterfaceProps) {
  const { updateExtractedData } = useExtraction()
  const [extractionComplete, setExtractionComplete] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedEntity[]>(mockExtractedData)
  const [editValue, setEditValue] = useState("")

  useEffect(() => {
    // Simulate extraction process
    const timer = setTimeout(() => {
      setExtractionComplete(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const filteredData = extractedData

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue)
  }

  const handleSaveEdit = (field: string) => {
    setExtractedData((prev) =>
      prev.map((item) => (item.field === field ? { ...item, value: editValue } : item)),
    )
    // Update the context with the new value
    updateExtractedData(field, editValue)
    setEditingField(null)
    setEditValue("")
  }

  const handleCancelEdit = () => {
    setEditingField(null)
    setEditValue("")
  }


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">BrokerGenie | Extract with AI (Parse & Prefill)</h1>
        <p className="text-muted-foreground mt-2">
          {extractionComplete
            ? "Extraction complete. Review and accept the prefilled fields. Sources are cited alongside each value."
            : "Processing your documents with AI extraction..."}
        </p>
      </div>

      {/* Progress Panel */}
      {!extractionComplete && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Extraction Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockExtractionProgress.map((item) => (
                <div key={item.document} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif text-sm">{item.document}</span>
                      <Badge variant="outline">{item.type}</Badge>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                  {item.status === "complete" && <CheckCircle className="h-5 w-5 text-green-600" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {extractionComplete && (
        <>
          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <Button variant="outline" className="font-serif bg-transparent">
              Accept All
            </Button>
          </div>

          {/* Entities Table */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Extracted Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className=" w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.field}>
                      <TableCell className=" font-medium">{item.field}</TableCell>
                      <TableCell>
                        {editingField === item.field ? (
                          <div className="flex items-center gap-2">
                            <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8" />
                            <Button size="sm" onClick={() => handleSaveEdit(item.field)} className="h-8 w-8 p-0">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="h-8 w-8 p-0 bg-transparent"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          item.value
                        )}
                      </TableCell>
                      <TableCell className=" text-sm text-muted-foreground">{item.source}</TableCell>
                      <TableCell>
                        {item.editable && editingField !== item.field && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(item.field, item.value)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Parsed Sections */}
          <Tabs defaultValue="client" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="client">Client & Operations</TabsTrigger>
              <TabsTrigger value="locations">Locations/States</TabsTrigger>
              <TabsTrigger value="losses">Loss History</TabsTrigger>
              <TabsTrigger value="property">Property Values</TabsTrigger>
              <TabsTrigger value="coverage">Coverage Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="client">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Client & Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extractedData
                      .filter((item) => item.category === "client")
                      .map((item) => (
                        <div key={item.field}>
                          <Label>{item.field}</Label>
                          <div className="mt-1">
                            <Input value={item.value} readOnly />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 ">Source: {item.source}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Locations/States</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {extractedData
                      .filter((item) => item.category === "locations")
                      .map((item) => (
                        <div key={item.field}>
                          <Label>{item.field}</Label>
                          <div className="mt-1">
                            <Input value={item.value} readOnly />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 ">Source: {item.source}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="losses">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Loss History (3-5 Years)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">2023 Loss</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {extractedData
                        .filter((item) => item.category === "losses" && item.field.includes("2023"))
                        .map((item) => (
                          <div key={item.field}>
                            <Label>{item.field.replace("2023 Loss - ", "")}</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input value={item.value} readOnly className="flex-1" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ">Source: {item.source}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className=" font-semibold">2022 Loss</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {extractedData
                        .filter((item) => item.category === "losses" && item.field.includes("2022"))
                        .map((item) => (
                          <div key={item.field}>
                            <Label>{item.field.replace("2022 Loss - ", "")}</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input value={item.value} readOnly className="flex-1" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-serif">Source: {item.source}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="property">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Property Values / SOV</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extractedData
                      .filter((item) => item.category === "property")
                      .map((item) => (
                        <div key={item.field}>
                          <Label>{item.field}</Label>
                          <div className="mt-1">
                            <Input value={item.value} readOnly />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 ">Source: {item.source}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coverage">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-sans">Requested Coverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extractedData
                      .filter((item) => item.category === "coverage")
                      .map((item) => (
                        <div key={item.field}>
                          <Label className="font-serif">{item.field}</Label>
                          <div className="mt-1">
                            <Input value={item.value} readOnly />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-serif">Source: {item.source}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" className="font-serif bg-transparent">
          Back: Upload & Preview
        </Button>
        <Button
          className="font-serif"
          disabled={!extractionComplete}
          onClick={() => {
            console.log("[v0] Continue button clicked, calling onNext")
            onNext?.()
          }}
        >
          Next: Carrier Fit & Compliance
        </Button>
      </div>
    </div>
  )
}

export default AIExtractInterface
