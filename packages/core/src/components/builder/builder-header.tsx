"use client"

import * as React from "react"
import Link from "next/link"
import { Cloud, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import TextLogo from "@/components/shared/logotext"
import LogoIcon from "@/components/shared/logo-icon"
import { useBuilder } from "@/components/builder/builder-context"
import { Separator } from "@/components/shared/ui/separator"
import { cn } from "@/lib/utils"
import { ShareButton } from "@/components/builder/toolbar/ShareButton"
import { ExportButton } from "@/components/builder/toolbar/ExportButton"
import { CompactModeButton } from "@/components/builder/toolbar/CompactModeButton"
import { ImportDialog } from "@/components/builder/import-dialog"
import { MobileBuilderNav } from "@/components/builder/mobile-nav"

export function BuilderHeader() {
  const { title, setTitle, isSaving, setTourOpen } = useBuilder()

  return (
    <header className="h-14 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm border-border/40">
      <div className="flex items-center gap-4">
        <MobileBuilderNav />
        <Link href="/dashboard" className="flex items-center gap-2 group mr-1">
          <LogoIcon className="w-7 h-7 sm:hidden" />
          <TextLogo className="w-28 h-10 hidden sm:block" />
        </Link>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2 text-sm max-w-[150px] sm:max-w-none">
          <input
            value={title || ""}
            onChange={(e) => setTitle(e.target.value)}
            className="font-semibold bg-transparent border-none focus:ring-1 focus:ring-primary/20 focus:outline-none focus:bg-muted/40 rounded px-2 py-0.5 -ml-1 hover:bg-muted/20 transition-all w-full text-sm"
            placeholder="No Title"
          />

          <div className="hidden sm:flex items-center gap-1.5 ml-4 px-2 py-0.5 rounded-full bg-muted/50 text-[11px] font-medium text-muted-foreground shrink-0 border border-border/40">
            {isSaving ? (
              <>
                <Cloud className="w-3 h-3 animate-pulse text-primary" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-success" />
                <span>Saved</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTourOpen(true)}
          className="h-8 text-xs gap-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border/40 font-medium cursor-pointer hidden md:flex"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Tour</span>
        </Button>

        <div className="hidden lg:flex items-center gap-2">
          <CompactModeButton />
          <ImportDialog />
          <ShareButton />
        </div>
        <ExportButton className="hidden lg:flex" />
      </div>
    </header>
  )
}
