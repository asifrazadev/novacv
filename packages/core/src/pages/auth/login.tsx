import Link from "next/link"
import { AuthLayout, AuthDivider } from "@/components/auth/auth-layout"
import { SocialLogin } from "@/components/auth/social-login"
import { LoginForm } from "@/components/auth/login-form"
import { MagicLinkForm } from "@/components/auth/magic-link-form"

export default async function LoginPage(props: { searchParams: Promise<{ message?: string; step?: string }> }) {
  const searchParams = await props.searchParams
  const smtpConfigured = !!process.env.SMTP_HOST
  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID
  const githubEnabled = !!process.env.GITHUB_CLIENT_ID
  const hasSocialOrMagic = googleEnabled || githubEnabled || smtpConfigured

  return (
    <AuthLayout
      welcomeLabel="Welcome back"
      title="Sign in to NovaCV"
      subtitle="Continue building your resume."
      alternateText="No account?"
      alternateLink="/register"
      alternateLinkLabel="Sign up free"
    >
      {hasSocialOrMagic && (
        <>
          <div className="space-y-2">
            {(googleEnabled || githubEnabled) && (
              <SocialLogin googleEnabled={googleEnabled} githubEnabled={githubEnabled} />
            )}
            {smtpConfigured && <MagicLinkForm />}
          </div>
          <AuthDivider />
        </>
      )}

      <LoginForm message={searchParams?.message} step={searchParams?.step} />

      <p className="text-center text-xs text-muted-foreground">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="hover:text-foreground transition-colors underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="hover:text-foreground transition-colors underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthLayout>
  )
}
