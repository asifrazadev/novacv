"use client"

import * as React from "react"
import { useBuilder } from "@/components/builder/builder-context"
import { ResumeData } from "@/types/resume"

function extractResumeText(data: ResumeData): string {
  const parts = []
  parts.push(`Name: ${data.basics.name}`)
  parts.push(`Headline: ${data.basics.headline}`)
  parts.push(`Summary: ${(data.sections.summary?.content || "").replace(/<[^>]*>?/gm, '')}`)
  
  parts.push(`\nEXPERIENCE:`)
  data.sections.experience.forEach(e => {
    parts.push(`- ${e.position} at ${e.company} (${e.startDate} - ${e.endDate || 'Present'})`)
    parts.push(`  ${(e.description || "").replace(/<[^>]*>?/gm, '')}`)
  })

  parts.push(`\nEDUCATION:`)
  data.sections.education.forEach(e => {
    parts.push(`- ${e.degree} in ${e.areaOfStudy} at ${e.school}`)
  })
  
  parts.push(`\nSKILLS:`)
  parts.push(data.sections.skills.map(s => s.name).join(", "))
  
  return parts.join("\n")
}

export function StatisticsSection() {
  const { data } = useBuilder()
  
  const text = extractResumeText(data)
  const charCount = text.length
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  // Helper to format numbers (e.g. 1200 -> 1.2k)
  const formatNum = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "k"
    return num.toString()
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-border/40 rounded-xl bg-muted/10">
          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Words</div>
          <div className="text-2xl font-black">{formatNum(wordCount)}</div>
        </div>
        <div className="p-4 border border-border/40 rounded-xl bg-muted/10">
          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Characters</div>
          <div className="text-2xl font-black">{formatNum(charCount)}</div>
        </div>
      </div>
    </div>
  )
}
