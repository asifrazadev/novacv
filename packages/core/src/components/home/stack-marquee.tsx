import { useEffect, useRef, useState } from "react"

const stack = [
  "Next.js", "PostgreSQL", "Tailwind CSS",
  "TypeScript", "React", "Zustand", "Vercel AI SDK",
  "Playwright", "Zod", "Shadcn UI", "Radix UI"
]

function Pill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-md border border-border/50 bg-muted/30 text-xs font-mono text-muted-foreground shrink-0">
      {label}
    </span>
  )
}

export function StackMarquee() {
  const outerRef = useRef<HTMLDivElement>(null)
  const firstTrackRef = useRef<HTMLDivElement>(null)
  const [copies, setCopies] = useState(2)

  useEffect(() => {
    const outer = outerRef.current
    const track = firstTrackRef.current
    if (!outer || !track) return

    const trackW = track.getBoundingClientRect().width
    const outerW = outer.getBoundingClientRect().width

    // Fill the container width, plus 1 extra for seamless wrap
    setCopies(Math.ceil(outerW / trackW) + 1)
  }, [])

  return (
    <section id="stack" className="py-10 border-y border-border/40">
      <div ref={outerRef} className="relative flex overflow-hidden">

        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

        {Array.from({ length: copies }).map((_, i) => (
          <div
            key={i}
            ref={i === 0 ? firstTrackRef : undefined}
            aria-hidden={i > 0}
            className="flex shrink-0 gap-2 pr-2 animate-[marquee_24s_linear_infinite] will-change-transform"
          >
            {stack.map((s, j) => <Pill key={j} label={s} />)}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }
      `}</style>
    </section>
  )
}