"use client"

import * as React from "react"
import { Download, Cloud, ChevronDown, FileText, FileJson } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/ui/dropdown-menu"
import { useBuilder } from "@/components/builder/builder-context"
import { usePrintExport } from "@/hooks/usePrintExport"

interface ExportButtonProps {
  className?: string
  fullWidth?: boolean
  onExportSuccess?: () => void
}

export function ExportButton({ className, fullWidth, onExportSuccess }: ExportButtonProps) {
  const { resumeId, title, data } = useBuilder()
  const { isExporting, handleExportPDF, handleExportDocx, handleExportTxt, handleExportBackup } = usePrintExport(resumeId, title, data)

  const wrapExport = async (fn: () => Promise<unknown> | unknown) => {
    const success = await fn()
    if (success && onExportSuccess) {
      onExportSuccess()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id="tour-builder-export"
          size="sm"
          className={fullWidth ? "w-full gap-2" : `gap-2 bg-primary hover:bg-primary-dark text-primary-foreground min-w-[100px] border-none ${className}`}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Cloud className="h-4 w-4 animate-spin" />
              <span>{fullWidth ? "Exporting..." : "Generating..."}</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>{fullWidth ? "Export Resume" : "Export"}</span>
              {!fullWidth && <ChevronDown className="h-3 w-3 opacity-50" />}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={fullWidth ? "center" : "end"} className="w-48 bg-background border-border/50 shadow-lg">
        <DropdownMenuItem onClick={() => wrapExport(handleExportPDF)} className="gap-2">
          <FileText className="h-4 w-4 text-destructive" />
          <span>Export as PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => wrapExport(handleExportDocx)} className="gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span>Export as Word (.docx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => wrapExport(handleExportTxt)} className="gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>Export as Plain Text</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => wrapExport(() => handleExportBackup(".novacv"))} className="gap-2 border-t">
          <FileJson className="h-4 w-4 text-warning" />
          <span>Download Backup (.novacv)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => wrapExport(() => handleExportBackup(".json"))} className="gap-2">
          <FileJson className="h-4 w-4 text-muted-foreground" />
          <span>Download Backup (.json)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
