import { resetPassword } from "@/actions/auth"
import { SubmitButton } from "@/components/shared/buttons/submit-button"
import { PasswordInput } from "@/components/shared/ui/password-input"
import { Label } from "@/components/shared/ui/label"
import { FormMessageToast } from "@/components/shared/forms/form-message-toast"

interface ResetPasswordFormProps {
  message?: string
}

export function ResetPasswordForm({ message }: ResetPasswordFormProps) {
  return (
    <form action={resetPassword} className="space-y-4">
      <input type="hidden" name="redirectTo" value="/reset-password" />

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground" htmlFor="password">
          New Password
        </Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          className="h-10 rounded-md border-border/60 text-sm bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground" htmlFor="confirm_password">
          Confirm New Password
        </Label>
        <PasswordInput
          id="confirm_password"
          name="confirm_password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          className="h-10 rounded-md border-border/60 text-sm bg-background"
        />
      </div>

      <SubmitButton
        loadingText="Updating..."
        className="w-full h-10 rounded-md text-sm font-semibold bg-foreground text-background hover:bg-foreground/90"
      >
        Update Password
      </SubmitButton>

      {message && <FormMessageToast message={message} />}
    </form>
  )
}
