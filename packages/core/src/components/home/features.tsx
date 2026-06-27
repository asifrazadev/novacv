"use client"

import { Cpu, Layout, Download, Shield, Puzzle, Zap, FileText, Timer, type LucideIcon } from "lucide-react"

interface Feature {
  icon: LucideIcon
  title: string
  desc: string
  badge?: string
}

const features: Feature[] = [
  {
    icon: Cpu,
    title: "AI Writing Suite",
    desc: "Rewrite bullets, generate summaries, tailor to job descriptions, build cover letters, and run a 6-second recruiter scan. All in one panel.",
    badge: "New"
  },
  {
    icon: Layout,
    title: "ATS Score & Gap Analysis",
    desc: "Instant ATS compatibility score with keyword gap analysis against any job description. Know exactly what's missing before you apply.",
  },
  {
    icon: Download,
    title: "Pixel-Perfect PDF Export",
    desc: "Server-side Playwright rendering captures your resume exactly as you see it. Supports A4, Letter, Legal, and custom page dimensions.",
  },
  {
    icon: Shield,
    title: "Security First",
    desc: "TOTP two-factor authentication, magic link sign-in, email verification, and self-service account deletion. Your data stays yours.",
    badge: "New"
  },
  {
    icon: Puzzle,
    title: "Browser Extension",
    desc: "Save jobs directly from LinkedIn, Indeed, and other boards into your Kanban tracker with one click. No copy-paste needed.",
  },
  {
    icon: Zap,
    title: "WYSIWYG Live Preview",
    desc: "Every change reflects instantly in the preview. What you see is exactly what downloads. No surprises in the final PDF.",
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    desc: "Paste a job description and get a tailored 3-paragraph cover letter woven from your actual resume achievements in seconds.",
    badge: "New"
  },
  {
    icon: Timer,
    title: "6-Second Recruiter Scan",
    desc: "AI simulates a recruiter's first-glance read of your resume, reporting first impressions, red flags, and a shortlist verdict.",
    badge: "New"
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <p className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3">What's inside</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Everything you need to land the role.</h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Not a template editor. A complete job-search toolkit powered by AI.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative rounded-2xl p-[1px] bg-border hover:bg-gradient-to-b hover:from-primary/50 hover:to-border transition-colors duration-500 overflow-hidden"
            >
              <div className="relative h-full bg-card/60 backdrop-blur-xl rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <f.icon className="w-4.5 h-4.5" />
                  </div>
                  {f.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {f.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1.5 text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
