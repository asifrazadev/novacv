import { AuthLayout } from "@/components/auth/auth-layout"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default async function ResetPasswordPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams

  return (
    <AuthLayout
      welcomeLabel="Security"
      title="Reset your password"
      subtitle="Please enter your new password below."
    >
      <ResetPasswordForm message={searchParams?.message} />
    </AuthLayout>
  )
}
