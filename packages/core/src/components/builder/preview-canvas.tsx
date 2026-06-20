"use client"

import * as React from "react"
import { useBuilder } from "@/components/builder/builder-context"
import { ResumePreview } from "@/components/builder/preview/ResumePreview"
import { ZoomSlider } from "@/components/builder/toolbar/ZoomSlider"

export function PreviewCanvas() {
  const { data, zoom } = useBuilder()
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return <div className="flex-1 bg-muted/20" />

  return (
    <div id="tour-builder-preview" className="flex-1 bg-muted/20 relative overflow-hidden flex flex-col h-full text-black">
      {/* Subtle grid background matching Home page */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />
      <div className="flex-1 overflow-auto scrollbar-hide z-10">
        <ResumePreview data={data} zoom={zoom} />
      </div>

      {/* Zoom Toolbar */}
      <ZoomSlider className="absolute lg:bottom-6 bottom-20 left-1/2 lg:-translate-x-1/2 -translate-x-1/2 z-20" />
    </div>
  )
}
