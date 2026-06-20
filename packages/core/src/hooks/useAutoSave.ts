import * as React from "react"
import { ResumeData } from "@/types/resume"
import { updateResume } from "@/actions/resumes"
import { getErrorMessage } from "@/lib/error-handler"

export function useAutoSave(
  resumeId: string,
  data: ResumeData,
  title: string,
  setIsSaving: (isSaving: boolean) => void
) {
  const lastSavedRef = React.useRef(JSON.stringify({ data, title }))

  React.useEffect(() => {
    const currentStr = JSON.stringify({ data, title })
    if (currentStr === lastSavedRef.current) {
      return
    }

    const timer = setTimeout(async () => {
      setIsSaving(true)
      try {
        const result = await updateResume(resumeId, data, title)
        if (result && "error" in result && result.error) {
          console.error("Auto-save failed:", result.error)
        } else {
          lastSavedRef.current = currentStr
        }
      } catch (error) {
        console.error("Auto-save failed:", getErrorMessage(error))
      } finally {
        setIsSaving(false)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [data, title, resumeId, setIsSaving])
}
