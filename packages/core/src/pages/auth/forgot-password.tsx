import { AuthLayout } from "@/components/auth/auth-layout"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default async function ForgotPasswordPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams

  return (
    <AuthLayout
      welcomeLabel="Security"
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a link to reset it."
      alternateText="Remembered password?"
      alternateLink="/login"
      alternateLinkLabel="Log in"
    >
      <ForgotPasswordForm message={searchParams?.message} />
    </AuthLayout>
  )
}
