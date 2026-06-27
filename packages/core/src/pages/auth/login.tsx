import Link from "next/link"
import { AuthLayout, AuthDivider } from "@/components/auth/auth-layout"
import { SocialLogin } from "@/components/auth/social-login"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams

  return (
    <AuthLayout
      welcomeLabel="Welcome back"
      title="Sign in to NovaCV"
      subtitle="Continue building your resume."
      alternateText="No account?"
      alternateLink="/register"
      alternateLinkLabel="Sign up free"
    >
      {/* Social Logins */}
      {(process.env.GOOGLE_CLIENT_ID || process.env.GITHUB_CLIENT_ID) && (
        <>
          <SocialLogin 
            googleEnabled={!!process.env.GOOGLE_CLIENT_ID}
            githubEnabled={!!process.env.GITHUB_CLIENT_ID}
          />
          <AuthDivider />
        </>
      )}

      {/* Email + Password Form */}
      <LoginForm message={searchParams?.message} />

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
