import Link from "next/link"
import { AuthLayout, AuthDivider } from "@/components/auth/auth-layout"
import { SocialLogin } from "@/components/auth/social-login"
import { RegisterForm } from "@/components/auth/register-form"

export default async function RegisterPage(props: { searchParams: Promise<{ message: string, status?: string }> }) {
  const searchParams = await props.searchParams

  return (
    <AuthLayout
      welcomeLabel="Join us"
      title="Create an account"
      subtitle="Join NovaCV to start building your professional resume."
      alternateText="Already have an account?"
      alternateLink="/login"
      alternateLinkLabel="Sign in"
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

      {/* Sign Up Form */}
      <RegisterForm message={searchParams?.message} status={searchParams?.status} />

      <p className="text-center text-xs text-muted-foreground">
        By signing up, you agree to our{" "}
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
