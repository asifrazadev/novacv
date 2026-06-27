"use client"

import * as React from "react"
import { Timer, ThumbsUp, AlertCircle, Zap } from "lucide-react"
import { useBuilder } from "@/components/builder/builder-context"
import { useAIStore } from "@/store/use-ai-store"
import { Button } from "@/components/shared/ui/button"
import { sixSecondScanWithAI } from "@/actions/ai"
import { extractResumeText } from "./utils"
import { toast } from "sonner"

interface ScanResult {
  firstSeen: string
  strengths: string[]
  concerns: string[]
  verdict: string
}

export function SixSecondScan() {
  const { data, resumePreviewRef } = useBuilder()
  const aiStore = useAIStore()
  const [result, setResult] = React.useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = React.useState(false)

  const buildResumeText = (): string => {
    const domText = resumePreviewRef?.current?.innerText?.trim()
    const resumeText = domText && domText.length > 50 ? domText : extractResumeText(data)

    const summaryText = (data.sections.summary?.content ?? "").replace(/<[^>]*>/g, "").trim()
    const facts = [
      `VERIFIED RESUME FACTS (ground truth — never contradict these):`,
      `- Professional summary: ${summaryText.length > 0 ? `PRESENT ("${summaryText.slice(0, 80)}${summaryText.length > 80 ? "…" : ""}")` : "ABSENT"}`,
      `- Experience entries: ${data.sections.experience?.length ?? 0}`,
      `- Education entries: ${data.sections.education?.length ?? 0}`,
      `- Project entries: ${data.sections.projects?.length ?? 0}`,
      `- Skill groups: ${data.sections.skills?.length ?? 0}`,
    ].join("\n")

    return `${facts}\n\n${resumeText}`
  }

  const handleScan = async () => {
    setIsScanning(true)
    setResult(null)

    const response = await sixSecondScanWithAI(buildResumeText(), {
      provider: aiStore.provider,
      model: aiStore.model,
      baseUrl: aiStore.baseUrl,
      apiKey: aiStore.apiKey,
    })

    setIsScanning(false)

    if (response.success && response.result) {
      setResult(response.result)
    } else {
      toast.error(response.error || "Scan failed. Check your AI settings.")
    }
  }

  return (
    <div className="space-y-5 mt-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Simulates a recruiter&apos;s first-glance scan of your resume. The critical 6 seconds that decide whether you get a callback.
      </p>

      <Button
        size="sm"
        className="w-full h-9 text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold gap-2"
        onClick={handleScan}
        disabled={isScanning}
      >
        {isScanning ? (
          <>
            <span className="w-3 h-3 border-2 border-background border-t-transparent rounded-full animate-spin" />
            Scanning…
          </>
        ) : (
          <>
            <Timer className="w-3.5 h-3.5" />
            Run 6-Second Scan
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* First seen */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-warning" />
              First impression
            </p>
            <p className="text-xs leading-relaxed p-3 rounded-xl border border-warning/20 bg-warning/5 text-foreground/90">
              {result.firstSeen}
            </p>
          </div>

          {/* Strengths */}
          {result.strengths.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ThumbsUp className="w-3 h-3 text-success" />
                What stands out
              </p>
              <div className="space-y-1.5">
                {result.strengths.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2.5 rounded-lg border border-success/20 bg-success/5 text-xs text-foreground/90"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concerns */}
          {result.concerns.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 text-destructive" />
                Immediate concerns
              </p>
              <div className="space-y-1.5">
                {result.concerns.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2.5 rounded-lg border border-destructive/20 bg-destructive/5 text-xs text-foreground/90"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verdict */}
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Recruiter verdict</p>
            <p className="text-xs leading-relaxed text-foreground/90 italic">&quot;{result.verdict}&quot;</p>
          </div>
        </div>
      )}

      {!result && !isScanning && (
        <div className="text-center py-8 border border-dashed rounded-xl border-border/60 bg-muted/5">
          <Timer className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
            Run the scan to see what a recruiter notices and misses in your first 6 seconds.
          </p>
        </div>
      )}
    </div>
  )
}
