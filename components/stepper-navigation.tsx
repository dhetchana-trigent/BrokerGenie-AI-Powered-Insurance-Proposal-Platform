"use client"

import { cn } from "@/lib/utils"
import { Check, Home } from "lucide-react"

interface Step {
  id: string
  title: string
  completed?: boolean
}

const steps: Step[] = [
  { id: "client-intake", title: "BrokerGenie" },
  { id: "upload-preview", title: "Upload & Preview" },
  { id: "extract-ai", title: "Extract with AI" },
  { id: "risk-profile", title: "Risk Profile" },
  { id: "carrier-fit", title: "Carrier Fit & Compliance" },
  { id: "package-builder", title: "Package Builder" },
  { id: "quote-options", title: "Quote Options & Pricing" },
  { id: "coverage-comparison", title: "Coverage Comparison" },
  { id: "proposal-builder", title: "Proposal Builder" },
  { id: "activity", title: "Activity" },
]

interface StepperNavigationProps {
  currentStep: string
  onStepChange: (stepId: string) => void
}

export function StepperNavigation({ currentStep, onStepChange }: StepperNavigationProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep)

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border shadow-sm">
      <div className="p-5">
        <button onClick={() => (window.location.href = "/")} className="block w-full text-left">
          <img
            src="/trigent-logo.svg"
            alt="Trigent"
            className="h-11 w-auto"
            style={{ imageRendering: "crisp-edges" }}
          />
        </button>
      </div>

      <div className="border-b border-black/8"></div>

      <div className="pt-4 px-4">
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-sidebar-accent/10 text-sidebar-foreground font-serif text-sm mb-4"
        >
          <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-sidebar-border text-sidebar-foreground">
            <Home className="w-4 h-4" />
          </div>
          <span className="flex-1 leading-tight">Home</span>
        </button>
      </div>

      <div className="px-4 space-y-2">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = index < currentIndex
          const isClickable = index <= currentIndex

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepChange(step.id)}
              disabled={!isClickable}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors font-serif text-sm",
                isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                !isActive && isClickable && "hover:bg-sidebar-accent/10 text-sidebar-foreground",
                !isClickable && "text-muted-foreground cursor-not-allowed opacity-50",
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
                  isCompleted && "bg-sidebar-accent text-sidebar-accent-foreground",
                  isActive && !isCompleted && "bg-sidebar-accent text-sidebar-accent-foreground",
                  !isActive && !isCompleted && !isClickable && "bg-muted text-muted-foreground",
                  !isActive && !isCompleted && isClickable && "bg-sidebar-border text-sidebar-foreground",
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className="flex-1 leading-tight">{step.title}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
