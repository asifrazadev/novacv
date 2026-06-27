import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { ProfileTabsClient } from "@/components/dashboard/profile-tabs"
import { FormMessageToast } from "@/components/shared/forms/form-message-toast"

export default async function ProfilePage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams
  const session = await auth()

  let userProfile = null
  if (session?.user?.id) {
    const [row] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    if (row) {
      userProfile = {
        email: row.email,
        emailVerified: row.emailVerified,
        user_metadata: {
          full_name: row.name,
          professional_title: row.professionalTitle,
          bio: row.bio,
        },
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile details, theme preferences, security, AI configurations, and social accounts.</p>
      </div>

      <Suspense fallback={<div className="h-40 w-full animate-pulse bg-muted/20 rounded-xl" />}>
        <ProfileTabsClient 
          user={userProfile} 
          googleEnabled={!!process.env.GOOGLE_CLIENT_ID}
          githubEnabled={!!process.env.GITHUB_CLIENT_ID}
        />
      </Suspense>

      {searchParams?.message && (
        <FormMessageToast message={searchParams.message} />
      )}
    </div>
  )
}
