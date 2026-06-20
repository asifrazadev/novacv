"use client"

import Link from "next/link"
import { Star } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import { Github } from "@/components/home/github"

const GITHUB_URL = "https://github.com/asifrazadev/novacv"

export function OpenSourceCTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-[100%] blur-[100px] -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="relative rounded-3xl p-[1px] bg-border max-w-3xl mx-auto overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative bg-card/80 backdrop-blur-xl px-8 py-16 text-center rounded-[23px] flex flex-col items-center">
            
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
              <Github className="w-7 h-7" />
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight mb-4">Open source. Always.</h2>
            <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto leading-relaxed">
              NovaCV is MIT licensed. Star it, fork it, contribute to it. Built in public by Asif Raza.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_30%,transparent)]">
                <Link href="/register">Build your resume</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-lg border-border hover:bg-muted/50 font-semibold">
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <Star className="mr-2 w-4 h-4" />
                  Star on GitHub
                </a>
              </Button>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  )
}
