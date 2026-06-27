"use client"

import * as React from "react"
import { Plus, FileUp, Sparkles, ArrowUpRight, Briefcase, FilePlus, Zap } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/shared/ui/card"
import { CreateResumeDialog } from "@/components/dashboard/create-resume-dialog"
import { ImportResumeDialog } from "@/components/dashboard/import-resume-dialog"
import { LinkedInSyncDialog } from "@/components/dashboard/linkedin-sync-dialog"
import { getResumes } from "@/actions/resumes"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ResumeCardOptions } from "@/components/dashboard/resume-card-options"
import { WelcomeGuide } from "@/components/shared/ui/welcome-guide"

const DASHBOARD_FEATURES = [
  {
    icon: <FilePlus className="w-5 h-5" />,
    title: "Create Limitless Resumes",
    description: "Start from scratch or import your existing data to create beautifully designed resumes tailored to specific roles."
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    title: "Job Application Tracker",
    description: "Use the built-in Kanban board to track your applications, interviews, and offers all in one place."
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "AI-Powered Assistance",
    description: "Generate summaries, rewrite bullet points, and get smart skill suggestions right inside the builder."
  }
]

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className || "w-4 h-4"} fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  )
}

export function DashboardClient({ initialResumes }: { initialResumes: any[] }) {
  const [createOpen, setCreateOpen] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)
  const [linkedinOpen, setLinkedinOpen] = React.useState(false)
  const [tourOpen, setTourOpen] = React.useState(false)
  const [resumes, setResumes] = React.useState<any[]>(initialResumes)
  const [isLoading, setIsLoading] = React.useState(false)

  const loadResumes = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getResumes()
      setResumes(data)
    } catch (error) {
      console.error("Failed to load resumes:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      <WelcomeGuide
        storageKey="nova_guide_dashboard"
        title="Welcome to NovaCV"
        description="Your professional resume and application suite. Here's what you can do:"
        features={DASHBOARD_FEATURES}
        open={tourOpen}
        onOpenChange={setTourOpen}
      />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-primary text-primary-foreground border border-primary/20">
              <Sparkles className="w-3 h-3 animate-pulse" />
              AI Assistant Ready
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            Resume Dashboard
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Create, import, or manage your resumes using real-time AI guidance and export pixel-perfect PDFs instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTourOpen(true)}
            className="h-8 text-xs gap-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border/40 font-medium cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Replay Tour
          </Button>
        </div>
      </div>

      {/* OPTIONS GRID */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Option 1: Create fresh */}
        <Card
          onClick={() => setCreateOpen(true)}
          id="tour-create-scratch"
          className="group relative flex flex-col justify-between overflow-hidden border border-border/40 hover:border-border/80 hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/40 backdrop-blur-sm p-5"
        >
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-lg bg-foreground/5 dark:bg-foreground/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Plus className="w-5 h-5 text-foreground" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">Create from scratch</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Build your resume step-by-step with interactive layout modules and custom AI advice.
              </CardDescription>
            </div>
          </div>
          <div className="mt-5">
            <Button
              variant="outline"
              className="w-full justify-between h-9 rounded-md border-border/80 text-xs font-normal hover:bg-muted/50 transition-colors"
            >
              Start fresh
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>

        {/* Option 2: Import Resume */}
        <Card
          onClick={() => setImportOpen(true)}
          id="tour-import-resume"
          className="group relative flex flex-col justify-between overflow-hidden border border-border/40 hover:border-border/80 hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/40 backdrop-blur-sm p-5"
        >
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-lg bg-foreground/5 dark:bg-foreground/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <FileUp className="w-5 h-5 text-foreground" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">Import existing resume</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Upload a PDF or JSON resume. Our intelligence will parse, map, and structure your experience.
              </CardDescription>
            </div>
          </div>
          <div className="mt-5">
            <Button
              variant="outline"
              className="w-full justify-between h-9 rounded-md border-border/80 text-xs font-normal hover:bg-muted/50 transition-colors"
            >
              Upload file
              <FileUp className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>

        {/* Option 3: LinkedIn Sync */}
        <Card
          onClick={() => setLinkedinOpen(true)}
          className="group relative flex flex-col justify-between overflow-hidden border border-border/40 hover:border-border/80 hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/40 backdrop-blur-sm p-5"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-lg bg-foreground/5 dark:bg-foreground/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <LinkedInIcon className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-[9px] font-mono text-muted-foreground border border-border/60 rounded px-1.5 py-0.5 uppercase tracking-wider bg-background">
                Soon
              </span>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">Import from LinkedIn</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Sync your complete work history, certifications, and skills profile directly into templates.
              </CardDescription>
            </div>
          </div>
          <div className="mt-5">
            <Button
              variant="outline"
              disabled
              className="w-full justify-between h-9 rounded-md border-border/80 text-xs font-normal opacity-60 cursor-not-allowed"
            >
              Sync profile
              <LinkedInIcon className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Dialogs */}
      <CreateResumeDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ImportResumeDialog open={importOpen} onOpenChange={setImportOpen} />
      <LinkedInSyncDialog open={linkedinOpen} onOpenChange={setLinkedinOpen} />

      {/* RECENT WORK SECTION */}
      <div className="space-y-5" id="tour-recent-resumes">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground/90">Recent Resumes</h2>
          <span className="text-xs font-mono text-muted-foreground">
            {resumes.length} {resumes.length === 1 ? "document" : "documents"}
          </span>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse bg-muted/20 h-48 border border-border/40" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-border/40 bg-card/10 hover:bg-card/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mb-3 text-muted-foreground">
              <FileUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground/80 mb-1">No resumes created yet</h3>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Start by choosing one of the methods above to generate your first professional resume document.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {resumes.map((resume) => (
              <Card key={resume.id} className="group relative overflow-hidden border border-border/40 hover:border-border/80 hover:shadow-md transition-all duration-300 bg-card/20 backdrop-blur-sm flex flex-col justify-between rounded-xl">

                {/* Simulated preview thumbnail container */}
                <div className="h-32 bg-muted/20 dark:bg-muted/10 relative flex items-center justify-center overflow-hidden border-b border-border/40 p-4">
                  <div className="w-20 h-28 bg-background shadow-md rounded-sm border border-border/40 p-2 flex flex-col gap-1.5 transition-transform duration-300 group-hover:scale-[1.03] select-none">
                    <div className="w-full h-1.5 bg-primary/20 rounded-xs" />
                    <div className="w-3/4 h-1 bg-muted rounded-xs" />
                    <div className="w-1/2 h-1 bg-muted rounded-xs" />
                    <div className="mt-1 w-full h-0.5 bg-muted/40 rounded-xs" />
                    <div className="w-full h-0.5 bg-muted/40 rounded-xs" />
                    <div className="w-3/4 h-0.5 bg-muted/40 rounded-xs" />
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {resume.title}
                      </h3>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        Edited {formatDistanceToNow(new Date(resume.updatedAt))} ago
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ResumeCardOptions
                        resumeId={resume.id}
                        resumeTitle={resume.title}
                        onDeleteSuccess={loadResumes}
                        onDuplicateSuccess={loadResumes}
                      />
                    </div>
                  </div>

                  <Button asChild className="w-full h-9 rounded-md text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors">
                    <Link href={`/dashboard/resumes/${resume.id}`} className="flex items-center justify-center gap-1.5">
                      Edit Resume
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
