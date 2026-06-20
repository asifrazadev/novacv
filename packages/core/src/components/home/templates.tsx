"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/shared/ui/button"

interface Template {
  name: string
  image: string
  desc: string
}

const templates: Template[] = [
  {
    name: "Modern",
    image: "/thumbnails/modern.png",
    desc: "Two-column layout with a professional sidebar."
  },
  {
    name: "Classic",
    image: "/thumbnails/jake.png",
    desc: "Single-column design for traditional industries."
  },
  {
    name: "Executive",
    image: "/thumbnails/executive.png",
    desc: "Refined layout for senior professionals."
  }
]

export function Templates() {
  return (
    <section id="templates" className="py-24 border-t border-border/40">
      <div className="container mx-auto px-6">
        <div className="mb-14">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Templates</p>
          <h2 className="text-3xl font-bold tracking-tight">Three templates. All open source.</h2>
          <p className="mt-2 text-muted-foreground text-sm max-w-md">
            Each is a React component. Add your own in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {templates.map((t, i) => (
            <div
              key={i}
              className="group relative bg-background rounded-xl border border-border/60 overflow-hidden hover:border-border transition-colors"
            >
              <div className="aspect-[3/4] bg-muted/20 overflow-hidden">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button asChild size="sm" className="rounded-md bg-foreground text-background hover:bg-foreground/90 text-xs">
                    <Link href="/register">Use template</Link>
                  </Button>
                </div>
              </div>
              <div className="px-4 py-4 z-15 bg-background relative border-t border-border/40">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{t.name}</h3>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
