"use client"

import * as React from "react"
import { Brain, Sparkles, Copy } from "lucide-react"
import { useBuilder } from "@/components/builder/builder-context"
import { useAIStore } from "@/store/use-ai-store"
import { Button } from "@/components/shared/ui/button"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { suggestContentWithAI } from "@/actions/ai"
import { toast } from "sonner"

export function AiSuggestions() {
  const { activeSection } = useBuilder()
  const aiStore = useAIStore()

  // Content Suggestions State
  const [jobTitle, setJobTitle] = React.useState("")
  const [isSuggesting, setIsSuggesting] = React.useState(false)
  const [suggestionsResult, setSuggestionsResult] = React.useState<{ suggestions: string[]; keywords: string[] } | null>(null)

  const handleGetSuggestions = async () => {
    if (!jobTitle.trim()) {
      toast.error("Please enter a target job title.")
      return
    }
    setIsSuggesting(true)

    const response = await suggestContentWithAI(activeSection, jobTitle, {
      provider: aiStore.provider,
      model: aiStore.model,
      baseUrl: aiStore.baseUrl,
      apiKey: aiStore.apiKey
    })

    if (response.success && response.result) {
      setSuggestionsResult(response.result)
      toast.success("Suggestions loaded!")
    } else {
      toast.error(response.error || "Failed to fetch suggestions.")
    }
    setIsSuggesting(false)
  }

  const handleCopySuggestionText = (txt: string) => {
    navigator.clipboard.writeText(txt)
    toast.success("Copied suggestion to clipboard!")
  }

  return (
    <div className="space-y-5 mt-4">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs" htmlFor="job-title">Target Job Title</Label>
          <div className="flex gap-2">
            <Input
              id="job-title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="h-9 text-xs rounded-lg border-border/60"
            />
            <Button
              size="sm"
              className="h-9 text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 shrink-0 font-semibold"
              onClick={handleGetSuggestions}
              disabled={isSuggesting || !jobTitle}
            >
              {isSuggesting ? (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-background border-t-transparent rounded-full animate-spin" />
                </span>
              ) : (
                <Brain className="w-3.5 h-3.5" />
              )}
              Suggest
            </Button>
          </div>
        </div>

        {suggestionsResult ? (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Keywords */}
            {suggestionsResult.keywords.length > 0 && (
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Keywords</Label>
                <div className="flex flex-wrap gap-1.5">
                  {suggestionsResult.keywords.map((kw, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-muted/40 border border-border/40 hover:bg-muted/80 cursor-pointer transition-colors"
                      onClick={() => handleCopySuggestionText(kw)}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                      <span>{kw}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bullet Points */}
            {suggestionsResult.suggestions.length > 0 && (
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Example Statements</Label>
                <div className="space-y-2.5">
                  {suggestionsResult.suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="group relative p-3 bg-muted/20 hover:bg-muted/40 border border-border/30 hover:border-border/60 transition-all rounded-xl text-xs leading-relaxed flex items-start gap-3 cursor-pointer"
                      onClick={() => handleCopySuggestionText(s)}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground/90 pr-6">{s}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                      >
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed rounded-xl border-border/60 bg-muted/5">
            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
              Enter your target role and click Suggest to generate custom recommendations for the <span className="font-semibold">{activeSection}</span> section.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
