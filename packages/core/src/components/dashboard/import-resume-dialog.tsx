"use client"

import * as React from "react"
import { FileUp, Sparkles, Upload, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog"
import { Button } from "@/components/shared/ui/button"
import { toast } from "sonner"
import { useAIStore } from "@/store/use-ai-store"
import { getPdfText } from "@/lib/pdf-client"
import { extractResumeDataWithAI } from "@/actions/ai"
import { parseImportedResume } from "@/lib/import-parser"
import { importResumeAndCreate } from "@/actions/resumes"
import { useRouter } from "next/navigation"

interface ImportResumeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportResumeDialog({ open, onOpenChange }: ImportResumeDialogProps) {
  const aiStore = useAIStore()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isHovering, setIsHovering] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processImport(file)
  }

  const processImport = async (file: File) => {
    const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf")
    const isJSON = file.type === "application/json" || file.name.endsWith(".json") || file.name.endsWith(".novacv")

    if (!isPDF && !isJSON) {
      toast.error("Please upload a valid JSON, NovaCV, or PDF file.")
      return
    }

    setIsProcessing(true)
    try {
      let rawJsonString = ""

      if (isJSON) {
        rawJsonString = await file.text()
      } else if (isPDF) {
        toast.info("Extracting text from PDF...")
        const extractedText = await getPdfText(file)


        toast.info("Parsing via AI...")
        const response = await extractResumeDataWithAI(extractedText, {
          provider: aiStore.provider,
          model: aiStore.model,
          baseUrl: aiStore.baseUrl,
          apiKey: aiStore.apiKey
        })

        if (!response.success) {
          throw new Error(response.error || "Failed to process PDF.")
        }

        rawJsonString = JSON.stringify(response.json)
      }

      const parsedData = parseImportedResume(rawJsonString)

      if (parsedData) {
        toast.info("Creating your resume...")
        const result = await importResumeAndCreate(parsedData.title || "Imported Resume", parsedData)

        if (result.success && result.id) {
          toast.success("Resume imported and created successfully!")
          router.push(`/dashboard/resumes/${result.id}`)
          onOpenChange(false)
        } else {
          throw new Error(result.error || "Failed to save the imported resume.")
        }
      } else {
        toast.error("Failed to parse the resume structure. Ensure it is valid.")
      }
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "An error occurred while importing.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/50 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            {isProcessing && (
              <Loader2 className="w-5 h-5 animate-spin text-primary mb-4" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold">Import your resume</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-1">
            Our AI will parse your current resume and magically populate your NovaCV profile.
          </DialogDescription>
        </DialogHeader>

        <div
          className={`py-8 cursor-pointer group`}
          onDragOver={(e) => { e.preventDefault(); setIsHovering(true) }}
          onDragLeave={() => setIsHovering(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsHovering(false)
            if (e.dataTransfer.files?.[0]) processImport(e.dataTransfer.files[0])
          }}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          <div className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all ${isHovering ? "border-primary bg-primary/5" : "border-border/60"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50 hover:bg-primary/5"}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isHovering ? "bg-primary/10" : "bg-muted group-hover:bg-primary/10"
              }`}>
              {isProcessing ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <Upload className={`w-8 h-8 transition-colors ${isHovering ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  }`} />
              )}
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground">
                {isProcessing ? "Processing your file..." : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-muted-foreground">Support for PDF, JSON, and NovaCV files</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.json,.novacv"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isProcessing}>Cancel</Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 shadow-lg shadow-primary/20 gap-2"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileUp className="w-4 h-4" />
            )}
            Process with AI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
