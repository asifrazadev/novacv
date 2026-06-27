"use client"

import * as React from "react"
import { useBuilder, useBuilderUI } from "@/components/builder/builder-context"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { sections, design } from "@/components/builder/sidebar-rail"
import { exportResumeToPDF } from "@/lib/export/exportPdf"
import { SidebarRail } from "@/components/builder/sidebar-rail"
import { SidebarPanel } from "@/components/builder/sidebar-panel"
import { PreviewCanvas } from "@/components/builder/preview-canvas"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/shared/ui/scroll-area"
import { Button } from "@/components/shared/ui/button"
import { AIPanel } from "@/components/builder/sections/ai-panel/ai-panel"
import { Sparkles, PenLine, Eye, MoveVertical, FileDown } from "lucide-react"
import { WelcomeGuide } from "@/components/shared/ui/welcome-guide"

const BUILDER_FEATURES = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "AI Studio",
    description: "Click the Sparkles icon or open the AI Studio panel to auto-generate summaries and rewrite bullet points."
  },
  {
    icon: <MoveVertical className="w-5 h-5" />,
    title: "Drag & Drop Sections",
    description: "Grab any section from the left sidebar and drag it to reorder or move it between the Main and Sidebar columns."
  },
  {
    icon: <FileDown className="w-5 h-5" />,
    title: "Blazing Fast Export",
    description: "Click Export in the header to instantly generate a pixel-perfect PDF using self-hosted fonts."
  }
]

const BUILDER_STEPS = [
  {
    title: "Welcome to the Resume Builder 🚀",
    description: "This is your workspace. Customize your resume, reorder sections, write content, and get real-time AI assistance."
  },
  {
    title: "Edit Sections ✍️",
    description: "Click on any section item on the left panel (e.g. Basics, Experience, Skills) to edit its content directly.",
    selector: "#tour-builder-sidebar"
  },
  {
    title: "Live Preview 📊",
    description: "Watch your resume update in real-time as you type. Adjust zoom settings at the bottom toolbar.",
    selector: "#tour-builder-preview"
  },
  {
    title: "AI Studio Rail 🤖",
    description: "Access various AI Copilot tools on this vertical rail. Switch between ATS Scoring, AI Rewriting, and Smart Suggestions.",
    selector: "#tour-builder-ai-rail"
  },
  {
    title: "AI Copilot Panel 🧠",
    description: "Read details, trigger actions, or see recommendations from the active AI Copilot tool right here.",
    selector: "#tour-builder-ai-panel"
  },
  {
    title: "Export & Download 📥",
    description: "Once ready, click here to export your resume as a pixel-perfect PDF, Word document, or backup json file.",
    selector: "#tour-builder-export"
  }
]

