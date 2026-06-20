import { login } from "@/actions/auth"
import Link from "next/link"
import { SubmitButton } from "@/components/shared/buttons/submit-button"
import { Input } from "@/components/shared/ui/input"
import { PasswordInput } from "@/components/shared/ui/password-input"
import { Label } from "@/components/shared/ui/label"
import { FormMessageToast } from "@/components/shared/forms/form-message-toast"

interface LoginFormProps {
  message?: string
}

export function LoginForm({ message }: LoginFormProps) {
  return (
    <form action={login} className="space-y-4">
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
          className="h-10 rounded-md border-border/60 text-sm bg-background"
        />
      </div>

      <SubmitButton
        loadingText="Signing in..."
        className="w-full h-10 rounded-md text-sm font-semibold bg-foreground text-background hover:bg-foreground/90"
      >
        Sign in
      </SubmitButton>

      {message && <FormMessageToast message={message} />}
    </form>
  )
}
