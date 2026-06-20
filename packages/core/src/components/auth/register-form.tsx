import { signup } from "@/actions/auth"
import { SubmitButton } from "@/components/shared/buttons/submit-button"
import { Input } from "@/components/shared/ui/input"
import { PasswordInput } from "@/components/shared/ui/password-input"
import { Label } from "@/components/shared/ui/label"
import { FormMessageToast } from "@/components/shared/forms/form-message-toast"
import { RegistrationSuccessModal } from "@/components/auth/registration-success-modal"

interface RegisterFormProps {
  message?: string
  status?: string
}

export function RegisterForm({ message, status }: RegisterFormProps) {
  return (
    <form action={signup} className="space-y-4 relative">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground" htmlFor="full_name">
          Full Name
        </Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          placeholder="John Doe"
          required
          autoComplete="name"
          className="h-10 rounded-md border-border/60 text-sm bg-background"
        />
      </div>

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
        <Label className="text-xs text-muted-foreground" htmlFor="password">
          Password
        </Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete="new-password"
          className="h-10 rounded-md border-border/60 text-sm bg-background"
        />
      </div>

      <SubmitButton
        loadingText="Creating account..."
        className="w-full h-10 rounded-md text-sm font-semibold bg-foreground text-background hover:bg-foreground/90"
      >
        Create account
      </SubmitButton>

      {message && <FormMessageToast message={message} />}

      <RegistrationSuccessModal status={status} />
    </form>
  )
}
