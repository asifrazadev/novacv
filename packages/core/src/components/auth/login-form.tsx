"use client"

import * as React from "react"
import Link from "next/link"
import { login, checkCredentialsForTOTP, loginWithTOTP } from "@/actions/auth"
import { SubmitButton } from "@/components/shared/buttons/submit-button"
import { Input } from "@/components/shared/ui/input"
import { PasswordInput } from "@/components/shared/ui/password-input"
import { Label } from "@/components/shared/ui/label"
import { FormMessageToast } from "@/components/shared/forms/form-message-toast"
import { ShieldCheck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/shared/ui/button"

interface LoginFormProps {
  message?: string
  step?: string
}

export function LoginForm({ message, step: initialStep }: LoginFormProps) {
  const [step, setStep] = React.useState<"credentials" | "totp">(
    initialStep === "totp" ? "totp" : "credentials"
  )
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState(message ?? "")
  const [pending, setPending] = React.useState(false)

  async function handleCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError("")
    try {
      const result = await checkCredentialsForTOTP(email, password)
      if (!result) return // signIn redirected
      if ("error" in result) {
        const msgs: Record<string, string> = {
          invalid_credentials: "Invalid email or password.",
          unverified_email: "Please verify your email. We just sent you a new link.",
        }
        setError((result.error ? msgs[result.error] : undefined) ?? "Sign in failed.")
      } else if (result.totpRequired) {
        setStep("totp")
      }
    } finally {
      setPending(false)
    }
  }

  async function handleTOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError("")
    const totpCode = (e.currentTarget.elements.namedItem("totpCode") as HTMLInputElement).value
    try {
      const result = await loginWithTOTP(email, password, totpCode)
      if (result?.error) setError(result.error)
    } finally {
      setPending(false)
    }
  }

  if (step === "totp") {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
          <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Two-factor authentication</p>
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>
        </div>

        <form onSubmit={handleTOTP} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground" htmlFor="totpCode">
              Authenticator Code
            </Label>
            <Input
              id="totpCode"
              name="totpCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              required
              autoFocus
              autoComplete="one-time-code"
              className="h-10 rounded-md border-border/60 text-sm bg-background tracking-[0.4em] text-center font-mono"
            />
          </div>

          <SubmitButton
            loadingText="Verifying..."
            className="w-full h-10 rounded-md text-sm font-semibold bg-foreground text-background hover:bg-foreground/90"
            disabled={pending}
          >
            Verify
          </SubmitButton>
        </form>

        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8 text-xs text-muted-foreground gap-1.5"
          onClick={() => { setStep("credentials"); setError("") }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Button>

        {error && <FormMessageToast message={error} />}
      </div>
    )
  }

  return (
    <form onSubmit={handleCredentials} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground" htmlFor="email">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="h-10 rounded-md border-border/60 text-sm bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground" htmlFor="password">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="h-10 rounded-md border-border/60 text-sm bg-background"
        />
      </div>

      <SubmitButton
        loadingText="Signing in..."
        className="w-full h-10 rounded-md text-sm font-semibold bg-foreground text-background hover:bg-foreground/90"
        disabled={pending}
      >
        Sign in
      </SubmitButton>

      {error && <FormMessageToast message={error} />}
    </form>
  )
}
