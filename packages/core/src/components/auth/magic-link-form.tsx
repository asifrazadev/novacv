"use client"

import * as React from "react"
import { sendMagicLink } from "@/actions/auth"
import { Input } from "@/components/shared/ui/input"
import { SubmitButton } from "@/components/shared/buttons/submit-button"
import { Mail } from "lucide-react"

export function MagicLinkForm() {
  const [sent, setSent] = React.useState(false)

  async function handleSubmit(formData: FormData) {
    await sendMagicLink(formData)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-md border bg-muted/30 text-xs text-muted-foreground">
        <Mail className="w-4 h-4 shrink-0 text-primary" />
        <span>Check your inbox. We sent you a sign-in link.</span>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="flex gap-2">
      <Input
        name="email"
        type="email"
        placeholder="Sign in with email link"
        required
        autoComplete="email"
        className="h-10 rounded-md border-border/60 text-sm bg-background flex-1"
      />
      <SubmitButton
        loadingText="Sending..."
        variant="outline"
        className="h-10 shrink-0 text-sm font-medium border-border/60"
      >
        <Mail className="w-4 h-4 mr-1.5" />
        Send link
      </SubmitButton>
    </form>
  )
}
