import * as React from "react"
import { toast } from "sonner"
import { ResumeData } from "@/types/resume"
import { exportResumeToPDF } from "@/lib/export/exportPdf"
import { exportResumeToDocx } from "@/lib/export/exportDocx"
import { exportResumeToTxt } from "@/lib/export-txt"

export function usePrintExport(resumeId: string, title: string, data: ResumeData) {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExportPDF = React.useCallback(async () => {
    setIsExporting(true)
    const success = await exportResumeToPDF(resumeId, `${title || "resume"}.pdf`)
    if (success) {
      toast.success("Resume exported successfully!")
    } else {
      toast.error("Failed to export resume. Please try again.")
    }
    setIsExporting(false)
    return success
  }, [resumeId, title])

  const handleExportDocx = React.useCallback(async () => {
    setIsExporting(true)
    const success = await exportResumeToDocx(data, `${title || "resume"}.docx`)
    if (success) {
      toast.success("Resume exported as Word Document successfully!")
    } else {
      toast.error("Failed to export Word Document. Please try again.")
    }
    setIsExporting(false)
    return success
  }, [data, title])

  const handleExportTxt = React.useCallback(() => {
    const success = exportResumeToTxt(data, `${title || "resume"}.txt`)
    if (success) {
      toast.success("Resume exported as plain text successfully!")
    } else {
      toast.error("Failed to export plain text resume.")
    }
    return success
  }, [data, title])

  const handleExportBackup = React.useCallback((extension: ".json" | ".novacv") => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title || "resume"}${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`Backup exported successfully as ${extension}!`)
      return true
    } catch (e) {
      toast.error("Failed to export backup.")
      return false
    }
  }, [data, title])

  return {
    isExporting,
    handleExportPDF,
    handleExportDocx,
    handleExportTxt,
    handleExportBackup,
  }
}
