"use client"

import * as React from "react"
import { Target, Loader2, Zap, Plus } from "lucide-react"
import { useAIStore } from "@/store/use-ai-store"
import { useBuilder } from "@/components/builder/builder-context"
import { Button } from "@/components/shared/ui/button"
import { analyzeResumeWithAI } from "@/actions/ai"
import { toast } from "sonner"
import { cn } from "@/lib/utils"


export interface AtsAnalyzerProps {
  getRenderedText: () => string;
  jobDescription: string;
}

export function AtsAnalyzer({ getRenderedText, jobDescription }: AtsAnalyzerProps) {
  const aiStore = useAIStore()
  const { data } = useBuilder()
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [atsResult, setAtsResult] = React.useState<{ score: number; summary: string; suggestions: string[] } | null>(null)

  const buildResumeText = () => {
    const resumeText = getRenderedText()

    // Inject ground-truth section facts the AI must not contradict
    const summaryText = (data.sections.summary?.content ?? "").replace(/<[^>]*>/g, "").trim()
    const experienceCount = data.sections.experience?.length ?? 0
    const educationCount = data.sections.education?.length ?? 0
    const projectCount = data.sections.projects?.length ?? 0
    const skillCount = data.sections.skills?.length ?? 0

    const facts = [
      `VERIFIED RESUME FACTS (authoritative — never contradict these in suggestions):`,
      `- Professional summary: ${summaryText.length > 0 ? `PRESENT ("${summaryText.slice(0, 80)}${summaryText.length > 80 ? "…" : ""}")` : "ABSENT"}`,
      `- Experience entries: ${experienceCount}`,
      `- Education entries: ${educationCount}`,
      `- Project entries: ${projectCount}`,
      `- Skill groups: ${skillCount}`,
    ].join("\n")

    return `${facts}\n\n${resumeText}`
  }

  const handleAnalyze = async () => {
    setAtsResult(null)
    setIsAnalyzing(true)
    const response = await analyzeResumeWithAI(
      buildResumeText(),
      { provider: aiStore.provider, model: aiStore.model, baseUrl: aiStore.baseUrl, apiKey: aiStore.apiKey },
      jobDescription.trim() || undefined
    )
    if (response.success && response.result) {
      setAtsResult(response.result)
      toast.success("ATS analysis complete!")
    } else {
      toast.error(response.error || "Failed to analyze resume.")
    }
    setIsAnalyzing(false)
  }

  const scoreColor = !atsResult ? "text-primary" : atsResult.score > 80 ? "text-success" : atsResult.score > 60 ? "text-warning" : "text-destructive"
  const scoreBg = !atsResult ? "bg-primary/5 border-primary/20" : atsResult.score > 80 ? "bg-success/10 border-success/20" : atsResult.score > 60 ? "bg-warning/10 border-warning/20" : "bg-destructive/10 border-destructive/20"

  return (
    <div className="p-4 rounded-xl border border-border/40 bg-muted/5 backdrop-blur-xs space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">AI ATS Score</span>
      </div>

      {atsResult && (
        <div className={cn("flex flex-col items-center justify-center p-4 rounded-xl border", scoreBg)}>
          <span className={cn("text-4xl font-black tabular-nums", scoreColor)}>{atsResult.score}</span>
          <span className="text-xs text-muted-foreground mt-1">out of 100</span>
          <div className="w-full bg-muted/30 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700",
                atsResult.score > 80 ? "bg-success" : atsResult.score > 60 ? "bg-warning" : "bg-destructive"
              )}
              style={{ width: `${atsResult.score}%` }}
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="w-full h-9 text-xs font-semibold gap-2"
        size="sm"
      >
        {isAnalyzing
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Analyzing…</>
          : <><Zap className="w-3.5 h-3.5" />{atsResult ? "Re-analyze" : "Analyze with AI"}</>
        }
      </Button>

      {atsResult && (
        <div className="space-y-3">
          {atsResult.summary && (
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-xs text-foreground/80 leading-relaxed">
              {atsResult.summary}
            </div>
          )}
          {atsResult.suggestions?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Suggestions</p>
              {atsResult.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/10 border border-border/20 text-xs">
                  <Plus className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground/80 leading-snug">{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
