"use client"

import * as React from "react"
import { ZoomIn, ZoomOut, Maximize } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import { Separator } from "@/components/shared/ui/separator"
import { useBuilder } from "@/components/builder/builder-context"

interface ZoomSliderProps {
  className?: string
}

export function ZoomSlider({ className }: ZoomSliderProps) {
  const { zoom, setZoom } = useBuilder()

  return (
    <div className={`bg-background/80 text-foreground backdrop-blur-md border rounded-full px-4 h-10 flex items-center gap-4 shadow-xl ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setZoom(Math.max(25, zoom - 10))}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-xs font-medium min-w-[3ch]">{zoom}%</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setZoom(Math.min(200, zoom + 10))}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-4" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setZoom(100)}
      >
        <Maximize className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
