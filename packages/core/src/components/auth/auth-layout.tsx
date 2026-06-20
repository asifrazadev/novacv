"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/shared/theme/theme-toggle"
import { Button } from "@/components/shared/ui/button"
import { GitHubIcon } from "./icons"

const defaultStack = [
  "Next.js", "Supabase", "PostgreSQL", "Tailwind CSS",
  "TypeScript", "React", "Zustand", "Vercel AI SDK",
  "Playwright", "Zod", "Shadcn UI", "Radix UI"
]

const GITHUB_URL = "https://github.com/asifrazadev/novacv"

interface AuthLayoutProps {
  children: React.ReactNode
  welcomeLabel?: string
  title: string
  subtitle: string
  alternateText?: string
  alternateLink?: string
  alternateLinkLabel?: string
}

export function AuthLayout({
  children,
  welcomeLabel = "Welcome back",
  title,
  subtitle,
  alternateText,
  alternateLink,
  alternateLinkLabel
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background font-sans">
      {/* LEFT PANEL */}
      <div className="hidden md:flex flex-col justify-between p-10 bg-muted/30 border-r border-border/40">
        <div className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center p-1.5 bg-primary rounded-lg shadow-md shadow-primary/10 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">
            NovaCV<span className="text-primary">.</span>
          </span>
          <span className="text-[10px] font-mono text-muted-foreground border border-border/50 rounded-sm px-1.5 py-0.5 ml-1">
            v0.2 beta
          </span>
        </div>

        {/* Tagline + chips */}
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            <span className="text-foreground font-medium">AI-powered resume builder.</span>{" "}
            Real-time preview, ATS-friendly templates, and instant PDF export. Free and open source.
          </p>
          <div className="flex flex-wrap gap-2">
            {defaultStack.map((s) => (
              <span
                key={s}
                className="text-[11px] font-mono text-muted-foreground border border-border/40 rounded px-2 py-0.5"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* GitHub link */}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <GitHubIcon />
          github.com/asifraza/novacv
        </a>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-border/40">
          <Link href="/" className="flex items-center gap-2 group md:hidden">
            <div className="relative flex items-center justify-center p-1.5 bg-primary rounded-lg shadow-md shadow-primary/10 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">
              NovaCV<span className="text-primary">.</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            {alternateText && alternateLink && alternateLinkLabel && (
              <>
                <span className="text-xs text-muted-foreground">{alternateText}</span>
                <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-md border-border/80 px-4">
                  <Link href={alternateLink}>{alternateLinkLabel}</Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1">
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
                {welcomeLabel}
              </p>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border/40" />
      <span className="text-[11px] font-mono text-muted-foreground">or</span>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  )
}
