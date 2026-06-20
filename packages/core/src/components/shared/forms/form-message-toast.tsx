"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

export function FormMessageToast({ message }: { message: string }) {
  const toastShown = useRef<string | null>(null)

  useEffect(() => {
    if (message && toastShown.current !== message) {
      const isSuccess = message.toLowerCase().includes('success') || 
                        message.toLowerCase().includes('sent') ||
                        message.toLowerCase().includes('updated')
      
      if (isSuccess) {
        toast.success(message)
      } else {
        toast.error(message)
      }
      toastShown.current = message
    }
  }, [message])

  return null
}
