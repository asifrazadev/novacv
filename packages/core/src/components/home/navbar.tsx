"use client"

import Link from "next/link"
import { Sparkles, LayoutDashboard } from "lucide-react"
import { ThemeToggle } from "@/components/shared/theme/theme-toggle"
import { Button } from "@/components/shared/ui/button"
import { Badge } from "@/components/shared/ui/badge"
import { Github } from "@/components/home/github"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

const GITHUB_URL = "https://github.com/asifrazadev/novacv"

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border/40">
      <div className="container mx-auto px-3 md:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center p-1.5 bg-primary rounded-lg shadow-md shadow-primary/10 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">
            NovaCV<span className="text-primary">.</span>
          </span>
          <Badge
            variant="outline"
            className="text-[10px] hidden md:block font-mono px-1.5 py-0 border-border/60 text-muted-foreground rounded-sm ml-1"
          >
            v0.2 beta
          </Badge>
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

          {!loading && (
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
