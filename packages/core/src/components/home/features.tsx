"use client"

import { Cpu, Layout, Download, Shield, Terminal, Zap, type LucideIcon } from "lucide-react"

interface Feature {
  icon: LucideIcon
  title: string
  desc: string
}

const features: Feature[] = [
  {
    icon: Cpu,
    title: "AI-Powered Writing",
    desc: "Generate and optimize bullet points instantly.",
  },
  {
    icon: Layout,
    title: "ATS-Optimized Templates",
    desc: "Clean layouts proven to pass automated parsers.",
  },
  {
    icon: Download,
    title: "Instant PDF Export",
    desc: "Pixel-perfect rendering with self-hosted fonts.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    desc: "Your data is private, secured by Supabase Auth.",
  },
  {
    icon: Terminal,
    title: "Modern Tech Stack",
    desc: "Built on Next.js 15, React 19, and Tailwind v4.",
  },
  {
    icon: Zap,
    title: "Live Preview",
    desc: "See your resume update instantly as you type.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Everything you need.</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            No bloated features. Just the essential tools to build a high-converting resume.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative rounded-2xl p-[1px] bg-border hover:bg-gradient-to-b hover:from-primary/50 hover:to-border transition-colors duration-500 overflow-hidden"
            >
              <div className="relative h-full bg-card/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-2 text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
