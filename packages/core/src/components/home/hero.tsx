"use client"

import Link from "next/link"
import { Zap } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import { ATSRing } from "@/components/shared/ui/ats-ring"

export function Hero() {
  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
      {/* Tech Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.06] -z-20" />

      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10 translate-y-[-50%] translate-x-[20%]" />

      <div className="container mx-auto px-6 max-w-8xl">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">

          {/* Left Column: Copy */}
          <div className="flex-1 flex flex-col items-start text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-muted/20 text-xs font-medium text-muted-foreground mb-8">
              <span className="flex h-2 w-2 rounded-full bg-success shadow-[0_0_8px_color-mix(in_srgb,var(--success)_80%,transparent)]" />
              NovaCV 2.0 is now live
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-foreground font-sans">
              AI Resumes that <br className="hidden sm:block" />
              <span className="text-primary">Beat ATS</span> and impress <br className="hidden sm:block" /> recruiters.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
              NovaCV uses AI to craft tailored, ATS-friendly resumes in minutes. Land the interview without spending the weekend wrestling with Word templates.
            </p>

            <div className="mt-10 w-full sm:w-auto">
              <Button size="lg" asChild className="w-full sm:w-auto h-14 px-8 rounded-xl text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:to-primary-dark hover:bg-primary-dark/70 text-primary-foreground shadow-[0_0_30px_color-mix(in_srgb,var(--primary)_35%,transparent)] hover:-translate-y-0.5 hover:shadow-[0_0_40px_color-mix(in_srgb,var(--primary)_50%,transparent)] transition-all duration-300">
                <Link href="/register">
                  Build my resume — free <Zap className="ml-2 w-5 h-5 fill-current" />
                </Link>
              </Button>
            </div>

            {/* Tiny Floating Badges */}
            <div className="mt-5 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/25 bg-primary/5 text-xs font-semibold text-primary select-none">
                MIT Licensed
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/40 text-xs font-medium text-muted-foreground select-none">
                Open Source
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-success/25 bg-success/5 text-xs font-semibold text-success select-none">
                10k+ Resumes
              </span>
            </div>

            {/* Social Proof */}
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#FFB3B3] border-2 border-background" />
                <div className="w-8 h-8 rounded-full bg-[#FFDF73] border-2 border-background" />
                <div className="w-8 h-8 rounded-full bg-[#85E0A3] border-2 border-background" />
                <div className="w-8 h-8 rounded-full bg-[#99C2FF] border-2 border-background" />
                <div className="w-8 h-8 rounded-full bg-[#C2B3FF] border-2 border-background" />
              </div>
              <p>
                <strong className="text-foreground font-semibold">10,000+ resumes built</strong> · 95% score above 80 on ATS
              </p>
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="flex-1 relative w-full flex justify-end lg:pr-8 group">
            <div className="relative w-full max-w-[550px] animate-in slide-in-from-right-8 duration-1000 ease-out">

              {/* Glow effect overlay */}
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 -z-10" />

              {/* Main Resume Paper */}
              <div className="w-full bg-card rounded-2xl border border-border group-hover:border-primary/30 shadow-[0_0_50px_color-mix(in_srgb,var(--primary)_10%,transparent)] p-8 flex flex-col gap-8 relative z-10 overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_60px_color-mix(in_srgb,var(--primary)_18%,transparent)]">

                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Alex Morgan</h2>
                    <p className="text-sm text-muted-foreground mt-1">Software Engineer · alex@novacv.app</p>
                  </div>
                  <div className="px-3 py-1.5 bg-primary/10 rounded-md text-[10px] font-bold text-primary tracking-widest border border-primary/20">
                    NOVACV
                  </div>
                </div>

                <div className="w-full h-px bg-border my-[-10px]" />

                {/* Experience Section */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[11px] font-bold text-primary tracking-widest uppercase">Experience</h3>
                  <div>
                    <h4 className="text-[15px] font-bold text-foreground">Frontend Engineer · Vercel</h4>
                    <p className="text-xs text-muted-foreground mt-1">2024 – Present</p>
                  </div>
                  <div className="flex flex-col gap-2.5 mt-1">
                    <div className="w-full h-2.5 bg-muted rounded-full" />
                    <div className="w-[85%] h-2.5 bg-muted rounded-full" />
                    <div className="w-[70%] h-2.5 bg-muted rounded-full" />
                  </div>
                </div>

                {/* Education Section */}
                <div className="flex flex-col gap-4 mt-2">
                  <h3 className="text-[11px] font-bold text-primary tracking-widest uppercase">Education</h3>
                  <div className="flex flex-col gap-2.5 mt-1">
                    <div className="w-[90%] h-2.5 bg-muted rounded-full" />
                    <div className="w-[60%] h-2.5 bg-muted rounded-full" />
                  </div>
                </div>

                {/* Skills Section */}
                <div className="flex flex-col gap-4 mt-2 mb-4">
                  <h3 className="text-[11px] font-bold text-primary tracking-widest uppercase">Skills</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {["React", "TypeScript", "Node", "Figma", "GraphQL"].map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-muted border border-border/50 rounded-md text-[13px] font-medium text-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* ATS Score Ring Component Overlay */}
              <div className="absolute -bottom-8 -right-4 sm:-right-12 z-20 bg-card border border-border rounded-2xl p-3 shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom duration-700 delay-300 group-hover:border-primary/20 transition-colors duration-500">
                <div className="relative">
                  <div className="absolute flex justify-center items-center inset-0 rounded-full shadow-[0_0_10px_color-mix(in_srgb,var(--success)_30%,transparent)] bg-transparent animate-pulse" />
                  <ATSRing score={94} size={90} strokeWidth={6} />
                </div>
                <div className="space-y-1 pr-2">
                  <p className="text-xs text-muted-foreground tracking-wide">ATS Score</p>
                  <h3 className="font-bold text-success text-base">Excellent</h3>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
