"use client"

import { useState } from "react"
import { AlertCircle, Mail, X } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import { resendVerificationEmail } from "@/actions/auth"

interface VerificationBannerProps {
  email: string
  isVerified: boolean
}

export function VerificationBanner({ email, isVerified }: VerificationBannerProps) {
  const [isVisible, setIsVisible] = useState(!isVerified)
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  if (!isVisible || isVerified) return null

  const handleResend = async () => {
    try {
      setIsSending(true)
      await resendVerificationEmail(email)
      setSent(true)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="px-4 py-3 md:px-8">
      <div className="relative rounded-lg border border-warning/50 bg-warning/10 px-4 py-3 text-warning-foreground shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-warning" />
          <h5 className="font-semibold leading-none tracking-tight text-warning">Verify your email address</h5>
        </div>
        <div className="mt-2 text-sm flex flex-col sm:flex-row sm:items-center gap-3 sm:mt-0 sm:flex-1">
          <span className="opacity-90">
            Please verify your email address to secure your account. Check your inbox at <strong>{email}</strong>.
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-fit shrink-0 border-warning/30 hover:bg-warning/20 hover:text-warning text-xs font-medium"
            onClick={handleResend}
            disabled={isSending || sent}
          >
            <Mail className="mr-1.5 h-3 w-3" />
            {sent ? "Email sent!" : isSending ? "Sending..." : "Resend email"}
          </Button>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-3 rounded-md p-1 opacity-60 hover:opacity-100 hover:bg-warning/20 transition-colors sm:static"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
