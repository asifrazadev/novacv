import DashboardLayoutClient from "@/pages/layouts/dashboard-layout"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { VerificationBanner } from "@/components/dashboard/verification-banner"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  let isVerified = true // Default true to avoid flash of banner if session is missing
  let email = session?.user?.email || ""

  if (session?.user?.id) {
    const [user] = await db.select({ emailVerified: users.emailVerified }).from(users).where(eq(users.id, session.user.id)).limit(1)
    if (user) {
      isVerified = !!user.emailVerified
    }
  }

  return (
    <DashboardLayoutClient>
      <VerificationBanner email={email} isVerified={isVerified} />
      {children}
    </DashboardLayoutClient>
  )
}
