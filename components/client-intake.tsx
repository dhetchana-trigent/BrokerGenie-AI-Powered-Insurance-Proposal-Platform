"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, MapPin, DollarSign } from "lucide-react"

interface ClientIntakeProps {
  onNext?: () => void
}

interface ClientData {
  id: string
  name: string
  industry: string
  businessName: string
  naicsOperations: string
  states: string
  locations: string
  headcount: string
  revenuePayroll: string
  priorPolicies: string
  desiredLimits: string
  primaryContact: string
  status: "active" | "dummy"
}

const clientOptions: ClientData[] = [
  {
    id: "techflow",
    name: "TechFlow Solutions Inc.",
    industry: "Technology",
    businessName: "TechFlow Solutions Inc.",
    naicsOperations: "541511 - Custom Computer Programming Services",
    states: "CA, NY, TX",
    locations: "3",
    headcount: "45",
    revenuePayroll: "$8,500,000 annual revenue",
    priorPolicies:
      "Current GL policy with Hartford ($1M/$2M limits), Property coverage with Travelers ($2M TIV), Cyber policy with AIG ($1M limit). No recent claims in past 3 years.",
    desiredLimits:
      "General Liability: $2M/$4M, Property: $3M TIV with $5K deductible, Cyber: $2M limit, Professional Liability: $1M/$3M, Employment Practices: $1M",
    primaryContact: "Sarah Johnson, Risk Manager\nsarah.johnson@techflow.com\n(555) 123-4567",
    status: "active"
  },
  {
    id: "dummy",
    name: "Global Manufacturing Corp.",
    industry: "Manufacturing",
    businessName: "Global Manufacturing Corp.",
    naicsOperations: "336310 - Motor Vehicle Gasoline Engine and Engine Parts Manufacturing",
    states: "TX, OH, MI",
    locations: "5",
    headcount: "120",
    revenuePayroll: "$15,200,000 annual revenue",
    priorPolicies:
      "Current GL policy with Chubb ($2M/$4M limits), Property coverage with FM Global ($5M TIV), Workers Comp with Travelers. Two minor claims in past 2 years.",
    desiredLimits:
      "General Liability: $3M/$5M, Property: $6M TIV with $10K deductible, Workers Comp: Statutory, Product Liability: $2M/$4M, Auto: $1M CSL",
    primaryContact: "Michael Rodriguez, Operations Director\nm.rodriguez@globalmfg.com\n(555) 987-6543",
    status: "dummy"
  }
]

export function ClientIntake({ onNext }: ClientIntakeProps) {
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  const [formData, setFormData] = useState<ClientData | null>(null)

  const handleClientSelect = (client: ClientData) => {
    setSelectedClient(client)
    setFormData(client)
  }

  const handleInputChange = (field: string, value: string) => {
    if (formData) {
      setFormData((prev) => prev ? ({ ...prev, [field]: value }) : null)
    }
  }

  if (!selectedClient) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Select Client</h2>
          <p className="text-muted-foreground">Choose a client to proceed with the intake process</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clientOptions.map((client) => (
            <Card 
              key={client.id} 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
              onClick={() => handleClientSelect(client)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {client.name}
                  </CardTitle>
                  <Badge variant={client.status === "active" ? "default" : "secondary"}>
                    {client.status === "active" ? "Active" : "Demo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{client.industry}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{client.states} • {client.locations} locations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{client.headcount} employees</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>{client.revenuePayroll}</span>
                </div>
                <div className="pt-2">
                  <Button className="w-full" variant="outline">
                    Select Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Selected Client Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{selectedClient.name}</h2>
          <p className="text-muted-foreground">Client Intake Form</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedClient(null)
            setFormData(null)
          }}
        >
          Change Client
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData?.businessName || ""}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                placeholder="Enter business name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="naicsOperations">NAICS/Operations</Label>
              <Input
                id="naicsOperations"
                value={formData?.naicsOperations || ""}
                onChange={(e) => handleInputChange("naicsOperations", e.target.value)}
                placeholder="e.g., 541511 - Custom Computer Programming"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="states">States</Label>
              <Input
                id="states"
                value={formData?.states || ""}
                onChange={(e) => handleInputChange("states", e.target.value)}
                placeholder="e.g., CA, NY, TX"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="locations">Locations</Label>
              <Input
                id="locations"
                value={formData?.locations || ""}
                onChange={(e) => handleInputChange("locations", e.target.value)}
                placeholder="Number of locations"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="headcount">Headcount</Label>
              <Input
                id="headcount"
                value={formData?.headcount || ""}
                onChange={(e) => handleInputChange("headcount", e.target.value)}
                placeholder="Number of employees"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="revenuePayroll">Revenue/Payroll</Label>
              <Input
                id="revenuePayroll"
                value={formData?.revenuePayroll || ""}
                onChange={(e) => handleInputChange("revenuePayroll", e.target.value)}
                placeholder="Annual revenue or payroll"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="priorPolicies">Prior Policies</Label>
              <Textarea
                id="priorPolicies"
                value={formData?.priorPolicies || ""}
                onChange={(e) => handleInputChange("priorPolicies", e.target.value)}
                placeholder="Describe current or prior insurance policies"
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Coverage Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="desiredLimits">Desired Limits/Deductibles</Label>
                <Textarea
                  id="desiredLimits"
                  value={formData?.desiredLimits || ""}
                  onChange={(e) => handleInputChange("desiredLimits", e.target.value)}
                  placeholder="Specify desired coverage limits and deductibles"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="primaryContact">Primary Contact</Label>
                <Textarea
                  id="primaryContact"
                  value={formData?.primaryContact || ""}
                  onChange={(e) => handleInputChange("primaryContact", e.target.value)}
                  placeholder="Name, title, email, phone"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" className="bg-transparent">
          Save Draft
        </Button>
        {selectedClient?.id === "techflow" ? (
          <Button onClick={() => onNext?.()}>Next: Upload Documents</Button>
        ) : (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>Demo client - Select TechFlow Solutions Inc. to proceed</span>
          </div>
        )}
      </div>
    </div>
  )
}