export function BuilderMain() {
  const { mobileView, setMobileView, showAiPanel, setShowAiPanel, tourOpen, setTourOpen } = useBuilderUI()
  const { activeSection, setActiveSection, data, resumeId, title } = useBuilder()

  const allSectionIds = React.useMemo(() => [
    ...sections.map(s => s.id),
    ...((data?.sections as any)?.customSections?.map((s: any) => s.id) ?? []),
    ...design.map(s => s.id),
  ], [(data?.sections as any)?.customSections])

  useKeyboardShortcuts({
    onToggleAiPanel: () => setShowAiPanel(prev => !prev),
    onCloseSection: () => setActiveSection(""),
    onNextSection: () => {
      if (!activeSection) { setActiveSection(allSectionIds[0]); return }
      const idx = allSectionIds.indexOf(activeSection)
      if (idx < allSectionIds.length - 1) setActiveSection(allSectionIds[idx + 1])
    },
    onPrevSection: () => {
      if (!activeSection) return
      const idx = allSectionIds.indexOf(activeSection)
      setActiveSection(idx <= 0 ? "" : allSectionIds[idx - 1])
    },
    onExportPDF: () => exportResumeToPDF(resumeId, `${title || "resume"}.pdf`),
  })
  const [aiWidth, setAiWidth] = React.useState(380)
  const [isResizing, setIsResizing] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [screenWidth, setScreenWidth] = React.useState(0)

  React.useEffect(() => {
    setIsMounted(true)
    setScreenWidth(window.innerWidth)

    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const stopResizing = React.useCallback(() => {
    setIsResizing(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  const resize = React.useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= 280 && newWidth <= 600) {
        setAiWidth(newWidth)
      }
    }
  }, [isResizing])

  React.useEffect(() => {
    window.addEventListener("mousemove", resize)
    window.addEventListener("mouseup", stopResizing)
    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [resize, stopResizing])

  const handleStepChange = React.useCallback((stepIndex: number) => {
    if (stepIndex === 3 || stepIndex === 4) {
      setShowAiPanel(true)
    } else {
      setShowAiPanel(false)
    }

    // Automatically transition mobileView so target elements become visible on mobile screens
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      if (stepIndex === 1) {
        setMobileView("editor")
      } else if (stepIndex === 2) {
        setMobileView("preview")
      } else if (stepIndex === 3 || stepIndex === 4) {
        setMobileView("ai")
      }
    }
  }, [setShowAiPanel, setMobileView])

  React.useEffect(() => {
    if (!tourOpen) {
      setShowAiPanel(false)
    }
  }, [tourOpen, setShowAiPanel])

  return (
    <main className="flex-1 max-w-full flex overflow-hidden relative pb-16 lg:pb-0">
      <WelcomeGuide
        storageKey="nova_guide_builder"
        title="Welcome to the Builder"
        description="Here is a quick tour of your workspace capabilities:"
        features={BUILDER_FEATURES}
        steps={BUILDER_STEPS}
        open={tourOpen}
        onOpenChange={setTourOpen}
        onStepChange={handleStepChange}
      />
      {/* Sidebar Rail */}
      <div className={cn(
        "flex shrink-0",
        mobileView === "editor" ? "flex" : "hidden lg:flex"
      )}>
        <SidebarRail />
      </div>

      {/* Editor Panel */}
      <div className={cn(
        "min-w-0 overflow-hidden lg:flex-none lg:flex",
        mobileView === "editor" ? "flex flex-1" : "hidden"
      )}>
        {activeSection !== "" && (
          <SidebarPanel />
        )}
      </div>

      {/* Preview Canvas */}
      <div className={cn(
        "flex-1 bg-muted/20 overflow-hidden lg:flex",
        mobileView === "preview" ? "flex" : "hidden"
      )}>
        <PreviewCanvas />
      </div>

      {/* Mobile AI Panel Content Pane */}
      <div className={cn(
        "flex-1 bg-background flex flex-col h-full overflow-hidden lg:hidden",
        mobileView === "ai" ? "flex" : "hidden"
      )}>
        <div className="flex-1 w-full min-h-0 overflow-hidden">
          <AIPanel />
        </div>
      </div>



      {/* Dedicated Right-Side AI Copilot Sidebar */}
      <div
        id="tour-builder-ai-sidebar"
        className={cn(
          "hidden lg:flex lg:relative lg:z-0 lg:shadow-none lg:h-full bg-background border-l border-border/40 overflow-hidden transition-all duration-200 ease-in-out flex-col"
        )}
        style={{
          width: isMounted
            ? (showAiPanel
              ? (screenWidth < 640 ? "100vw" : `${aiWidth}px`)
              : "152px")
            : "380px"
        }}
      >
        {/* Resize Handle */}
        {showAiPanel && (
          <div
            className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-primary/30 transition-colors z-50 hidden sm:block"
            onMouseDown={startResizing}
          />
        )}
        <div className="flex-1 w-full min-h-0 overflow-hidden">
          <AIPanel />
        </div>
      </div>

      {/* Mobile Bottom Navigation Tabs */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around z-50 lg:hidden px-4 shadow-lg">
        <button
          onClick={() => setMobileView("editor")}
          className={cn(
            "flex flex-col items-center gap-1 text-[11px] font-semibold transition-all py-1 px-3 rounded-lg border-none bg-transparent cursor-pointer",
            mobileView === "editor" ? "text-primary animate-in zoom-in-95 duration-100" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <PenLine className="w-5 h-5" />
          <span>Builder</span>
        </button>

        <button
          onClick={() => setMobileView("preview")}
          className={cn(
            "flex flex-col items-center gap-1 text-[11px] font-semibold transition-all py-1 px-3 rounded-lg border-none bg-transparent cursor-pointer",
            mobileView === "preview" ? "text-primary animate-in zoom-in-95 duration-100" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Eye className="w-5 h-5" />
          <span>Preview</span>
        </button>

        <button
          onClick={() => setMobileView("ai")}
          className={cn(
            "flex flex-col items-center gap-1 text-[11px] font-semibold transition-all py-1 px-3 rounded-lg border-none bg-transparent cursor-pointer",
            mobileView === "ai" ? "text-primary animate-in zoom-in-95 duration-100" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>AI Studio</span>
        </button>
      </div>
    </main>
  )
}
