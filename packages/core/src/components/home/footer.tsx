"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Github } from "@/components/home/github"
import LogoIcon from "../shared/logo-icon"

const GITHUB_URL = "https://github.com/asifrazadev/novacv"

export function Footer() {
  return (
    <footer className="py-8 border-t border-border/40">
      <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <LogoIcon className="w-10 h-10" />
          <span>NovaCV</span>
          <span className="text-border">·</span>
          <span>MIT License</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4 sm:mt-0">
          <Link href="/privacy" className="hover:text-foreground p-1 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground p-1 transition-colors">
            Terms of Service
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground p-1 transition-colors flex items-center gap-1"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
          <Link href="/login" className="hover:text-foreground p-1 transition-colors">
            Sign in
          </Link>
          <a
            href="https://asifraza.site"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground p-1 transition-colors"
          >
            Built by Asif Raza
          </a>
        </div>
      </div>
    </footer>
  )
}
