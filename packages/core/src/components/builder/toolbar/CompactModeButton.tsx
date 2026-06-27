"use client"

import { Minimize2 } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shared/ui/tooltip"
import { useBuilder } from "@/components/builder/builder-context"
import { toast } from "sonner"

export function CompactModeButton() {
  const { setData } = useBuilder()

  const applyCompact = () => {
    setData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        paginationCache: undefined,
        typography: {
          ...prev.metadata.typography,
          fontSize: 8.5,
          lineHeight: 1.3,
          nameSize: 20,
          headlineSize: 10,
          sectionTitleSize: 9,
        },
        page: {
          ...prev.metadata.page,
          padding: 12,
        },
        design: {
          ...prev.metadata.design,
          spacing: 0.7,
        },
      },
    }))
    toast.success("Compact layout applied. Adjust further in Design settings.")
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={applyCompact}
            className="h-8 w-8 p-0 border-border/40 hidden lg:flex text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Compact: shrink fonts &amp; margins to fit 1 page</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
