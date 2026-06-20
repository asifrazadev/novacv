// src/lib/export/exportPdf.ts
/**
 * Export the resume to PDF using the server-side Playwright API.
 */
import { getErrorMessage } from '@/lib/error-handler'

export async function exportResumeToPDF(
  resumeId: string,
  filename: string = "resume.pdf"
): Promise<boolean> {
  try {
    const response = await fetch(`/api/resumes/${resumeId}/pdf`)

    if (!response.ok) {
      let errorData: Record<string, unknown> = {}
      try {
        errorData = await response.json()
      } catch {
        // If response is not JSON, continue with empty error data
      }
      const errorMessage = (typeof errorData.error === 'string' ? errorData.error : null) || `Failed to generate PDF (HTTP ${response.status})`
      throw new Error(errorMessage)
    }

    // Process the PDF blob
    const blob = await response.blob()
    
    if (blob.size === 0) {
      throw new Error('Generated PDF is empty')
    }

    const url = window.URL.createObjectURL(blob)

    // Trigger download
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", filename.endsWith(".pdf") ? filename : `${filename}.pdf`)
    document.body.appendChild(link)
    link.click()

    // Cleanup
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)

    return true
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("[export-pdf] PDF generation failed:", message)
    return false
  }
}
