"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/shared/theme/theme-toggle"
import { Button } from "@/components/shared/ui/button"
import { GitHubIcon } from "./icons"
import TextLogo from "@/components/shared/logotext"

const defaultStack = [
  "Next.js", "PostgreSQL", "Tailwind CSS",
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
    <div>
      <div className="flex items-center justify-between px-2 md:px-8 py-4 border-b border-border/40">
        <TextLogo className=" w-32 h-11" />
        <div className="ml-auto flex items-center gap-3">
          {alternateText && alternateLink && alternateLinkLabel && (
            <>
              <span className=" hidden md:block text-xs text-muted-foreground">{alternateText}</span>
              <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-md border-border/80 px-4">
                <Link href={alternateLink}>{alternateLinkLabel}</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>

      <div className="min-h-screen grid md:grid-cols-2 bg-background font-sans">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-muted/30 border-r border-border/40">
          {/* Tagline + chips */}
          <div></div>
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
            className="flex items-center align-baseline gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <GitHubIcon />
            github.com/asifraza/novacv
          </a>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col">
          {/* Top bar */}


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
