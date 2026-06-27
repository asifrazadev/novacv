"use client"

import * as React from "react"
import { FileText, Copy, Check, Sparkles } from "lucide-react"
import { useBuilder } from "@/components/builder/builder-context"
import { useAIStore } from "@/store/use-ai-store"
import { Button } from "@/components/shared/ui/button"
import { Textarea } from "@/components/shared/ui/textarea"
import { Label } from "@/components/shared/ui/label"
import { generateCoverLetterWithAI } from "@/actions/ai"
import { extractResumeText } from "./utils"
import { toast } from "sonner"

export function CoverLetter() {
  const { data, resumePreviewRef } = useBuilder()
  const aiStore = useAIStore()
  const [jd, setJd] = React.useState("")
  const [result, setResult] = React.useState<string | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const getResumeText = (): string => {
    const domText = resumePreviewRef?.current?.innerText?.trim()
    if (domText && domText.length > 50) return domText
    return extractResumeText(data)
  }

  const handleGenerate = async () => {
    if (!jd.trim()) {
      toast.error("Paste a job description first.")
      return
    }
    setIsGenerating(true)
    setResult(null)

    const response = await generateCoverLetterWithAI(getResumeText(), jd, {
      provider: aiStore.provider,
      model: aiStore.model,
      baseUrl: aiStore.baseUrl,
      apiKey: aiStore.apiKey,
    })

    setIsGenerating(false)

    if (response.success && response.text) {
      setResult(response.text)
    } else {
      toast.error(response.error || "Failed to generate cover letter.")
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    toast.success("Cover letter copied to clipboard.")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5 mt-4">
      <div className="space-y-1.5">
        <Label className="text-xs" htmlFor="cl-jd">Job Description</Label>
        <Textarea
          id="cl-jd"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description here…"
          className="min-h-[120px] text-xs rounded-lg border-border/60 resize-y"
        />
      </div>

      <Button
        size="sm"
        className="w-full h-9 text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold gap-2"
        onClick={handleGenerate}
        disabled={isGenerating || !jd.trim()}
      >
        {isGenerating ? (
          <>
            <span className="w-3 h-3 border-2 border-background border-t-transparent rounded-full animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" />
            Generate Cover Letter
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              Cover Letter
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="p-3 rounded-xl border border-border/40 bg-muted/10 text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">
            {result}
          </div>
        </div>
      )}

      {!result && !isGenerating && (
        <div className="text-center py-8 border border-dashed rounded-xl border-border/60 bg-muted/5">
          <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
            Paste a job description and generate a tailored cover letter based on your resume.
          </p>
        </div>
      )}
    </div>
  )
}
