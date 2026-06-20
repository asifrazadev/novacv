"use client"

import * as React from "react"
import { useBuilder } from "@/components/builder/builder-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shared/ui/dialog"
import { Button } from "@/components/shared/ui/button"
import { Import, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { parseImportedResume } from "@/lib/import-parser"
import { useAIStore } from "@/store/use-ai-store"
import { extractResumeDataWithAI } from "@/actions/ai"
import { getPdfText } from "@/lib/pdf-client"
import { Loader2 } from "lucide-react"

interface ImportDialogProps {
  trigger?: React.ReactNode
}

export function ImportDialog({ trigger }: ImportDialogProps) {
  const { data, setData } = useBuilder()
  const aiStore = useAIStore()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isHovering, setIsHovering] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsHovering(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    processFile(file)
  }

  const processFile = async (file: File) => {
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
          if (response.error?.includes("503") || response.error?.includes("upstream")) {
            throw new Error("The AI service is currently overloaded or unavailable. Please try again in a few minutes or upload a JSON/NovaCV file instead.")
          }
          throw new Error(response.error || "Failed to process PDF.")
        }

        rawJsonString = JSON.stringify(response.json)
      }

      const parsedData = parseImportedResume(rawJsonString, data.metadata)

      if (parsedData) {
        setData(parsedData)
        setIsOpen(false)
        toast.success("Resume imported successfully!")
      } else {
        toast.error("Failed to parse the resume structure. Ensure it is valid.")
      }
    } catch (e: any) {
      console.error("Import Error:", e)
      const errorMessage = e.message || "An error occurred while importing."

      if (errorMessage.includes("AI Request Failed")) {
        toast.error("AI Service Error", {
          description: errorMessage,
          duration: 5000,
        })
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="outline" size="sm" className="gap-1.5 h-8">
            <Import className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Upload a `.json`, `.novacv`, or `.pdf` file. We leverage AI directly to ingest standard PDFs seamlessly!
          </DialogDescription>
        </DialogHeader>

        <div
          className={`flex flex-col items-center justify-center p-8 mt-4 border-2 border-dashed rounded-lg transition-colors ${isHovering ? "border-primary bg-primary/5" : "border-muted-foreground/25 bg-muted/10"
            }`}
          onDragOver={(e) => { e.preventDefault(); setIsHovering(true) }}
          onDragLeave={() => setIsHovering(false)}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm font-medium">Processing File...</p>
              <p className="text-xs text-muted-foreground mt-1 text-center max-w-[250px]">
                If this is a PDF, AI is currently extracting it. This might take 10-15 seconds.
              </p>
            </div>
          ) : (
            <>
              <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm font-medium text-center">Drag & drop your file here</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4 text-center">or click below to browse</p>
              <input
                type="file"
                accept=".json,application/json,.novacv,.pdf,application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                Browse Files
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
