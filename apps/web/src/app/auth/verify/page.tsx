import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"
import { verifyEmailToken } from "@/actions/auth"
import { Button } from "@/components/shared/ui/button"

export default async function VerifyEmailPage(props: { searchParams: Promise<{ token?: string }> }) {
  const searchParams = await props.searchParams
  const token = searchParams.token

  if (!token) {
    redirect("/login")
  }

  const result = await verifyEmailToken(token)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="max-w-md w-full p-8 border border-border/50 rounded-2xl bg-card shadow-sm text-center">
        {result.success ? (
          <>
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-3">Email Verified!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for verifying your email address. Your account is now secure.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard">Continue to Dashboard</Link>
            </Button>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-3">Verification Failed</h1>
            <p className="text-muted-foreground mb-8">
              {result.error || "The verification link is invalid or has expired. Please request a new one from your dashboard."}
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
