import { getPublicResumeById } from "@/actions/resumes"
import { PublicViewer } from "@/components/public/public-viewer"
import { notFound } from "next/navigation"

export default async function PublicResumePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const resume = await getPublicResumeById(params.id)

  if (!resume) {
    // Return a 404 if the resume doesn't exist or is not public
    notFound()
  }

  return (
    <div className="w-full h-screen bg-background">
      <PublicViewer initialData={resume.data} />
    </div>
  )
}
