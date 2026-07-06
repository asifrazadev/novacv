"use client"

import Link from "next/link"
import { Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import { Github } from "@/components/home/github"

const GITHUB_URL = "https://github.com/asifrazadev/novacv"

export function OpenSourceCTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-[100%] blur-[100px] -z-10" />

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="relative rounded-3xl p-[1px] bg-border max-w-4xl mx-auto overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative bg-card/80 backdrop-blur-xl px-8 py-16 rounded-[23px]">

            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 text-left">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 text-primary">
                  <Github className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-3">Open source. Always.</h2>
                <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
                  NovaCV is MIT licensed. Self-host it, fork it, extend it. Use local Ollama models to keep your data fully private.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_30%,transparent)]">
                    <Link href="/register">
                      Get started free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-lg border-border hover:bg-muted/50 font-semibold gap-2">
                    <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                      <Star className="w-4 h-4" />
                      Star on GitHub
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">No credit card required · MIT License · Self-hostable</p>
              </div>

              <div className="flex-shrink-0 grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "AI Providers", value: "6+" },
                  { label: "Templates", value: "5" },
                  { label: "Export Formats", value: "Multiple" },
                  { label: "License", value: "MIT" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/60 bg-muted/20 min-w-[100px]">
                    <span className="text-2xl font-black text-foreground">{item.value}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
