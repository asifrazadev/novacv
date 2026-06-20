"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ATSRingProps {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ATSRing({ score, size = 120, strokeWidth = 8, className }: ATSRingProps) {
  const radius = (size - strokeWidth - 12) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference

  // Decide color based on score
  const isExcellent = score >= 80
  const isGood = score >= 60 && score < 80

  const strokeColor = isExcellent
    ? "text-success"
    : isGood
      ? "text-warning"
      : "text-destructive"

  const glowEffect = isExcellent ? "drop-shadow-[0_0_3px_var(--success)]" : ""

  return (
    <div className={cn("relative  flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Background Track */}
      <svg className="absolute inset-0  transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted/30"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius - 12}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Track */}
        <circle
          className={cn(strokeColor, glowEffect, "transition-all duration-1000 ease-out")}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn("font-bold tracking-tighter", isExcellent ? "text-foreground" : "text-foreground/80")} style={{ fontSize: (size - 10) * 0.28 }}>
          {score}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">
          ATS
        </span>
      </div>
    </div>
  )
}
