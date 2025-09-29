"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProposalBuilderProps {
  onNext?: () => void
}

export function ProposalBuilder({ onNext }: ProposalBuilderProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">BrokerGenie | Proposal Builder</h1>
        <p className="text-muted-foreground mt-2">Build and customize client-ready proposals with your branding.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Proposal Generation</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            This section will allow you to generate professional proposals with your selected coverage package.
          </p>
          <p className="text-sm text-muted-foreground">
            Features will include proposal templates, branding customization, and client delivery options.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" className="bg-transparent">
          Back: Coverage Comparison
        </Button>
        <Button onClick={onNext}>Next: Activity</Button>
      </div>
    </div>
  )
}
