import * as React from "react"
import { toast } from "sonner"
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
  // Track consecutive failures to avoid spamming toasts
  const failCountRef = React.useRef(0)

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
          failCountRef.current += 1
          console.error("Auto-save failed:", result.error)
          // Only show a toast on the first failure to avoid spam
          if (failCountRef.current === 1) {
            toast.error("Changes couldn't be saved", {
              description: "Check your connection — we'll keep trying.",
              duration: 5000,
            })
          }
        } else {
          lastSavedRef.current = currentStr
          failCountRef.current = 0
        }
      } catch (error) {
        failCountRef.current += 1
        console.error("Auto-save failed:", getErrorMessage(error))
        if (failCountRef.current === 1) {
          toast.error("Changes couldn't be saved", {
            description: "Check your connection — we'll keep trying.",
            duration: 5000,
          })
        }
      } finally {
        setIsSaving(false)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [data, title, resumeId, setIsSaving])
}
