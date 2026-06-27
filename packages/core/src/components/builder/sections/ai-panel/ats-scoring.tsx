"use client"

import * as React from "react"

import { CompletenessChecker } from "./completeness-checker"
import { AtsAnalyzer } from "./ats-analyzer"
import { JDTailor } from "./jd-tailor"

interface AtsScoringProps {
  getRenderedText: () => string
  wordCount: number
  charCount: number
}

export function AtsScoring({ getRenderedText, wordCount, charCount }: AtsScoringProps) {
  const [jobDescription, setJobDescription] = React.useState("")
  return (
    <div className="space-y-5 mt-4 animate-in fade-in duration-300">
      {/* Resume Statistics (Words & Characters) */}
      <div className="flex flex-wrap gap-3 mb-1">
        <div className="flex-1 min-w-[120px] p-3 border border-border/40 rounded-xl bg-muted/10 backdrop-blur-xs flex flex-col justify-center">
          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Resume Words</div>
          <div className="text-lg font-black text-foreground">{wordCount}</div>
        </div>
        <div className="flex-1 min-w-[120px] p-3 border border-border/40 rounded-xl bg-muted/10 backdrop-blur-xs flex flex-col justify-center">
          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Characters</div>
          <div className="text-lg font-black text-foreground">{charCount}</div>
        </div>
      </div>

      <CompletenessChecker wordCount={wordCount} />
      <AtsAnalyzer getRenderedText={getRenderedText} jobDescription={jobDescription} />
      <JDTailor getRenderedText={getRenderedText} jobDescription={jobDescription} setJobDescription={setJobDescription} />
    </div>
  )
}
