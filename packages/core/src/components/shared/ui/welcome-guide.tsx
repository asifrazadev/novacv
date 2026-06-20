"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/shared/ui/button"
import { Sparkles, ArrowRight, ArrowLeft, X } from "lucide-react"

export interface WelcomeFeature {
  icon: React.ReactNode
  title: string
  description: string
}

export interface TourStep {
  title: string
  description: string
  selector?: string
}

export interface WelcomeGuideProps {
  storageKey: string
  title: string
  description: string
  features: WelcomeFeature[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  steps?: TourStep[]
  onStepChange?: (stepIndex: number) => void
}

export function WelcomeGuide({ storageKey, title, description, features, open, onOpenChange, steps: customSteps, onStepChange }: WelcomeGuideProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(0)
  const [rect, setRect] = React.useState<DOMRect | null>(null)
  const [modalStyle, setModalStyle] = React.useState<React.CSSProperties>({
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  })

  const steps: TourStep[] = React.useMemo(() => {
    if (customSteps && customSteps.length > 0) {
      return customSteps
    }
    return [
      {
        title: "Welcome to NovaCV 👋",
        description: "A quick 60-second tour of your workspace dashboard. Learn how to build and manage your resumes with ease.",
        // Center welcome modal
      },
      {
        title: "Dashboard Navigation 🧭",
        description: "Navigate easily between your Resumes, Job Application Tracker, Profile settings, and AI setups.",
        selector: "#tour-sidebar",
      },
      {
        title: "Create from Scratch 📝",
        description: "Build a brand new resume step-by-step with real-time layout rendering, sections, and dynamic AI guidance.",
        selector: "#tour-create-scratch",
      },
      {
        title: "Import & Parse Documents 📤",
        description: "Already have a resume? Upload a PDF or JSON file and let our parser structure your data instantly.",
        selector: "#tour-import-resume",
      },
      {
        title: "Your Document Hub 📂",
        description: "All your created documents appear here. You can edit, duplicate, delete, or export them to pixel-perfect PDFs.",
        selector: "#tour-recent-resumes",
      }
    ]
  }, [customSteps])

  React.useEffect(() => {
    const hasSeen = localStorage.getItem(storageKey)
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        setCurrentStep(0)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [storageKey])

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
      if (open) {
        setCurrentStep(0)
      }
    }
  }, [open])

  React.useEffect(() => {
    if (isOpen && onStepChange) {
      onStepChange(currentStep)
    }
  }, [isOpen, currentStep, onStepChange])

  const handleClose = () => {
    localStorage.setItem(storageKey, "true")
    setIsOpen(false)
    if (onOpenChange) {
      onOpenChange(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleClose()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const step = steps[currentStep]

  // Track the target element's bounding client rect and check overlap
  const updatePosition = React.useCallback(() => {
    if (!step?.selector) {
      setRect(null)
      setModalStyle({
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      })
      return
    }
    const targets = document.querySelectorAll(step.selector)
    const target = Array.from(targets).find((el) => {
      const targetRect = el.getBoundingClientRect()
      return targetRect.width > 0 && targetRect.height > 0
    }) || targets[0]

    if (target) {
      const targetRect = target.getBoundingClientRect()
      setRect(targetRect)

      const modalWidth = 460
      const modalHeight = 240
      const viewWidth = window.innerWidth
      const viewHeight = window.innerHeight

      if (viewWidth < 768) {
        // On small screens, keep it centered
        setModalStyle({
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        })
        return
      }

      // Check if target overlaps with the center modal area
      const modalLeft = viewWidth / 2 - modalWidth / 2
      const modalRight = viewWidth / 2 + modalWidth / 2
      const modalTop = viewHeight / 2 - modalHeight / 2
      const modalBottom = viewHeight / 2 + modalHeight / 2

      const isOverlapping = !(
        targetRect.right < modalLeft ||
        targetRect.left > modalRight ||
        targetRect.bottom < modalTop ||
        targetRect.top > modalBottom
      )

      if (isOverlapping) {
        // Shift modal horizontally to the side of the target element's center
        const targetCenterX = targetRect.left + targetRect.width / 2
        const sidebar = document.querySelector("#tour-sidebar")
        const sidebarRight = sidebar ? sidebar.getBoundingClientRect().right : 0
        const spaceOnLeft = targetRect.left - sidebarRight

        if (targetCenterX < viewWidth / 2 || spaceOnLeft < modalWidth + 32) {
          // Target is on the left, or not enough space on left -> place modal on the right side
          setModalStyle({
            top: "50%",
            left: `${viewWidth - modalWidth - 40}px`,
            transform: "translate(0, -50%)",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          })
        } else {
          // Target is on the right, and enough space on left -> place modal on the left side
          setModalStyle({
            top: "50%",
            left: `${Math.max(40, sidebarRight + 24)}px`,
            transform: "translate(0, -50%)",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          })
        }
      } else {
        // Keep centered
        setModalStyle({
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        })
      }
    } else {
      setRect(null)
      setModalStyle({
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      })
    }
  }, [step])

  // Recalculate target positions on window updates or step changes
  React.useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener("resize", updatePosition)
      window.addEventListener("scroll", updatePosition)
      
      // Sidebar slide-in transitions take 200ms, so run updates multiple times 
      // to capture and align layout positions before, during, and after transition
      const t1 = setTimeout(updatePosition, 50)
      const t2 = setTimeout(updatePosition, 150)
      const t3 = setTimeout(updatePosition, 350)
      
      return () => {
        window.removeEventListener("resize", updatePosition)
        window.removeEventListener("scroll", updatePosition)
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }
  }, [isOpen, step, updatePosition])

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Manage target element stacking levels dynamically based on current step
  React.useEffect(() => {
    if (!isOpen) return

    const targets = step?.selector ? document.querySelectorAll(step.selector) : []
    const targetElement = Array.from(targets).find((el) => {
      const rect = el.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    }) as HTMLElement | null || (targets[0] as HTMLElement | null)

    if (targetElement) {
      const originalZIndex = targetElement.style.zIndex
      const originalPosition = targetElement.style.position

      targetElement.style.zIndex = "95"
      
      const computedPosition = window.getComputedStyle(targetElement).position
      if (computedPosition === "static") {
        targetElement.style.position = "relative"
      }

      // Also temporarily elevate the z-index of the parent sidebar container
      // to ensure the entire right-side panel sits on top of the z-90 overlay
      const parentStackingContext = targetElement.closest("#tour-builder-ai-sidebar") as HTMLElement | null
      const originalParentZIndex = parentStackingContext ? parentStackingContext.style.zIndex : null
      if (parentStackingContext) {
        parentStackingContext.style.zIndex = "95"
      }

      return () => {
        targetElement.style.zIndex = originalZIndex
        targetElement.style.position = originalPosition
        if (parentStackingContext && originalParentZIndex !== null) {
          parentStackingContext.style.zIndex = originalParentZIndex
        }
      }
    }
  }, [isOpen, step])

  if (!isOpen || !mounted) return null

  return createPortal(
    <>
      {/* Target Element Outline Mask with Full Screen Backdrop via giant Box Shadow */}
      {step.selector && rect && (
        <div
          className="fixed border-4 border-white rounded-lg z-[96] pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: `${rect.top - 6}px`,
            left: `${rect.left - 6}px`,
            width: `${rect.width + 12}px`,
            height: `${rect.height + 12}px`,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.65), 0 0 15px rgba(255, 255, 255, 0.4)"
          }}
        />
      )}

      {/* Backdrop overlay for step 0 (welcome modal without target selector) */}
      {!step.selector && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-[1.5px] z-[90] transition-all duration-300" />
      )}

      {/* Centered Modal Guide Box */}
      <div
        style={modalStyle}
        className="fixed z-[100] w-[calc(100%-32px)] sm:w-[460px] bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-250 select-none font-sans"
      >

        {/* Header Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            {currentStep === 0 ? "Introduction" : `Tour Step ${currentStep} of ${steps.length - 1}`}
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 0 Content: Welcome Details List */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>

            <div className="grid gap-2.5 max-h-[280px] overflow-y-auto pr-1">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 rounded-xl border border-border/30 bg-muted/20">
                  <div className="shrink-0 mt-0.5 p-1.5 bg-background border shadow-xs rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-foreground/90">{feature.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1+ Content: Tooltip details */}
        {currentStep > 0 && (
          <div className="space-y-2.5 py-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">{step.title}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        )}

        {/* Footer Navigation bar */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? "bg-primary w-4.5" : "bg-muted-foreground/30 w-1.5"
                  }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
              Skip
            </Button>
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handleBack} className="h-8 text-xs gap-1.5 cursor-pointer font-medium">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>
            )}
            <Button size="sm" onClick={handleNext} className="h-8 text-xs gap-1.5 font-bold cursor-pointer">
              {currentStep === steps.length - 1 ? "Finish" : "Next"} <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
