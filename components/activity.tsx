"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, User, CheckCircle } from "lucide-react"

export function Activity() {
  const activities = [
    {
      id: 1,
      type: "proposal",
      title: "Proposal generated for ABC Manufacturing",
      description: "Balanced package selected with $12,400-$13,400 annual premium",
      timestamp: "2 hours ago",
      status: "completed",
      icon: FileText,
    },
    {
      id: 2,
      type: "extraction",
      title: "AI extraction completed",
      description: "Processed 4 documents: ACORD, SOV, Loss Runs, Prior Policy",
      timestamp: "3 hours ago",
      status: "completed",
      icon: CheckCircle,
    },
    {
      id: 3,
      type: "client",
      title: "New client intake started",
      description: "ABC Manufacturing - Texas manufacturing operation",
      timestamp: "4 hours ago",
      status: "in-progress",
      icon: User,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "in-progress":
        return "bg-blue-100 text-blue-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">BrokerGenie | Activity</h1>
        <p className="text-muted-foreground mt-2">Track recent activities and workflow progress.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border border-border">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <activity.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{activity.title}</h3>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
