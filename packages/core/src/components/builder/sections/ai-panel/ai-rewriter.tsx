"use client"

import * as React from "react"
import { ListPlus, Loader2, Sparkles, Check, Copy } from "lucide-react"
import { useBuilder } from "@/components/builder/builder-context"
import { useAIStore } from "@/store/use-ai-store"
import { Button } from "@/components/shared/ui/button"
import { Textarea } from "@/components/shared/ui/textarea"
import { Label } from "@/components/shared/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/ui/select"
import { rewriteTextWithAI } from "@/actions/ai"
import { toast } from "sonner"

export function AiRewriter() {
  const { data, activeSection, updateBasics, updateSectionItem } = useBuilder()
  const aiStore = useAIStore()

  // Rewriter State
  const [sourceText, setSourceText] = React.useState("")
  const [selectedField, setSelectedField] = React.useState<{ section: string; id?: string; fieldName: string } | null>(null)
  const [tone, setTone] = React.useState("professional")
  const [customPrompt, setCustomPrompt] = React.useState("")
  const [isRewriting, setIsRewriting] = React.useState(false)
  const [rewrittenText, setRewrittenText] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  // --- Quick Pull Fields for Rewriter ---
  const getPullableFields = () => {
    const fields: { label: string; value: string; action: () => void }[] = []

    if (activeSection === "basics") {
      if (data.basics.headline) {
        fields.push({
          label: "Headline",
          value: "headline",
          action: () => {
            setSourceText(data.basics.headline)
            setSelectedField({ section: "basics", fieldName: "headline" })
          }
        })
      }
    } else if (activeSection === "summary") {
      const cleanSummary = (data.sections.summary?.content || "").replace(/<[^>]*>?/gm, '')
      if (cleanSummary) {
        fields.push({
          label: "Summary Content",
          value: "summary",
          action: () => {
            setSourceText(cleanSummary)
            setSelectedField({ section: "summary", fieldName: "content" })
          }
        })
      }
    } else if (activeSection === "experience") {
      data.sections.experience.forEach((exp) => {
        const cleanDesc = (exp.description || "").replace(/<[^>]*>?/gm, '')
        if (cleanDesc) {
          fields.push({
            label: `${exp.position || "Role"} @ ${exp.company || "Company"} Description`,
            value: exp.id,
            action: () => {
              setSourceText(cleanDesc)
              setSelectedField({ section: "experience", id: exp.id, fieldName: "description" })
            }
          })
        }
      })
    } else if (activeSection === "projects") {
      data.sections.projects.forEach((proj) => {
        const cleanDesc = (proj.description || "").replace(/<[^>]*>?/gm, '')
        if (cleanDesc) {
          fields.push({
            label: `${proj.name || "Project"} Description`,
            value: proj.id,
            action: () => {
              setSourceText(cleanDesc)
              setSelectedField({ section: "projects", id: proj.id, fieldName: "description" })
            }
          })
        }
      })
    } else if (activeSection === "education") {
      data.sections.education.forEach((edu) => {
        const cleanDesc = (edu.description || "").replace(/<[^>]*>?/gm, '')
        if (cleanDesc) {
          fields.push({
            label: `${edu.degree || "Degree"} @ ${edu.school || "School"} Description`,
            value: edu.id,
            action: () => {
              setSourceText(cleanDesc)
              setSelectedField({ section: "education", id: edu.id, fieldName: "description" })
            }
          })
        }
      })
    }
    return fields
  }

  const pullableFields = getPullableFields()

  // --- AI Rewriter ---
  const handleRewrite = async () => {
    if (!sourceText.trim()) {
      toast.error("Please enter or pull some text to rewrite.")
      return
    }
    setIsRewriting(true)

    const response = await rewriteTextWithAI(sourceText, tone, {
      provider: aiStore.provider,
      model: aiStore.model,
      baseUrl: aiStore.baseUrl,
      apiKey: aiStore.apiKey
    }, selectedField ? {
      section: selectedField.section,
      fieldName: selectedField.fieldName
    } : undefined, customPrompt.trim() || undefined)

    if (response.success && response.text) {
      setRewrittenText(response.text)
      toast.success("Text rewritten successfully!")
    } else {
      toast.error(response.error || "Failed to rewrite text.")
    }
    setIsRewriting(false)
  }

  const handleCopyRewrite = () => {
    const plainText = rewrittenText
      .replace(/<li>/gi, "• ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
    navigator.clipboard.writeText(plainText)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApplyRewrite = () => {
    if (!selectedField) {
      toast.error("No source field targeted. Copy the text to apply manually.")
      return
    }

    const isPlainTextField = selectedField.section === "basics"

    if (isPlainTextField) {
      updateBasics(selectedField.fieldName, rewrittenText)
      toast.success("Applied to Headline!")
    } else {
      updateSectionItem(
        selectedField.section as any,
        selectedField.id || "",
        selectedField.fieldName,
        rewrittenText
      )
      toast.success("Applied to active item!")
    }
  }

  return (
    <div className="space-y-5 mt-4">
      <div className="space-y-4">
        {/* Quick Pull Controls */}
        {pullableFields.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Quick Pull from active section</Label>
            <div className="flex flex-wrap gap-1.5">
              {pullableFields.map((pf) => (
                <Button
                  key={pf.value}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] border-border/60 hover:bg-muted/50 rounded-md gap-1"
                  onClick={pf.action}
                >
                  <ListPlus className="w-3 h-3" />
                  {pf.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs" htmlFor="source-text">Original Text</Label>
          <Textarea
            id="source-text"
            value={sourceText}
            onChange={(e) => {
              setSourceText(e.target.value)
              setSelectedField(null)
            }}
            placeholder="Enter some bullets, summary, or description to polish..."
            className="min-h-[100px] text-xs resize-y border-border/60 rounded-lg"
          />
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <Label className="text-xs" htmlFor="custom-prompt">What to change <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea
            id="custom-prompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Make it more concise, add metrics, focus on leadership..."
            className="min-h-[64px] text-xs resize-y border-border/60 rounded-lg bg-muted/20"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[130px] space-y-1.5">
            <Label className="text-xs">Style / Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="h-9 text-xs rounded-lg border-border/60">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="ats-optimized">ATS Optimized</SelectItem>
                <SelectItem value="action-oriented">Action Oriented</SelectItem>
                <SelectItem value="concise">Concise & Punchy</SelectItem>
                <SelectItem value="technical">Highly Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[130px] flex items-end">
            <Button
              className="w-full h-9 gap-1.5 text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold"
              onClick={handleRewrite}
              disabled={isRewriting || !sourceText}
            >
              {isRewriting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Rewrite
            </Button>
          </div>
        </div>

        {rewrittenText && (
          <div className="space-y-3 pt-3 border-t border-border/40 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground/80">AI Suggestion</Label>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-md border-border/60"
                  onClick={handleCopyRewrite}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
                {selectedField && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5 rounded-md border-border/60 font-medium"
                    onClick={handleApplyRewrite}
                  >
                    Apply Changes
                  </Button>
                )}
              </div>
            </div>
            <div
              className="rich-text p-3.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl text-xs leading-relaxed text-foreground select-all prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: rewrittenText }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
