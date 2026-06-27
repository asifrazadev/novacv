"use client"

import * as React from "react"
import { Target, PenTool, Brain, Sparkles, FileText, Timer } from "lucide-react"
import { useBuilder, useBuilderUI } from "@/components/builder/builder-context"
import { ScrollArea } from "@/components/shared/ui/scroll-area"
import { Button } from "@/components/shared/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shared/ui/tooltip"
import { AtsScoring } from "./ats-scoring"
import { AiRewriter } from "./ai-rewriter"
import { AiSuggestions } from "./ai-suggestions"
import { CoverLetter } from "./cover-letter"
import { SixSecondScan } from "./six-second-scan"
import { calculateCleanStats, extractResumeText } from "./utils"

const AI_TABS = [
  { id: "ats" as const, icon: Target, label: "ATS Score" },
  { id: "rewrite" as const, icon: PenTool, label: "AI Rewriter" },
  { id: "suggest" as const, icon: Brain, label: "Suggestions" },
  { id: "coverletter" as const, icon: FileText, label: "Cover Letter" },
  { id: "scan" as const, icon: Timer, label: "6-Sec Scan" },
]

export function AIPanel() {
  const { data, resumePreviewRef, activeAiTab, setActiveAiTab, showAiPanel, setShowAiPanel } = useBuilder()
  const { mobileView } = useBuilderUI()

  const { charCount, wordCount } = React.useMemo(
    () => calculateCleanStats(data),
    [data]
  )

  const getRenderedText = (): string => {
    const domText = resumePreviewRef?.current?.innerText?.trim()
    if (domText && domText.length > 50) return domText
    return extractResumeText(data)
  }

  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024)
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isPanelVisible = showAiPanel || (!isDesktop && mobileView === "ai")

  const handleTabClick = (tabId: "ats" | "rewrite" | "suggest" | "coverletter" | "scan") => {
    if (!isPanelVisible) {
      setActiveAiTab(tabId)
      setShowAiPanel(true)
    } else {
      if (activeAiTab === tabId) {
        if (mobileView !== "ai") {
          setShowAiPanel(false)
        }
      } else {
        setActiveAiTab(tabId)
      }
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full w-full overflow-hidden select-none font-sans bg-background">
        {/* Active Tab Panel Content (Left side of the AI sidebar) */}
        {isPanelVisible && (
          <div id="tour-builder-ai-panel" className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
            <div className="p-4 border-b border-border/40 bg-muted/20 backdrop-blur-md flex items-center justify-between min-h-[57px] shrink-0">
              <h2 className="text-xs font-bold tracking-wider uppercase text-foreground/75 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                {activeAiTab === "ats" ? "ATS Score" : activeAiTab === "rewrite" ? "AI Rewriter" : activeAiTab === "suggest" ? "Suggestions" : activeAiTab === "coverletter" ? "Cover Letter" : "6-Sec Scan"}
              </h2>
              {/* Close button for overlay/drawer */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 xl:hidden text-muted-foreground hover:text-foreground"
                onClick={() => setShowAiPanel(false)}
              >
                <span className="sr-only">Close panel</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <ScrollArea className="flex-1 w-full overflow-x-hidden">
              <div className="p-4 pb-20 w-full min-w-0 space-y-6">
                {activeAiTab === "ats" && (
                  <AtsScoring getRenderedText={getRenderedText} wordCount={wordCount} charCount={charCount} />
                )}
                {activeAiTab === "rewrite" && (
                  <AiRewriter />
                )}
                {activeAiTab === "suggest" && (
                  <AiSuggestions />
                )}
                {activeAiTab === "coverletter" && (
                  <CoverLetter />
                )}
                {activeAiTab === "scan" && (
                  <SixSecondScan />
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* AI Rail (Right side of the AI sidebar) */}
        <div
          id="tour-builder-ai-rail"
          className={`${isPanelVisible
              ? "w-14  items-center justify-center py-4"
              : "w-38 items-stretch px-2.5 py-6 justify-center"
            } flex flex-col gap-4 border-l border-border/40 bg-muted/10 shrink-0 h-full overflow-y-auto scrollbar-hide`}
        >
          {AI_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeAiTab === tab.id && isPanelVisible

            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`h-9 transition-all duration-200 rounded-md ${isPanelVisible
                        ? "w-9 p-0"
                        : "w-full px-3 py-2 justify-start gap-2.5"
                      } ${isActive
                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    {!isPanelVisible && (
                      <span className="text-[10px] font-bold tracking-wider uppercase text-foreground/80 truncate">
                        {tab.label}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{tab.label}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
