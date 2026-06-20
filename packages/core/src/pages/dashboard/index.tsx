import * as React from "react"
import { getResumes } from "@/actions/resumes"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

export default async function DashboardPage() {
  const resumes = await getResumes()

  return <DashboardClient initialResumes={resumes} />
}
