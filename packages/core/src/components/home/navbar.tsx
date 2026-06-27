"use client"

import Link from "next/link"
import { LayoutDashboard } from "lucide-react"
import { ThemeToggle } from "@/components/shared/theme/theme-toggle"
import { Button } from "@/components/shared/ui/button"
import { Github } from "@/components/home/github"
import { useSession } from "next-auth/react"
import TextLogo from "../shared/logotext"

const GITHUB_URL = "https://github.com/asifrazadev/novacv"
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== "false"

export function Navbar() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const user = session?.user

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border/40">
      <div className="container mx-auto px-3 md:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 group">
          <Link href={user || !AUTH_ENABLED ? "/dashboard" : "/"}>
            <TextLogo className="w-32 md:w-40 hover:opacity-90 transition-opacity" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground p-1 transition-colors">
            Features
          </a>
          <a href="#templates" className="hover:text-foreground p-1 transition-colors">
            Templates
          </a>
          <a href="#stack" className="hover:text-foreground p-1 transition-colors">
            Stack
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 p-1 hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {!AUTH_ENABLED ? (
            <Button asChild size="sm" className="rounded-md h-8 text-xs px-2 md:px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold ml-1">
              <Link href="/dashboard">
                <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                Dashboard
              </Link>
            </Button>
          ) : !loading && (
            user ? (
              <Button asChild size="sm" className="rounded-md h-8 text-xs px-2 md:px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold ml-1">
                <Link href="/dashboard">
                  <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost" className="rounded-md h-8 text-xs px-2 md:px-4">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="rounded-md h-8 text-xs px-2 md:px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  <Link href="/register">Get started</Link>
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  )
}
