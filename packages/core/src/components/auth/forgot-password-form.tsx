import { forgotPassword } from "@/actions/auth"
import { SubmitButton } from "@/components/shared/buttons/submit-button"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { FormMessageToast } from "@/components/shared/forms/form-message-toast"

interface ForgotPasswordFormProps {
  message?: string
}

export function ForgotPasswordForm({ message }: ForgotPasswordFormProps) {
  return (
    <form action={forgotPassword} className="space-y-4">
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

      <SubmitButton
        loadingText="Sending..."
        className="w-full h-10 rounded-md text-sm font-semibold bg-foreground text-background hover:bg-foreground/90"
      >
        Send Reset Link
      </SubmitButton>

      {message && <FormMessageToast message={message} />}
    </form>
  )
}
