import { BuilderProvider } from "@/components/builder/builder-context"
import { BuilderHeader } from "@/components/builder/builder-header"
import { BuilderMain } from "@/components/builder/builder-main"
import { getResumeById } from "@/actions/resumes"
import { redirect } from "next/navigation"
import { ResumeData } from "@/types/resume"

export default async function BuilderPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const resume = await getResumeById(params.id)

  if (!resume) {
    redirect("/dashboard")
  }

  return (
    <BuilderProvider initialData={resume.data as ResumeData} initialTitle={resume.title} resumeId={params.id}>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <BuilderHeader />
        <BuilderMain />
      </div>
    </BuilderProvider>
  )
}
