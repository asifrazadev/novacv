import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { ProfileTabsClient } from "@/components/dashboard/profile-tabs"
import { FormMessageToast } from "@/components/shared/forms/form-message-toast"

export default async function ProfilePage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile details, theme preferences, security, AI configurations, and social accounts.</p>
      </div>

      <Suspense fallback={<div className="h-40 w-full animate-pulse bg-muted/20 rounded-xl" />}>
        <ProfileTabsClient user={user} />
      </Suspense>

      {searchParams?.message && (
        <FormMessageToast message={searchParams.message} />
      )}
    </div>
  )
}
