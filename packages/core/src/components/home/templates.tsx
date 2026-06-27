"use client"

import Link from "next/link"
import { Button } from "@/components/shared/ui/button"

interface Template {
  name: string
  image: string
  desc: string
  tag: string
}

const templates: Template[] = [
  {
    name: "Modern",
    image: "/thumbnails/modern.png",
    desc: "Two-column layout with a sidebar for skills, languages, and profiles.",
    tag: "Popular"
  },
  {
    name: "Professional",
    image: "/thumbnails/jake.png",
    desc: "Clean single-column design optimised for corporate and tech roles.",
    tag: "ATS-Safe"
  },
  {
    name: "Executive",
    image: "/thumbnails/executive.png",
    desc: "Skills-forward layout built for senior professionals and leadership roles.",
    tag: "Premium"
  },
  {
    name: "Academic",
    image: "/thumbnails/academic.png",
    desc: "Research-focused layout for publications, teaching history, and credentials.",
    tag: "Specialist"
  }
]

export function Templates() {
  return (
    <section id="templates" className="py-24 border-t border-border/40">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-14">
          <p className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3">Templates</p>
          <h2 className="text-3xl font-bold tracking-tight">Four templates. All open source.</h2>
          <p className="mt-2 text-muted-foreground text-sm max-w-md leading-relaxed">
            Each is a React component: readable, forkable, and extendable in minutes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {templates.map((t, i) => (
            <div
              key={i}
              className="group relative bg-background rounded-xl border border-border/60 overflow-hidden hover:border-primary/30 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_8%,transparent)] transition-all duration-300"
            >
              <div className="relative aspect-[3/4] bg-muted/20 overflow-hidden">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button asChild size="sm" className="rounded-md bg-foreground text-background hover:bg-foreground/90 text-xs font-semibold shadow-lg">
                    <Link href="/register">Use template</Link>
                  </Button>
                </div>
                <span className="absolute top-3 left-3 z-20 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/90 border border-border/60 text-muted-foreground">
                  {t.tag}
                </span>
              </div>
              <div className="px-4 py-3 bg-background border-t border-border/40">
                <h3 className="font-semibold text-sm text-foreground">{t.name}</h3>
                <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
