import { redirect } from "next/navigation"

export default function PreferencesPage() {
  redirect("/dashboard/profile?tab=preferences")
}
