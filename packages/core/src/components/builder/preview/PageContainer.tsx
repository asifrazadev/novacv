"use client"

import * as React from "react"
import { ResumeData } from "@/types/resume"
import { PageContent } from "@/templates/modern"

interface PageContainerProps {
  index: number
  widthMm: number
  heightMm: number
  widthPx: number
  heightPx: number
  paddingPx: number
  zoom: number
  SelectedTemplate: React.ComponentType<{ data: ResumeData; content?: PageContent }> | null
  data: ResumeData
  content: PageContent
}

export function PageContainer({
  index,
  widthPx,
  heightPx,
  paddingPx,
  zoom,
  SelectedTemplate,
  data,
  content,
}: PageContainerProps) {
  return (
    <div className="relative group">
      <div className="absolute -left-12 top-4 text-[10px] font-bold text-muted-foreground uppercase vertical-text opacity-20 group-hover:opacity-100 transition-opacity">
        Page {index + 1}
      </div>
      <div
        className="bg-white shadow-2xl relative ring-1 ring-black/5 overflow-hidden transition-all mx-auto break-words"
        style={{
          width: `${widthPx * (zoom / 100)}px`,
          height: `${heightPx * (zoom / 100)}px`,
        }}
      >
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top left",
            width: `${widthPx}px`,
            height: `${heightPx}px`,
            padding: `${paddingPx}px`,
          }}
        >
          {SelectedTemplate && <SelectedTemplate data={data} content={content} />}
        </div>
      </div>
    </div>
  )
}
